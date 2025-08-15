package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/ec-recommend/user-service/internal/models"
	"github.com/ec-recommend/user-service/internal/service"
)

type UserHandler struct {
	userService service.UserService
}

func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

func (h *UserHandler) CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	userID := c.GetHeader("X-User-ID")
	if userID != "" {
		user.UserID = userID
	}
	
	err := h.userService.CreateUser(c.Request.Context(), &user)
	if err != nil {
		if err == service.ErrEmailAlreadyExists {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}
	
	c.JSON(http.StatusCreated, user)
}

func (h *UserHandler) GetUser(c *gin.Context) {
	userID := c.Param("userId")
	
	user, err := h.userService.GetUser(c.Request.Context(), userID)
	if err != nil {
		if err == service.ErrUserNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
		return
	}
	
	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) GetCurrentUser(c *gin.Context) {
	userID := c.GetHeader("X-User-ID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in header"})
		return
	}
	
	user, err := h.userService.GetUser(c.Request.Context(), userID)
	if err != nil {
		if err == service.ErrUserNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
		return
	}
	
	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	userID := c.Param("userId")
	
	requestUserID := c.GetHeader("X-User-ID")
	if requestUserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot update other user's profile"})
		return
	}
	
	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	user, err := h.userService.UpdateUser(c.Request.Context(), userID, updates)
	if err != nil {
		if err == service.ErrUserNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}
	
	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	userID := c.Param("userId")
	
	requestUserID := c.GetHeader("X-User-ID")
	if requestUserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot delete other user's profile"})
		return
	}
	
	err := h.userService.DeleteUser(c.Request.Context(), userID)
	if err != nil {
		if err == service.ErrUserNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}
	
	c.JSON(http.StatusNoContent, nil)
}

func (h *UserHandler) GetUserPreferences(c *gin.Context) {
	userID := c.Param("userId")
	
	requestUserID := c.GetHeader("X-User-ID")
	if requestUserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot access other user's preferences"})
		return
	}
	
	prefs, err := h.userService.GetUserPreferences(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get preferences"})
		return
	}
	
	c.JSON(http.StatusOK, prefs)
}

func (h *UserHandler) UpdateUserPreferences(c *gin.Context) {
	userID := c.Param("userId")
	
	requestUserID := c.GetHeader("X-User-ID")
	if requestUserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot update other user's preferences"})
		return
	}
	
	var prefs models.UserPreferences
	if err := c.ShouldBindJSON(&prefs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	err := h.userService.UpdateUserPreferences(c.Request.Context(), userID, &prefs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update preferences"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Preferences updated successfully"})
}

func (h *UserHandler) CreateAddress(c *gin.Context) {
	userID := c.Param("userId")
	
	requestUserID := c.GetHeader("X-User-ID")
	if requestUserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot create address for other user"})
		return
	}
	
	var address models.Address
	if err := c.ShouldBindJSON(&address); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	err := h.userService.CreateAddress(c.Request.Context(), userID, &address)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create address"})
		return
	}
	
	c.JSON(http.StatusCreated, address)
}

func (h *UserHandler) GetUserAddresses(c *gin.Context) {
	userID := c.Param("userId")
	
	requestUserID := c.GetHeader("X-User-ID")
	if requestUserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot access other user's addresses"})
		return
	}
	
	addresses, err := h.userService.GetUserAddresses(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get addresses"})
		return
	}
	
	c.JSON(http.StatusOK, addresses)
}

func (h *UserHandler) UpdateAddress(c *gin.Context) {
	userID := c.Param("userId")
	addressID := c.Param("addressId")
	
	requestUserID := c.GetHeader("X-User-ID")
	if requestUserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot update other user's address"})
		return
	}
	
	var address models.Address
	if err := c.ShouldBindJSON(&address); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	err := h.userService.UpdateAddress(c.Request.Context(), userID, addressID, &address)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Address not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update address"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Address updated successfully"})
}

func (h *UserHandler) DeleteAddress(c *gin.Context) {
	userID := c.Param("userId")
	addressID := c.Param("addressId")
	
	requestUserID := c.GetHeader("X-User-ID")
	if requestUserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot delete other user's address"})
		return
	}
	
	err := h.userService.DeleteAddress(c.Request.Context(), userID, addressID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Address not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete address"})
		return
	}
	
	c.JSON(http.StatusNoContent, nil)
}