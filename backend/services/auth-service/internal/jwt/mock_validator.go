package jwt

import (
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// MockValidator is a simplified validator for testing with mock services
type MockValidator struct {
	userPoolID string
	region     string
	clientID   string
}

func NewMockValidator(userPoolID, region, clientID string) *MockValidator {
	return &MockValidator{
		userPoolID: userPoolID,
		region:     region,
		clientID:   clientID,
	}
}

func (v *MockValidator) ValidateToken(tokenString string) (*Claims, error) {
	// Remove "Bearer " prefix if present
	if strings.HasPrefix(tokenString, "Bearer ") {
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")
	}

	// For mock purposes, accept any JWT-like token
	// In real tests, you might want to validate against a known test token
	token, _, err := new(jwt.Parser).ParseUnverified(tokenString, &Claims{})
	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %v", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}

	// Basic validation
	if claims.ExpTime > 0 && time.Now().Unix() > claims.ExpTime {
		return nil, fmt.Errorf("token expired")
	}

	return claims, nil
}

func (v *MockValidator) RefreshJWKS() error {
	// No-op for mock validator
	return nil
}