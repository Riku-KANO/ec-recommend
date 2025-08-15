package service

import (
	"context"
	"errors"
	"testing"

	"github.com/ec-recommend/user-service/internal/models"
	"github.com/ec-recommend/user-service/internal/repository"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) CreateUser(ctx context.Context, user *models.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *MockUserRepository) GetUser(ctx context.Context, userID string) (*models.User, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) UpdateUser(ctx context.Context, user *models.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *MockUserRepository) DeleteUser(ctx context.Context, userID string) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

func (m *MockUserRepository) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) CreateUserPreferences(ctx context.Context, prefs *models.UserPreferences) error {
	args := m.Called(ctx, prefs)
	return args.Error(0)
}

func (m *MockUserRepository) GetUserPreferences(ctx context.Context, userID string) (*models.UserPreferences, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.UserPreferences), args.Error(1)
}

func (m *MockUserRepository) UpdateUserPreferences(ctx context.Context, prefs *models.UserPreferences) error {
	args := m.Called(ctx, prefs)
	return args.Error(0)
}

func (m *MockUserRepository) CreateAddress(ctx context.Context, address *models.Address) error {
	args := m.Called(ctx, address)
	return args.Error(0)
}

func (m *MockUserRepository) GetAddress(ctx context.Context, addressID string) (*models.Address, error) {
	args := m.Called(ctx, addressID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Address), args.Error(1)
}

func (m *MockUserRepository) GetUserAddresses(ctx context.Context, userID string) ([]*models.Address, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*models.Address), args.Error(1)
}

func (m *MockUserRepository) UpdateAddress(ctx context.Context, address *models.Address) error {
	args := m.Called(ctx, address)
	return args.Error(0)
}

func (m *MockUserRepository) DeleteAddress(ctx context.Context, addressID string) error {
	args := m.Called(ctx, addressID)
	return args.Error(0)
}

func TestCreateUser(t *testing.T) {
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)
	ctx := context.Background()
	
	t.Run("Success", func(t *testing.T) {
		user := &models.User{
			Email:    "test@example.com",
			Username: "testuser",
		}
		
		mockRepo.On("GetUserByEmail", ctx, user.Email).Return(nil, nil).Once()
		mockRepo.On("CreateUser", ctx, mock.AnythingOfType("*models.User")).Return(nil).Once()
		mockRepo.On("CreateUserPreferences", ctx, mock.AnythingOfType("*models.UserPreferences")).Return(nil).Once()
		
		err := service.CreateUser(ctx, user)
		assert.NoError(t, err)
		assert.NotEmpty(t, user.UserID)
		assert.Equal(t, "ja", user.Language)
		
		mockRepo.AssertExpectations(t)
	})
	
	t.Run("EmailAlreadyExists", func(t *testing.T) {
		user := &models.User{
			Email:    "existing@example.com",
			Username: "testuser",
		}
		existingUser := &models.User{
			UserID: "existing-id",
			Email:  user.Email,
		}
		
		mockRepo.On("GetUserByEmail", ctx, user.Email).Return(existingUser, nil).Once()
		
		err := service.CreateUser(ctx, user)
		assert.Error(t, err)
		assert.Equal(t, ErrEmailAlreadyExists, err)
		
		mockRepo.AssertExpectations(t)
	})
	
	t.Run("InvalidInput", func(t *testing.T) {
		user := &models.User{
			Email: "test@example.com",
		}
		
		err := service.CreateUser(ctx, user)
		assert.Error(t, err)
		assert.Equal(t, ErrInvalidInput, err)
	})
}

func TestGetUser(t *testing.T) {
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)
	ctx := context.Background()
	
	t.Run("Success", func(t *testing.T) {
		userID := "user-123"
		expectedUser := &models.User{
			UserID:   userID,
			Email:    "test@example.com",
			Username: "testuser",
		}
		
		mockRepo.On("GetUser", ctx, userID).Return(expectedUser, nil).Once()
		
		user, err := service.GetUser(ctx, userID)
		assert.NoError(t, err)
		assert.Equal(t, expectedUser, user)
		
		mockRepo.AssertExpectations(t)
	})
	
	t.Run("UserNotFound", func(t *testing.T) {
		userID := "nonexistent"
		
		mockRepo.On("GetUser", ctx, userID).Return(nil, nil).Once()
		
		user, err := service.GetUser(ctx, userID)
		assert.Error(t, err)
		assert.Equal(t, ErrUserNotFound, err)
		assert.Nil(t, user)
		
		mockRepo.AssertExpectations(t)
	})
}

func TestUpdateUser(t *testing.T) {
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)
	ctx := context.Background()
	
	t.Run("Success", func(t *testing.T) {
		userID := "user-123"
		existingUser := &models.User{
			UserID:      userID,
			Email:       "test@example.com",
			Username:    "testuser",
			DisplayName: "Old Name",
		}
		updates := map[string]interface{}{
			"displayName": "New Name",
			"bio":        "New bio",
		}
		
		mockRepo.On("GetUser", ctx, userID).Return(existingUser, nil).Once()
		mockRepo.On("UpdateUser", ctx, mock.AnythingOfType("*models.User")).Return(nil).Once()
		
		user, err := service.UpdateUser(ctx, userID, updates)
		assert.NoError(t, err)
		assert.Equal(t, "New Name", user.DisplayName)
		assert.Equal(t, "New bio", user.Bio)
		
		mockRepo.AssertExpectations(t)
	})
	
	t.Run("UserNotFound", func(t *testing.T) {
		userID := "nonexistent"
		updates := map[string]interface{}{
			"displayName": "New Name",
		}
		
		mockRepo.On("GetUser", ctx, userID).Return(nil, nil).Once()
		
		user, err := service.UpdateUser(ctx, userID, updates)
		assert.Error(t, err)
		assert.Equal(t, ErrUserNotFound, err)
		assert.Nil(t, user)
		
		mockRepo.AssertExpectations(t)
	})
}

func TestDeleteUser(t *testing.T) {
	mockRepo := new(MockUserRepository)
	service := NewUserService(mockRepo)
	ctx := context.Background()
	
	t.Run("Success", func(t *testing.T) {
		userID := "user-123"
		existingUser := &models.User{
			UserID:   userID,
			Email:    "test@example.com",
			IsActive: true,
		}
		
		mockRepo.On("GetUser", ctx, userID).Return(existingUser, nil).Once()
		mockRepo.On("UpdateUser", ctx, mock.AnythingOfType("*models.User")).Return(nil).Once()
		
		err := service.DeleteUser(ctx, userID)
		assert.NoError(t, err)
		
		mockRepo.AssertExpectations(t)
	})
	
	t.Run("UserNotFound", func(t *testing.T) {
		userID := "nonexistent"
		
		mockRepo.On("GetUser", ctx, userID).Return(nil, nil).Once()
		
		err := service.DeleteUser(ctx, userID)
		assert.Error(t, err)
		assert.Equal(t, ErrUserNotFound, err)
		
		mockRepo.AssertExpectations(t)
	})
}