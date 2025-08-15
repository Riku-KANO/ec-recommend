package models

import (
	"time"
)

type User struct {
	UserID        string     `json:"userId" dynamodbav:"userId"`
	Email         string     `json:"email" dynamodbav:"email"`
	Username      string     `json:"username" dynamodbav:"username"`
	DisplayName   string     `json:"displayName" dynamodbav:"displayName"`
	ProfilePicture string    `json:"profilePicture,omitempty" dynamodbav:"profilePicture,omitempty"`
	Bio           string     `json:"bio,omitempty" dynamodbav:"bio,omitempty"`
	PhoneNumber   string     `json:"phoneNumber,omitempty" dynamodbav:"phoneNumber,omitempty"`
	DateOfBirth   string     `json:"dateOfBirth,omitempty" dynamodbav:"dateOfBirth,omitempty"`
	Gender        string     `json:"gender,omitempty" dynamodbav:"gender,omitempty"`
	Language      string     `json:"language" dynamodbav:"language"`
	Country       string     `json:"country,omitempty" dynamodbav:"country,omitempty"`
	CreatedAt     time.Time  `json:"createdAt" dynamodbav:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt" dynamodbav:"updatedAt"`
	LastLoginAt   *time.Time `json:"lastLoginAt,omitempty" dynamodbav:"lastLoginAt,omitempty"`
	IsActive      bool       `json:"isActive" dynamodbav:"isActive"`
	IsVerified    bool       `json:"isVerified" dynamodbav:"isVerified"`
}

type UserPreferences struct {
	UserID                string   `json:"userId" dynamodbav:"userId"`
	EmailNotifications    bool     `json:"emailNotifications" dynamodbav:"emailNotifications"`
	PushNotifications     bool     `json:"pushNotifications" dynamodbav:"pushNotifications"`
	NewsletterSubscribed  bool     `json:"newsletterSubscribed" dynamodbav:"newsletterSubscribed"`
	PreferredCategories   []string `json:"preferredCategories,omitempty" dynamodbav:"preferredCategories,omitempty"`
	Currency              string   `json:"currency" dynamodbav:"currency"`
	Theme                 string   `json:"theme" dynamodbav:"theme"`
}

type Address struct {
	AddressID    string    `json:"addressId" dynamodbav:"addressId"`
	UserID       string    `json:"userId" dynamodbav:"userId"`
	Type         string    `json:"type" dynamodbav:"type"` // billing, shipping
	IsDefault    bool      `json:"isDefault" dynamodbav:"isDefault"`
	RecipientName string   `json:"recipientName" dynamodbav:"recipientName"`
	PhoneNumber  string    `json:"phoneNumber" dynamodbav:"phoneNumber"`
	AddressLine1 string    `json:"addressLine1" dynamodbav:"addressLine1"`
	AddressLine2 string    `json:"addressLine2,omitempty" dynamodbav:"addressLine2,omitempty"`
	City         string    `json:"city" dynamodbav:"city"`
	State        string    `json:"state" dynamodbav:"state"`
	PostalCode   string    `json:"postalCode" dynamodbav:"postalCode"`
	Country      string    `json:"country" dynamodbav:"country"`
	CreatedAt    time.Time `json:"createdAt" dynamodbav:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt" dynamodbav:"updatedAt"`
}