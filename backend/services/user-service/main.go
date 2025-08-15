package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/ec-recommend/user-service/internal/handlers"
	"github.com/ec-recommend/user-service/internal/repository"
	"github.com/ec-recommend/user-service/internal/service"
)

func main() {
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion("ap-northeast-1"),
	)
	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
	}
	
	dynamoClient := dynamodb.NewFromConfig(cfg)
	
	userTable := os.Getenv("USER_TABLE_NAME")
	if userTable == "" {
		userTable = "ec-recommend-users"
	}
	
	prefsTable := os.Getenv("USER_PREFS_TABLE_NAME")
	if prefsTable == "" {
		prefsTable = "ec-recommend-user-preferences"
	}
	
	addressTable := os.Getenv("USER_ADDRESS_TABLE_NAME")
	if addressTable == "" {
		addressTable = "ec-recommend-user-addresses"
	}
	
	userRepo := repository.NewUserRepository(dynamoClient, userTable, prefsTable, addressTable)
	userService := service.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)
	
	r := gin.Default()
	
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-User-ID"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:          12 * time.Hour,
	}))
	
	api := r.Group("/api/v1")
	{
		api.POST("/users", userHandler.CreateUser)
		api.GET("/users/me", userHandler.GetCurrentUser)
		api.GET("/users/:userId", userHandler.GetUser)
		api.PUT("/users/:userId", userHandler.UpdateUser)
		api.DELETE("/users/:userId", userHandler.DeleteUser)
		
		api.GET("/users/:userId/preferences", userHandler.GetUserPreferences)
		api.PUT("/users/:userId/preferences", userHandler.UpdateUserPreferences)
		
		api.POST("/users/:userId/addresses", userHandler.CreateAddress)
		api.GET("/users/:userId/addresses", userHandler.GetUserAddresses)
		api.PUT("/users/:userId/addresses/:addressId", userHandler.UpdateAddress)
		api.DELETE("/users/:userId/addresses/:addressId", userHandler.DeleteAddress)
	}
	
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}
	
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}
	
	go func() {
		log.Printf("Starting User Service on port %s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()
	
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	
	log.Println("Shutting down server...")
	
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}
	
	log.Println("Server exiting")
}