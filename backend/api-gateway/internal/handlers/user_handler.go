package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	userv1 "github.com/ec-recommend/api-gateway/proto/user/v1"
	"github.com/gorilla/mux"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type UserHandler struct {
	userClient userv1.UserServiceClient
}

func NewUserHandler(conn *grpc.ClientConn) *UserHandler {
	return &UserHandler{
		userClient: userv1.NewUserServiceClient(conn),
	}
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email       string `json:"email"`
		Username    string `json:"username"`
		DisplayName string `json:"displayName"`
		Language    string `json:"language"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	userID := r.Header.Get("X-User-ID")
	
	grpcReq := &userv1.CreateUserRequest{
		Email:       req.Email,
		Username:    req.Username,
		DisplayName: req.DisplayName,
		Language:    req.Language,
		UserId:      userID,
	}
	
	resp, err := h.userClient.CreateUser(context.Background(), grpcReq)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	
	writeJSONResponse(w, http.StatusCreated, convertProtoUserToJSON(resp.User))
}

func (h *UserHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		http.Error(w, "User ID not found in header", http.StatusUnauthorized)
		return
	}
	
	grpcReq := &userv1.GetCurrentUserRequest{
		UserId: userID,
	}
	
	resp, err := h.userClient.GetCurrentUser(context.Background(), grpcReq)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	
	writeJSONResponse(w, http.StatusOK, convertProtoUserToJSON(resp.User))
}

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]
	
	grpcReq := &userv1.GetUserRequest{
		UserId: userID,
	}
	
	resp, err := h.userClient.GetUser(context.Background(), grpcReq)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	
	writeJSONResponse(w, http.StatusOK, convertProtoUserToJSON(resp.User))
}

func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]
	
	requestUserID := r.Header.Get("X-User-ID")
	if requestUserID != userID {
		http.Error(w, "Cannot update other user's profile", http.StatusForbidden)
		return
	}
	
	var updates map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	fields := &userv1.UpdateUserFields{}
	if v, ok := updates["displayName"].(string); ok {
		fields.DisplayName = &v
	}
	if v, ok := updates["bio"].(string); ok {
		fields.Bio = &v
	}
	if v, ok := updates["profilePicture"].(string); ok {
		fields.ProfilePicture = &v
	}
	if v, ok := updates["phoneNumber"].(string); ok {
		fields.PhoneNumber = &v
	}
	if v, ok := updates["dateOfBirth"].(string); ok {
		fields.DateOfBirth = &v
	}
	if v, ok := updates["gender"].(string); ok {
		fields.Gender = &v
	}
	if v, ok := updates["language"].(string); ok {
		fields.Language = &v
	}
	if v, ok := updates["country"].(string); ok {
		fields.Country = &v
	}
	
	grpcReq := &userv1.UpdateUserRequest{
		UserId: userID,
		Fields: fields,
	}
	
	resp, err := h.userClient.UpdateUser(context.Background(), grpcReq)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	
	writeJSONResponse(w, http.StatusOK, convertProtoUserToJSON(resp.User))
}

func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]
	
	requestUserID := r.Header.Get("X-User-ID")
	if requestUserID != userID {
		http.Error(w, "Cannot delete other user's profile", http.StatusForbidden)
		return
	}
	
	grpcReq := &userv1.DeleteUserRequest{
		UserId: userID,
	}
	
	_, err := h.userClient.DeleteUser(context.Background(), grpcReq)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

func (h *UserHandler) GetUserPreferences(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]
	
	requestUserID := r.Header.Get("X-User-ID")
	if requestUserID != userID {
		http.Error(w, "Cannot access other user's preferences", http.StatusForbidden)
		return
	}
	
	grpcReq := &userv1.GetUserPreferencesRequest{
		UserId: userID,
	}
	
	resp, err := h.userClient.GetUserPreferences(context.Background(), grpcReq)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	
	writeJSONResponse(w, http.StatusOK, convertProtoPreferencesToJSON(resp.Preferences))
}

func (h *UserHandler) UpdateUserPreferences(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]
	
	requestUserID := r.Header.Get("X-User-ID")
	if requestUserID != userID {
		http.Error(w, "Cannot update other user's preferences", http.StatusForbidden)
		return
	}
	
	var prefs struct {
		EmailNotifications   bool     `json:"emailNotifications"`
		PushNotifications    bool     `json:"pushNotifications"`
		NewsletterSubscribed bool     `json:"newsletterSubscribed"`
		PreferredCategories  []string `json:"preferredCategories"`
		Currency             string   `json:"currency"`
		Theme                string   `json:"theme"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&prefs); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	grpcReq := &userv1.UpdateUserPreferencesRequest{
		UserId: userID,
		Preferences: &userv1.UserPreferences{
			UserId:               userID,
			EmailNotifications:   prefs.EmailNotifications,
			PushNotifications:    prefs.PushNotifications,
			NewsletterSubscribed: prefs.NewsletterSubscribed,
			PreferredCategories:  prefs.PreferredCategories,
			Currency:             prefs.Currency,
			Theme:                prefs.Theme,
		},
	}
	
	_, err := h.userClient.UpdateUserPreferences(context.Background(), grpcReq)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	
	writeJSONResponse(w, http.StatusOK, map[string]string{"message": "Preferences updated successfully"})
}

// Helper functions
func handleGRPCError(w http.ResponseWriter, err error) {
	st, ok := status.FromError(err)
	if !ok {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	
	switch st.Code() {
	case codes.NotFound:
		http.Error(w, st.Message(), http.StatusNotFound)
	case codes.InvalidArgument:
		http.Error(w, st.Message(), http.StatusBadRequest)
	case codes.AlreadyExists:
		http.Error(w, st.Message(), http.StatusConflict)
	case codes.PermissionDenied:
		http.Error(w, st.Message(), http.StatusForbidden)
	case codes.Unauthenticated:
		http.Error(w, st.Message(), http.StatusUnauthorized)
	default:
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	}
}

func writeJSONResponse(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

func convertProtoUserToJSON(user *userv1.User) map[string]interface{} {
	result := map[string]interface{}{
		"userId":      user.UserId,
		"email":       user.Email,
		"username":    user.Username,
		"displayName": user.DisplayName,
		"language":    user.Language,
		"isActive":    user.IsActive,
		"isVerified":  user.IsVerified,
		"createdAt":   user.CreatedAt.AsTime().Format("2006-01-02T15:04:05Z"),
		"updatedAt":   user.UpdatedAt.AsTime().Format("2006-01-02T15:04:05Z"),
	}
	
	if user.ProfilePicture != "" {
		result["profilePicture"] = user.ProfilePicture
	}
	if user.Bio != "" {
		result["bio"] = user.Bio
	}
	if user.PhoneNumber != "" {
		result["phoneNumber"] = user.PhoneNumber
	}
	if user.DateOfBirth != "" {
		result["dateOfBirth"] = user.DateOfBirth
	}
	if user.Gender != "" {
		result["gender"] = user.Gender
	}
	if user.Country != "" {
		result["country"] = user.Country
	}
	if user.LastLoginAt != nil {
		result["lastLoginAt"] = user.LastLoginAt.AsTime().Format("2006-01-02T15:04:05Z")
	}
	
	return result
}

func convertProtoPreferencesToJSON(prefs *userv1.UserPreferences) map[string]interface{} {
	return map[string]interface{}{
		"userId":               prefs.UserId,
		"emailNotifications":   prefs.EmailNotifications,
		"pushNotifications":    prefs.PushNotifications,
		"newsletterSubscribed": prefs.NewsletterSubscribed,
		"preferredCategories":  prefs.PreferredCategories,
		"currency":             prefs.Currency,
		"theme":                prefs.Theme,
	}
}