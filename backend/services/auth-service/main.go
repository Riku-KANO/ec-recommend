package main

import (
	"log"
	"os"

	"github.com/ec-recommend/auth-service/internal/handlers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize auth handler
	authHandler, err := handlers.NewAuthHandler()
	if err != nil {
		log.Fatal("Failed to initialize auth handler:", err)
	}

	// Initialize Gin router
	r := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3001"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Auth routes
	auth := r.Group("/auth")
	{
		auth.POST("/signup", authHandler.SignUp)
		auth.POST("/signin", authHandler.SignIn)
		auth.POST("/confirm", authHandler.ConfirmSignUp)
		auth.POST("/refresh", authHandler.RefreshToken)
		auth.POST("/validate", authHandler.ValidateToken)
		auth.GET("/user", authHandler.GetCurrentUser)
	}

	// Passkey routes (placeholder for future implementation)
	passkey := r.Group("/auth/passkey")
	{
		passkey.POST("/register/begin", func(c *gin.Context) {
			c.JSON(200, gin.H{"challenge": "dummy-challenge"})
		})
		passkey.POST("/register/complete", func(c *gin.Context) {
			c.JSON(200, gin.H{"success": true})
		})
		passkey.POST("/authenticate/begin", func(c *gin.Context) {
			c.JSON(200, gin.H{"challenge": "dummy-challenge"})
		})
		passkey.POST("/authenticate/complete", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"user": gin.H{
					"id":    "passkey-user-123",
					"email": "passkey@example.com",
				},
				"tokens": gin.H{
					"idToken":     "dummy-id-token",
					"accessToken": "dummy-access-token",
				},
			})
		})
	}

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting auth service on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}