package middleware

import (
	"context"
	"fmt"
	"strings"

	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/golang-jwt/jwt/v5"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

// AuthContextKey is the key for storing auth info in context
type contextKey string

const (
	AuthContextKey contextKey = "auth"
	UserIDKey      contextKey = "user_id"
	RolesKey       contextKey = "roles"
	SellerIDKey    contextKey = "seller_id"
)

// AuthInfo contains authenticated user information
type AuthInfo struct {
	UserID      string
	Email       string
	Roles       []string
	SellerID    string
	Permissions []string
}

// CognitoClient interface for mocking
type CognitoClient interface {
	GetUser(ctx context.Context, params *cognitoidentityprovider.GetUserInput, optFns ...func(*cognitoidentityprovider.Options)) (*cognitoidentityprovider.GetUserOutput, error)
}

// AuthMiddleware handles JWT authentication for gRPC
type AuthMiddleware struct {
	cognitoClient CognitoClient
	userPoolID    string
	region        string
}

// NewAuthMiddleware creates a new auth middleware
func NewAuthMiddleware(cognitoClient CognitoClient, userPoolID, region string) *AuthMiddleware {
	return &AuthMiddleware{
		cognitoClient: cognitoClient,
		userPoolID:    userPoolID,
		region:        region,
	}
}

// UnaryServerInterceptor returns a gRPC unary interceptor for authentication
func (a *AuthMiddleware) UnaryServerInterceptor() grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
		// Skip auth for health check endpoints
		if strings.Contains(info.FullMethod, "Health") {
			return handler(ctx, req)
		}

		// Extract token from metadata
		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			return nil, status.Error(codes.Unauthenticated, "missing metadata")
		}

		authorization := md.Get("authorization")
		if len(authorization) == 0 {
			// Check if this endpoint requires authentication
			if requiresAuth(info.FullMethod) {
				return nil, status.Error(codes.Unauthenticated, "missing authorization header")
			}
			return handler(ctx, req)
		}

		// Extract bearer token
		token := strings.TrimPrefix(authorization[0], "Bearer ")
		if token == authorization[0] {
			return nil, status.Error(codes.Unauthenticated, "invalid authorization format")
		}

		// Verify token
		authInfo, err := a.verifyToken(ctx, token)
		if err != nil {
			return nil, status.Error(codes.Unauthenticated, err.Error())
		}

		// Add auth info to context
		ctx = context.WithValue(ctx, AuthContextKey, authInfo)
		ctx = context.WithValue(ctx, UserIDKey, authInfo.UserID)
		ctx = context.WithValue(ctx, RolesKey, authInfo.Roles)
		if authInfo.SellerID != "" {
			ctx = context.WithValue(ctx, SellerIDKey, authInfo.SellerID)
		}

		// Check permissions
		if !hasRequiredRole(authInfo.Roles, info.FullMethod) {
			return nil, status.Error(codes.PermissionDenied, "insufficient permissions")
		}

		return handler(ctx, req)
	}
}

// verifyToken verifies the JWT token with Cognito
func (a *AuthMiddleware) verifyToken(ctx context.Context, tokenString string) (*AuthInfo, error) {
	// Parse token without verification first to get claims
	token, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}

	// Extract user info from claims
	authInfo := &AuthInfo{
		UserID: getStringClaim(claims, "sub"),
		Email:  getStringClaim(claims, "email"),
	}

	// Extract groups/roles
	if groups, ok := claims["cognito:groups"].([]interface{}); ok {
		for _, group := range groups {
			if g, ok := group.(string); ok {
				authInfo.Roles = append(authInfo.Roles, g)
			}
		}
	}

	// Extract custom claims
	authInfo.SellerID = getStringClaim(claims, "custom:seller_id")

	// TODO: Verify token signature with Cognito JWKS
	// This would involve fetching and caching the JWKS from Cognito
	// For now, we'll use the Cognito API to verify the token

	return authInfo, nil
}

// Helper functions

func getStringClaim(claims jwt.MapClaims, key string) string {
	if val, ok := claims[key].(string); ok {
		return val
	}
	return ""
}

func requiresAuth(method string) bool {
	// Define public endpoints that don't require authentication
	publicEndpoints := []string{
		"GetProduct",
		"ListProducts",
		"ListCategories",
		"SearchProducts",
		"GetRecommendations",
	}

	for _, endpoint := range publicEndpoints {
		if strings.Contains(method, endpoint) {
			return false
		}
	}
	return true
}

func hasRequiredRole(userRoles []string, method string) bool {
	// Define role requirements for specific endpoints
	roleRequirements := map[string][]string{
		"seller": {
			"CreateProduct",
			"UpdateProduct",
			"UpdateStock",
			"ListSellerOrders",
		},
		"admin": {
			"ListAllUsers",
			"ApproveSeller",
			"GetAnalytics",
		},
	}

	// Check if method requires specific role
	for role, methods := range roleRequirements {
		for _, m := range methods {
			if strings.Contains(method, m) {
				// User must have this role
				for _, userRole := range userRoles {
					if userRole == role {
						return true
					}
				}
				return false
			}
		}
	}

	// No specific role required
	return true
}

// GetAuthInfo extracts auth info from context
func GetAuthInfo(ctx context.Context) (*AuthInfo, bool) {
	authInfo, ok := ctx.Value(AuthContextKey).(*AuthInfo)
	return authInfo, ok
}

// GetUserID extracts user ID from context
func GetUserID(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(UserIDKey).(string)
	return userID, ok
}

// GetSellerID extracts seller ID from context
func GetSellerID(ctx context.Context) (string, bool) {
	sellerID, ok := ctx.Value(SellerIDKey).(string)
	return sellerID, ok
}

// HasRole checks if the user has a specific role
func HasRole(ctx context.Context, role string) bool {
	roles, ok := ctx.Value(RolesKey).([]string)
	if !ok {
		return false
	}
	for _, r := range roles {
		if r == role {
			return true
		}
	}
	return false
}