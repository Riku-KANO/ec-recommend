package jwt

import (
	"context"
	"crypto/rsa"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/lestrrat-go/jwx/v2/jwk"
)

type Validator struct {
	userPoolID string
	region     string
	clientID   string
	jwkSet     jwk.Set
}

type Claims struct {
	jwt.RegisteredClaims
	TokenUse  string `json:"token_use"`
	Scope     string `json:"scope"`
	AuthTime  int64  `json:"auth_time"`
	ClientID  string `json:"client_id"`
	Username  string `json:"username"`
	ExpTime   int64  `json:"exp"`
	IssuedAt  int64  `json:"iat"`
	Email     string `json:"email"`
	EmailVerified bool `json:"email_verified"`
}

func NewValidator(userPoolID, region, clientID string) (*Validator, error) {
	v := &Validator{
		userPoolID: userPoolID,
		region:     region,
		clientID:   clientID,
	}

	if err := v.loadJWKS(); err != nil {
		return nil, fmt.Errorf("failed to load JWKS: %v", err)
	}

	return v, nil
}

func (v *Validator) loadJWKS() error {
	jwksURL := fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json", v.region, v.userPoolID)
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	jwkSet, err := jwk.Fetch(ctx, jwksURL)
	if err != nil {
		return fmt.Errorf("failed to fetch JWKS: %v", err)
	}

	v.jwkSet = jwkSet
	return nil
}

func (v *Validator) ValidateToken(tokenString string) (*Claims, error) {
	// Remove "Bearer " prefix if present
	if strings.HasPrefix(tokenString, "Bearer ") {
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		// Get key ID from token header
		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, fmt.Errorf("missing kid in token header")
		}

		// Find the key in JWKS
		key, found := v.jwkSet.LookupKeyID(kid)
		if !found {
			return nil, fmt.Errorf("key not found in JWKS")
		}

		var rsaKey rsa.PublicKey
		if err := key.Raw(&rsaKey); err != nil {
			return nil, fmt.Errorf("failed to parse RSA key: %v", err)
		}

		return &rsaKey, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %v", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	// Validate token use (should be "access" for access tokens, "id" for ID tokens)
	if claims.TokenUse != "access" && claims.TokenUse != "id" {
		return nil, fmt.Errorf("invalid token use: %s", claims.TokenUse)
	}

	// Validate issuer
	expectedIssuer := fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s", v.region, v.userPoolID)
	if claims.Issuer != expectedIssuer {
		return nil, fmt.Errorf("invalid issuer: %s", claims.Issuer)
	}

	// Validate client ID for ID tokens
	if claims.TokenUse == "id" && claims.Audience[0] != v.clientID {
		return nil, fmt.Errorf("invalid audience: %s", claims.Audience)
	}

	// Validate expiration
	if time.Now().Unix() > claims.ExpTime {
		return nil, fmt.Errorf("token expired")
	}

	return claims, nil
}

func (v *Validator) RefreshJWKS() error {
	return v.loadJWKS()
}