package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	grpcserver "github.com/ec-recommend/user-service/internal/grpc"
	"github.com/ec-recommend/user-service/internal/repository"
	"github.com/ec-recommend/user-service/internal/service"
	userv1 "github.com/ec-recommend/user-service/proto/user/v1"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/health"
	"google.golang.org/grpc/health/grpc_health_v1"
	"google.golang.org/grpc/reflection"
)

func main() {
	// Initialize logger
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Sync()

	// Load AWS config
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion("ap-northeast-1"),
	)
	if err != nil {
		logger.Fatal("Unable to load SDK config", zap.Error(err))
	}
	
	// Initialize DynamoDB client
	dynamoClient := dynamodb.NewFromConfig(cfg)
	
	// Get table names from environment variables
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
	
	// Initialize repository
	userRepo := repository.NewUserRepository(dynamoClient, userTable, prefsTable, addressTable)
	
	// Initialize service
	userService := service.NewUserService(userRepo)
	
	// Initialize gRPC server
	grpcServer := grpc.NewServer(
		grpc.UnaryInterceptor(grpc_middleware.ChainUnaryServer(
			grpc_zap.UnaryServerInterceptor(logger),
			grpc_recovery.UnaryServerInterceptor(),
		)),
	)
	
	// Register user service
	userServiceServer := grpcserver.NewUserServiceServer(userService)
	userv1.RegisterUserServiceServer(grpcServer, userServiceServer)
	
	// Register health service
	healthServer := health.NewServer()
	grpc_health_v1.RegisterHealthServer(grpcServer, healthServer)
	healthServer.SetServingStatus("", grpc_health_v1.HealthCheckResponse_SERVING)
	
	// Register reflection service for debugging
	reflection.Register(grpcServer)
	
	// Get port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "50051"
	}
	
	// Start listening
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", port))
	if err != nil {
		logger.Fatal("Failed to listen", zap.Error(err), zap.String("port", port))
	}
	
	// Handle graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		<-sigChan
		
		logger.Info("Shutting down gRPC server...")
		grpcServer.GracefulStop()
	}()
	
	logger.Info("Starting User Service gRPC server", zap.String("port", port))
	if err := grpcServer.Serve(lis); err != nil {
		logger.Fatal("Failed to serve", zap.Error(err))
	}
}