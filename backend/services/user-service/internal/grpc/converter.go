package grpc

import (
	"github.com/ec-recommend/user-service/internal/models"
	userv1 "github.com/ec-recommend/user-service/proto/user/v1"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// modelToProtoUser converts internal User model to protobuf User
func modelToProtoUser(user *models.User) *userv1.User {
	protoUser := &userv1.User{
		UserId:         user.UserID,
		Email:          user.Email,
		Username:       user.Username,
		DisplayName:    user.DisplayName,
		ProfilePicture: user.ProfilePicture,
		Bio:            user.Bio,
		PhoneNumber:    user.PhoneNumber,
		DateOfBirth:    user.DateOfBirth,
		Gender:         user.Gender,
		Language:       user.Language,
		Country:        user.Country,
		CreatedAt:      timestamppb.New(user.CreatedAt),
		UpdatedAt:      timestamppb.New(user.UpdatedAt),
		IsActive:       user.IsActive,
		IsVerified:     user.IsVerified,
	}
	
	if user.LastLoginAt != nil {
		protoUser.LastLoginAt = timestamppb.New(*user.LastLoginAt)
	}
	
	return protoUser
}

// modelToProtoPreferences converts internal UserPreferences model to protobuf
func modelToProtoPreferences(prefs *models.UserPreferences) *userv1.UserPreferences {
	return &userv1.UserPreferences{
		UserId:               prefs.UserID,
		EmailNotifications:   prefs.EmailNotifications,
		PushNotifications:    prefs.PushNotifications,
		NewsletterSubscribed: prefs.NewsletterSubscribed,
		PreferredCategories:  prefs.PreferredCategories,
		Currency:             prefs.Currency,
		Theme:                prefs.Theme,
	}
}

// protoToModelPreferences converts protobuf UserPreferences to internal model
func protoToModelPreferences(prefs *userv1.UserPreferences) *models.UserPreferences {
	return &models.UserPreferences{
		UserID:               prefs.UserId,
		EmailNotifications:   prefs.EmailNotifications,
		PushNotifications:    prefs.PushNotifications,
		NewsletterSubscribed: prefs.NewsletterSubscribed,
		PreferredCategories:  prefs.PreferredCategories,
		Currency:             prefs.Currency,
		Theme:                prefs.Theme,
	}
}

// modelToProtoAddress converts internal Address model to protobuf
func modelToProtoAddress(addr *models.Address) *userv1.Address {
	return &userv1.Address{
		AddressId:     addr.AddressID,
		UserId:        addr.UserID,
		Type:          addr.Type,
		IsDefault:     addr.IsDefault,
		RecipientName: addr.RecipientName,
		PhoneNumber:   addr.PhoneNumber,
		AddressLine1:  addr.AddressLine1,
		AddressLine2:  addr.AddressLine2,
		City:          addr.City,
		State:         addr.State,
		PostalCode:    addr.PostalCode,
		Country:       addr.Country,
		CreatedAt:     timestamppb.New(addr.CreatedAt),
		UpdatedAt:     timestamppb.New(addr.UpdatedAt),
	}
}