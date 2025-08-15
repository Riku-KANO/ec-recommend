package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/ec-recommend/user-service/internal/models"
	"github.com/ec-recommend/user-service/internal/repository"
)

var (
	ErrUserNotFound = errors.New("user not found")
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrInvalidInput = errors.New("invalid input")
)

type UserService interface {
	CreateUser(ctx context.Context, user *models.User) error
	GetUser(ctx context.Context, userID string) (*models.User, error)
	UpdateUser(ctx context.Context, userID string, updates map[string]interface{}) (*models.User, error)
	DeleteUser(ctx context.Context, userID string) error
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	
	GetUserPreferences(ctx context.Context, userID string) (*models.UserPreferences, error)
	UpdateUserPreferences(ctx context.Context, userID string, prefs *models.UserPreferences) error
	
	CreateAddress(ctx context.Context, userID string, address *models.Address) error
	GetUserAddresses(ctx context.Context, userID string) ([]*models.Address, error)
	UpdateAddress(ctx context.Context, userID, addressID string, address *models.Address) error
	DeleteAddress(ctx context.Context, userID, addressID string) error
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{
		repo: repo,
	}
}

func (s *userService) CreateUser(ctx context.Context, user *models.User) error {
	if user.Email == "" || user.Username == "" {
		return ErrInvalidInput
	}
	
	existingUser, err := s.repo.GetUserByEmail(ctx, user.Email)
	if err != nil {
		return fmt.Errorf("failed to check existing user: %w", err)
	}
	if existingUser != nil {
		return ErrEmailAlreadyExists
	}
	
	if user.UserID == "" {
		user.UserID = uuid.New().String()
	}
	
	if user.Language == "" {
		user.Language = "ja"
	}
	
	err = s.repo.CreateUser(ctx, user)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	
	defaultPrefs := &models.UserPreferences{
		UserID:               user.UserID,
		EmailNotifications:   true,
		PushNotifications:    false,
		NewsletterSubscribed: false,
		Currency:            "JPY",
		Theme:               "light",
	}
	
	err = s.repo.CreateUserPreferences(ctx, defaultPrefs)
	if err != nil {
		return fmt.Errorf("failed to create user preferences: %w", err)
	}
	
	return nil
}

func (s *userService) GetUser(ctx context.Context, userID string) (*models.User, error) {
	user, err := s.repo.GetUser(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	
	if user == nil {
		return nil, ErrUserNotFound
	}
	
	return user, nil
}

func (s *userService) UpdateUser(ctx context.Context, userID string, updates map[string]interface{}) (*models.User, error) {
	user, err := s.repo.GetUser(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	
	if user == nil {
		return nil, ErrUserNotFound
	}
	
	if displayName, ok := updates["displayName"].(string); ok {
		user.DisplayName = displayName
	}
	if bio, ok := updates["bio"].(string); ok {
		user.Bio = bio
	}
	if profilePicture, ok := updates["profilePicture"].(string); ok {
		user.ProfilePicture = profilePicture
	}
	if phoneNumber, ok := updates["phoneNumber"].(string); ok {
		user.PhoneNumber = phoneNumber
	}
	if dateOfBirth, ok := updates["dateOfBirth"].(string); ok {
		user.DateOfBirth = dateOfBirth
	}
	if gender, ok := updates["gender"].(string); ok {
		user.Gender = gender
	}
	if language, ok := updates["language"].(string); ok {
		user.Language = language
	}
	if country, ok := updates["country"].(string); ok {
		user.Country = country
	}
	
	err = s.repo.UpdateUser(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}
	
	return user, nil
}

func (s *userService) DeleteUser(ctx context.Context, userID string) error {
	user, err := s.repo.GetUser(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}
	
	if user == nil {
		return ErrUserNotFound
	}
	
	user.IsActive = false
	err = s.repo.UpdateUser(ctx, user)
	if err != nil {
		return fmt.Errorf("failed to deactivate user: %w", err)
	}
	
	return nil
}

func (s *userService) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	user, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}
	
	if user == nil {
		return nil, ErrUserNotFound
	}
	
	return user, nil
}

func (s *userService) GetUserPreferences(ctx context.Context, userID string) (*models.UserPreferences, error) {
	prefs, err := s.repo.GetUserPreferences(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get preferences: %w", err)
	}
	
	if prefs == nil {
		defaultPrefs := &models.UserPreferences{
			UserID:               userID,
			EmailNotifications:   true,
			PushNotifications:    false,
			NewsletterSubscribed: false,
			Currency:            "JPY",
			Theme:               "light",
		}
		err = s.repo.CreateUserPreferences(ctx, defaultPrefs)
		if err != nil {
			return nil, fmt.Errorf("failed to create default preferences: %w", err)
		}
		return defaultPrefs, nil
	}
	
	return prefs, nil
}

func (s *userService) UpdateUserPreferences(ctx context.Context, userID string, prefs *models.UserPreferences) error {
	_, err := s.repo.GetUser(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}
	
	prefs.UserID = userID
	err = s.repo.UpdateUserPreferences(ctx, prefs)
	if err != nil {
		return fmt.Errorf("failed to update preferences: %w", err)
	}
	
	return nil
}

func (s *userService) CreateAddress(ctx context.Context, userID string, address *models.Address) error {
	_, err := s.repo.GetUser(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}
	
	address.AddressID = uuid.New().String()
	address.UserID = userID
	
	if address.IsDefault {
		addresses, err := s.repo.GetUserAddresses(ctx, userID)
		if err != nil {
			return fmt.Errorf("failed to get addresses: %w", err)
		}
		
		for _, addr := range addresses {
			if addr.IsDefault && addr.Type == address.Type {
				addr.IsDefault = false
				err = s.repo.UpdateAddress(ctx, addr)
				if err != nil {
					return fmt.Errorf("failed to update default address: %w", err)
				}
			}
		}
	}
	
	err = s.repo.CreateAddress(ctx, address)
	if err != nil {
		return fmt.Errorf("failed to create address: %w", err)
	}
	
	return nil
}

func (s *userService) GetUserAddresses(ctx context.Context, userID string) ([]*models.Address, error) {
	addresses, err := s.repo.GetUserAddresses(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get addresses: %w", err)
	}
	
	return addresses, nil
}

func (s *userService) UpdateAddress(ctx context.Context, userID, addressID string, address *models.Address) error {
	existingAddress, err := s.repo.GetAddress(ctx, addressID)
	if err != nil {
		return fmt.Errorf("failed to get address: %w", err)
	}
	
	if existingAddress == nil || existingAddress.UserID != userID {
		return errors.New("address not found")
	}
	
	address.AddressID = addressID
	address.UserID = userID
	
	if address.IsDefault && address.Type != existingAddress.Type {
		address.Type = existingAddress.Type
	}
	
	if address.IsDefault {
		addresses, err := s.repo.GetUserAddresses(ctx, userID)
		if err != nil {
			return fmt.Errorf("failed to get addresses: %w", err)
		}
		
		for _, addr := range addresses {
			if addr.IsDefault && addr.Type == address.Type && addr.AddressID != addressID {
				addr.IsDefault = false
				err = s.repo.UpdateAddress(ctx, addr)
				if err != nil {
					return fmt.Errorf("failed to update default address: %w", err)
				}
			}
		}
	}
	
	err = s.repo.UpdateAddress(ctx, address)
	if err != nil {
		return fmt.Errorf("failed to update address: %w", err)
	}
	
	return nil
}

func (s *userService) DeleteAddress(ctx context.Context, userID, addressID string) error {
	address, err := s.repo.GetAddress(ctx, addressID)
	if err != nil {
		return fmt.Errorf("failed to get address: %w", err)
	}
	
	if address == nil || address.UserID != userID {
		return errors.New("address not found")
	}
	
	err = s.repo.DeleteAddress(ctx, addressID)
	if err != nil {
		return fmt.Errorf("failed to delete address: %w", err)
	}
	
	return nil
}