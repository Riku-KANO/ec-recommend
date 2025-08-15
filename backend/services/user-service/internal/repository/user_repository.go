package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/ec-recommend/user-service/internal/models"
)

type UserRepository interface {
	CreateUser(ctx context.Context, user *models.User) error
	GetUser(ctx context.Context, userID string) (*models.User, error)
	UpdateUser(ctx context.Context, user *models.User) error
	DeleteUser(ctx context.Context, userID string) error
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	
	CreateUserPreferences(ctx context.Context, prefs *models.UserPreferences) error
	GetUserPreferences(ctx context.Context, userID string) (*models.UserPreferences, error)
	UpdateUserPreferences(ctx context.Context, prefs *models.UserPreferences) error
	
	CreateAddress(ctx context.Context, address *models.Address) error
	GetAddress(ctx context.Context, addressID string) (*models.Address, error)
	GetUserAddresses(ctx context.Context, userID string) ([]*models.Address, error)
	UpdateAddress(ctx context.Context, address *models.Address) error
	DeleteAddress(ctx context.Context, addressID string) error
}

type userRepository struct {
	db              *dynamodb.Client
	userTable       string
	prefsTable      string
	addressTable    string
	emailIndexName  string
}

func NewUserRepository(db *dynamodb.Client, userTable, prefsTable, addressTable string) UserRepository {
	return &userRepository{
		db:              db,
		userTable:       userTable,
		prefsTable:      prefsTable,
		addressTable:    addressTable,
		emailIndexName:  "email-index",
	}
}

func (r *userRepository) CreateUser(ctx context.Context, user *models.User) error {
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	user.IsActive = true
	
	av, err := attributevalue.MarshalMap(user)
	if err != nil {
		return fmt.Errorf("failed to marshal user: %w", err)
	}
	
	input := &dynamodb.PutItemInput{
		TableName: aws.String(r.userTable),
		Item:      av,
		ConditionExpression: aws.String("attribute_not_exists(userId)"),
	}
	
	_, err = r.db.PutItem(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	
	return nil
}

func (r *userRepository) GetUser(ctx context.Context, userID string) (*models.User, error) {
	input := &dynamodb.GetItemInput{
		TableName: aws.String(r.userTable),
		Key: map[string]types.AttributeValue{
			"userId": &types.AttributeValueMemberS{Value: userID},
		},
	}
	
	result, err := r.db.GetItem(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	
	if result.Item == nil {
		return nil, nil
	}
	
	var user models.User
	err = attributevalue.UnmarshalMap(result.Item, &user)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal user: %w", err)
	}
	
	return &user, nil
}

func (r *userRepository) UpdateUser(ctx context.Context, user *models.User) error {
	user.UpdatedAt = time.Now()
	
	av, err := attributevalue.MarshalMap(user)
	if err != nil {
		return fmt.Errorf("failed to marshal user: %w", err)
	}
	
	input := &dynamodb.PutItemInput{
		TableName: aws.String(r.userTable),
		Item:      av,
		ConditionExpression: aws.String("attribute_exists(userId)"),
	}
	
	_, err = r.db.PutItem(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	
	return nil
}

func (r *userRepository) DeleteUser(ctx context.Context, userID string) error {
	input := &dynamodb.DeleteItemInput{
		TableName: aws.String(r.userTable),
		Key: map[string]types.AttributeValue{
			"userId": &types.AttributeValueMemberS{Value: userID},
		},
	}
	
	_, err := r.db.DeleteItem(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}
	
	return nil
}

func (r *userRepository) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	input := &dynamodb.QueryInput{
		TableName:              aws.String(r.userTable),
		IndexName:              aws.String(r.emailIndexName),
		KeyConditionExpression: aws.String("email = :email"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":email": &types.AttributeValueMemberS{Value: email},
		},
		Limit: aws.Int32(1),
	}
	
	result, err := r.db.Query(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to query user by email: %w", err)
	}
	
	if len(result.Items) == 0 {
		return nil, nil
	}
	
	var user models.User
	err = attributevalue.UnmarshalMap(result.Items[0], &user)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal user: %w", err)
	}
	
	return &user, nil
}

func (r *userRepository) CreateUserPreferences(ctx context.Context, prefs *models.UserPreferences) error {
	av, err := attributevalue.MarshalMap(prefs)
	if err != nil {
		return fmt.Errorf("failed to marshal preferences: %w", err)
	}
	
	input := &dynamodb.PutItemInput{
		TableName: aws.String(r.prefsTable),
		Item:      av,
	}
	
	_, err = r.db.PutItem(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to create preferences: %w", err)
	}
	
	return nil
}

func (r *userRepository) GetUserPreferences(ctx context.Context, userID string) (*models.UserPreferences, error) {
	input := &dynamodb.GetItemInput{
		TableName: aws.String(r.prefsTable),
		Key: map[string]types.AttributeValue{
			"userId": &types.AttributeValueMemberS{Value: userID},
		},
	}
	
	result, err := r.db.GetItem(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to get preferences: %w", err)
	}
	
	if result.Item == nil {
		return nil, nil
	}
	
	var prefs models.UserPreferences
	err = attributevalue.UnmarshalMap(result.Item, &prefs)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal preferences: %w", err)
	}
	
	return &prefs, nil
}

func (r *userRepository) UpdateUserPreferences(ctx context.Context, prefs *models.UserPreferences) error {
	av, err := attributevalue.MarshalMap(prefs)
	if err != nil {
		return fmt.Errorf("failed to marshal preferences: %w", err)
	}
	
	input := &dynamodb.PutItemInput{
		TableName: aws.String(r.prefsTable),
		Item:      av,
	}
	
	_, err = r.db.PutItem(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to update preferences: %w", err)
	}
	
	return nil
}

func (r *userRepository) CreateAddress(ctx context.Context, address *models.Address) error {
	address.CreatedAt = time.Now()
	address.UpdatedAt = time.Now()
	
	av, err := attributevalue.MarshalMap(address)
	if err != nil {
		return fmt.Errorf("failed to marshal address: %w", err)
	}
	
	input := &dynamodb.PutItemInput{
		TableName: aws.String(r.addressTable),
		Item:      av,
	}
	
	_, err = r.db.PutItem(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to create address: %w", err)
	}
	
	return nil
}

func (r *userRepository) GetAddress(ctx context.Context, addressID string) (*models.Address, error) {
	input := &dynamodb.GetItemInput{
		TableName: aws.String(r.addressTable),
		Key: map[string]types.AttributeValue{
			"addressId": &types.AttributeValueMemberS{Value: addressID},
		},
	}
	
	result, err := r.db.GetItem(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to get address: %w", err)
	}
	
	if result.Item == nil {
		return nil, nil
	}
	
	var address models.Address
	err = attributevalue.UnmarshalMap(result.Item, &address)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal address: %w", err)
	}
	
	return &address, nil
}

func (r *userRepository) GetUserAddresses(ctx context.Context, userID string) ([]*models.Address, error) {
	input := &dynamodb.QueryInput{
		TableName:              aws.String(r.addressTable),
		IndexName:              aws.String("userId-index"),
		KeyConditionExpression: aws.String("userId = :userId"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":userId": &types.AttributeValueMemberS{Value: userID},
		},
	}
	
	result, err := r.db.Query(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to query addresses: %w", err)
	}
	
	var addresses []*models.Address
	for _, item := range result.Items {
		var address models.Address
		err = attributevalue.UnmarshalMap(item, &address)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal address: %w", err)
		}
		addresses = append(addresses, &address)
	}
	
	return addresses, nil
}

func (r *userRepository) UpdateAddress(ctx context.Context, address *models.Address) error {
	address.UpdatedAt = time.Now()
	
	av, err := attributevalue.MarshalMap(address)
	if err != nil {
		return fmt.Errorf("failed to marshal address: %w", err)
	}
	
	input := &dynamodb.PutItemInput{
		TableName: aws.String(r.addressTable),
		Item:      av,
		ConditionExpression: aws.String("attribute_exists(addressId)"),
	}
	
	_, err = r.db.PutItem(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to update address: %w", err)
	}
	
	return nil
}

func (r *userRepository) DeleteAddress(ctx context.Context, addressID string) error {
	input := &dynamodb.DeleteItemInput{
		TableName: aws.String(r.addressTable),
		Key: map[string]types.AttributeValue{
			"addressId": &types.AttributeValueMemberS{Value: addressID},
		},
	}
	
	_, err := r.db.DeleteItem(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to delete address: %w", err)
	}
	
	return nil
}