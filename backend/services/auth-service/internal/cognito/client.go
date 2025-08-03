package cognito

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
)

type Client struct {
	cognitoClient *cognitoidentityprovider.Client
	userPoolID    string
	clientID      string
}

type SignUpRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name,omitempty"`
}

type SignInRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	AccessToken  string `json:"accessToken"`
	IdToken      string `json:"idToken"`
	RefreshToken string `json:"refreshToken"`
	User         User   `json:"user"`
}

type User struct {
	ID           string            `json:"id"`
	Email        string            `json:"email"`
	EmailVerified bool             `json:"emailVerified"`
	Name         string            `json:"name,omitempty"`
	Attributes   map[string]string `json:"attributes"`
}

func NewClient(userPoolID, clientID string) (*Client, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, fmt.Errorf("unable to load SDK config: %v", err)
	}

	return &Client{
		cognitoClient: cognitoidentityprovider.NewFromConfig(cfg),
		userPoolID:    userPoolID,
		clientID:      clientID,
	}, nil
}

func (c *Client) SignUp(ctx context.Context, req SignUpRequest) error {
	input := &cognitoidentityprovider.SignUpInput{
		ClientId: aws.String(c.clientID),
		Username: aws.String(req.Email),
		Password: aws.String(req.Password),
		UserAttributes: []types.AttributeType{
			{
				Name:  aws.String("email"),
				Value: aws.String(req.Email),
			},
		},
	}

	if req.Name != "" {
		input.UserAttributes = append(input.UserAttributes, types.AttributeType{
			Name:  aws.String("name"),
			Value: aws.String(req.Name),
		})
	}

	_, err := c.cognitoClient.SignUp(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to sign up user: %v", err)
	}

	return nil
}

func (c *Client) SignIn(ctx context.Context, req SignInRequest) (*AuthResponse, error) {
	input := &cognitoidentityprovider.InitiateAuthInput{
		AuthFlow: types.AuthFlowTypeUserPasswordAuth,
		ClientId: aws.String(c.clientID),
		AuthParameters: map[string]string{
			"USERNAME": req.Email,
			"PASSWORD": req.Password,
		},
	}

	result, err := c.cognitoClient.InitiateAuth(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to sign in user: %v", err)
	}

	if result.AuthenticationResult == nil {
		return nil, fmt.Errorf("authentication failed")
	}

	// Get user info
	userInfo, err := c.getUser(ctx, *result.AuthenticationResult.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %v", err)
	}

	return &AuthResponse{
		AccessToken:  *result.AuthenticationResult.AccessToken,
		IdToken:      *result.AuthenticationResult.IdToken,
		RefreshToken: aws.ToString(result.AuthenticationResult.RefreshToken),
		User:         *userInfo,
	}, nil
}

func (c *Client) getUser(ctx context.Context, accessToken string) (*User, error) {
	input := &cognitoidentityprovider.GetUserInput{
		AccessToken: aws.String(accessToken),
	}

	result, err := c.cognitoClient.GetUser(ctx, input)
	if err != nil {
		return nil, err
	}

	user := &User{
		ID:         *result.Username,
		Attributes: make(map[string]string),
	}

	// Parse user attributes
	for _, attr := range result.UserAttributes {
		key := *attr.Name
		value := *attr.Value

		switch key {
		case "email":
			user.Email = value
		case "email_verified":
			user.EmailVerified = value == "true"
		case "name":
			user.Name = value
		default:
			user.Attributes[key] = value
		}
	}

	return user, nil
}

func (c *Client) ConfirmSignUp(ctx context.Context, email, confirmationCode string) error {
	input := &cognitoidentityprovider.ConfirmSignUpInput{
		ClientId:         aws.String(c.clientID),
		Username:         aws.String(email),
		ConfirmationCode: aws.String(confirmationCode),
	}

	_, err := c.cognitoClient.ConfirmSignUp(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to confirm sign up: %v", err)
	}

	return nil
}

func (c *Client) RefreshToken(ctx context.Context, refreshToken string) (*AuthResponse, error) {
	input := &cognitoidentityprovider.InitiateAuthInput{
		AuthFlow: types.AuthFlowTypeRefreshTokenAuth,
		ClientId: aws.String(c.clientID),
		AuthParameters: map[string]string{
			"REFRESH_TOKEN": refreshToken,
		},
	}

	result, err := c.cognitoClient.InitiateAuth(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to refresh token: %v", err)
	}

	if result.AuthenticationResult == nil {
		return nil, fmt.Errorf("token refresh failed")
	}

	// Get user info
	userInfo, err := c.getUser(ctx, *result.AuthenticationResult.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %v", err)
	}

	return &AuthResponse{
		AccessToken:  *result.AuthenticationResult.AccessToken,
		IdToken:      *result.AuthenticationResult.IdToken,
		RefreshToken: refreshToken, // Keep the original refresh token
		User:         *userInfo,
	}, nil
}