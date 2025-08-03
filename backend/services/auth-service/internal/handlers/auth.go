package handlers

import (
	"net/http"
	"os"

	"github.com/ec-recommend/auth-service/internal/cognito"
	"github.com/ec-recommend/auth-service/internal/jwt"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	cognitoClient *cognito.Client
	jwtValidator  *jwt.Validator
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

func NewAuthHandler() (*AuthHandler, error) {
	userPoolID := os.Getenv("COGNITO_USER_POOL_ID")
	clientID := os.Getenv("COGNITO_CLIENT_ID")
	region := os.Getenv("AWS_REGION")

	if userPoolID == "" || clientID == "" || region == "" {
		userPoolID = "us-east-1_dummy123"
		clientID = "dummyclientid123456789"
		region = "us-east-1"
	}

	cognitoClient, err := cognito.NewClient(userPoolID, clientID)
	if err != nil {
		return nil, err
	}

	jwtValidator, err := jwt.NewValidator(userPoolID, region, clientID)
	if err != nil {
		return nil, err
	}

	return &AuthHandler{
		cognitoClient: cognitoClient,
		jwtValidator:  jwtValidator,
	}, nil
}

func (h *AuthHandler) SignUp(c *gin.Context) {
	var req cognito.SignUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	if req.Email == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "missing_fields",
			Message: "Email and password are required",
		})
		return
	}

	err := h.cognitoClient.SignUp(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "signup_failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully. Please check your email for verification code.",
	})
}

func (h *AuthHandler) SignIn(c *gin.Context) {
	var req cognito.SignInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	if req.Email == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "missing_fields",
			Message: "Email and password are required",
		})
		return
	}

	authResponse, err := h.cognitoClient.SignIn(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Error:   "signin_failed",
			Message: "Invalid email or password",
		})
		return
	}

	c.JSON(http.StatusOK, authResponse)
}

func (h *AuthHandler) ConfirmSignUp(c *gin.Context) {
	var req struct {
		Email            string `json:"email"`
		ConfirmationCode string `json:"confirmationCode"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	err := h.cognitoClient.ConfirmSignUp(c.Request.Context(), req.Email, req.ConfirmationCode)
	if err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "confirmation_failed",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Email confirmed successfully",
	})
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refreshToken"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	authResponse, err := h.cognitoClient.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Error:   "refresh_failed",
			Message: "Invalid refresh token",
		})
		return
	}

	c.JSON(http.StatusOK, authResponse)
}

func (h *AuthHandler) ValidateToken(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Error:   "missing_token",
			Message: "Authorization header is required",
		})
		return
	}

	claims, err := h.jwtValidator.ValidateToken(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Error:   "invalid_token",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"valid": true,
		"user": gin.H{
			"id":       claims.Username,
			"email":    claims.Email,
			"clientId": claims.ClientID,
		},
	})
}

func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Error:   "missing_token",
			Message: "Authorization header is required",
		})
		return
	}

	claims, err := h.jwtValidator.ValidateToken(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Error:   "invalid_token",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":            claims.Username,
		"email":         claims.Email,
		"emailVerified": claims.EmailVerified,
		"attributes":    map[string]string{},
	})
}