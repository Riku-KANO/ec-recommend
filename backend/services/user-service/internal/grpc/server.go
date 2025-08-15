package grpc

import (
	"context"

	"github.com/ec-recommend/user-service/internal/models"
	"github.com/ec-recommend/user-service/internal/service"
	userv1 "github.com/ec-recommend/user-service/proto/user/v1"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"
)

type UserServiceServer struct {
	userv1.UnimplementedUserServiceServer
	userService service.UserService
}

func NewUserServiceServer(userService service.UserService) *UserServiceServer {
	return &UserServiceServer{
		userService: userService,
	}
}

func (s *UserServiceServer) CreateUser(ctx context.Context, req *userv1.CreateUserRequest) (*userv1.CreateUserResponse, error) {
	user := &models.User{
		UserID:      req.UserId,
		Email:       req.Email,
		Username:    req.Username,
		DisplayName: req.DisplayName,
		Language:    req.Language,
	}
	
	err := s.userService.CreateUser(ctx, user)
	if err != nil {
		if err == service.ErrEmailAlreadyExists {
			return nil, status.Error(codes.AlreadyExists, "email already exists")
		}
		if err == service.ErrInvalidInput {
			return nil, status.Error(codes.InvalidArgument, "invalid input")
		}
		return nil, status.Error(codes.Internal, "failed to create user")
	}
	
	return &userv1.CreateUserResponse{
		User: modelToProtoUser(user),
	}, nil
}

func (s *UserServiceServer) GetUser(ctx context.Context, req *userv1.GetUserRequest) (*userv1.GetUserResponse, error) {
	user, err := s.userService.GetUser(ctx, req.UserId)
	if err != nil {
		if err == service.ErrUserNotFound {
			return nil, status.Error(codes.NotFound, "user not found")
		}
		return nil, status.Error(codes.Internal, "failed to get user")
	}
	
	return &userv1.GetUserResponse{
		User: modelToProtoUser(user),
	}, nil
}

func (s *UserServiceServer) GetCurrentUser(ctx context.Context, req *userv1.GetCurrentUserRequest) (*userv1.GetCurrentUserResponse, error) {
	user, err := s.userService.GetUser(ctx, req.UserId)
	if err != nil {
		if err == service.ErrUserNotFound {
			return nil, status.Error(codes.NotFound, "user not found")
		}
		return nil, status.Error(codes.Internal, "failed to get user")
	}
	
	return &userv1.GetCurrentUserResponse{
		User: modelToProtoUser(user),
	}, nil
}

func (s *UserServiceServer) UpdateUser(ctx context.Context, req *userv1.UpdateUserRequest) (*userv1.UpdateUserResponse, error) {
	updates := make(map[string]interface{})
	
	if req.Fields != nil {
		if req.Fields.DisplayName != nil {
			updates["displayName"] = *req.Fields.DisplayName
		}
		if req.Fields.Bio != nil {
			updates["bio"] = *req.Fields.Bio
		}
		if req.Fields.ProfilePicture != nil {
			updates["profilePicture"] = *req.Fields.ProfilePicture
		}
		if req.Fields.PhoneNumber != nil {
			updates["phoneNumber"] = *req.Fields.PhoneNumber
		}
		if req.Fields.DateOfBirth != nil {
			updates["dateOfBirth"] = *req.Fields.DateOfBirth
		}
		if req.Fields.Gender != nil {
			updates["gender"] = *req.Fields.Gender
		}
		if req.Fields.Language != nil {
			updates["language"] = *req.Fields.Language
		}
		if req.Fields.Country != nil {
			updates["country"] = *req.Fields.Country
		}
	}
	
	user, err := s.userService.UpdateUser(ctx, req.UserId, updates)
	if err != nil {
		if err == service.ErrUserNotFound {
			return nil, status.Error(codes.NotFound, "user not found")
		}
		return nil, status.Error(codes.Internal, "failed to update user")
	}
	
	return &userv1.UpdateUserResponse{
		User: modelToProtoUser(user),
	}, nil
}

func (s *UserServiceServer) DeleteUser(ctx context.Context, req *userv1.DeleteUserRequest) (*emptypb.Empty, error) {
	err := s.userService.DeleteUser(ctx, req.UserId)
	if err != nil {
		if err == service.ErrUserNotFound {
			return nil, status.Error(codes.NotFound, "user not found")
		}
		return nil, status.Error(codes.Internal, "failed to delete user")
	}
	
	return &emptypb.Empty{}, nil
}

func (s *UserServiceServer) GetUserByEmail(ctx context.Context, req *userv1.GetUserByEmailRequest) (*userv1.GetUserByEmailResponse, error) {
	user, err := s.userService.GetUserByEmail(ctx, req.Email)
	if err != nil {
		if err == service.ErrUserNotFound {
			return nil, status.Error(codes.NotFound, "user not found")
		}
		return nil, status.Error(codes.Internal, "failed to get user by email")
	}
	
	return &userv1.GetUserByEmailResponse{
		User: modelToProtoUser(user),
	}, nil
}

func (s *UserServiceServer) GetUserPreferences(ctx context.Context, req *userv1.GetUserPreferencesRequest) (*userv1.GetUserPreferencesResponse, error) {
	prefs, err := s.userService.GetUserPreferences(ctx, req.UserId)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to get preferences")
	}
	
	return &userv1.GetUserPreferencesResponse{
		Preferences: modelToProtoPreferences(prefs),
	}, nil
}

func (s *UserServiceServer) UpdateUserPreferences(ctx context.Context, req *userv1.UpdateUserPreferencesRequest) (*emptypb.Empty, error) {
	prefs := protoToModelPreferences(req.Preferences)
	err := s.userService.UpdateUserPreferences(ctx, req.UserId, prefs)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to update preferences")
	}
	
	return &emptypb.Empty{}, nil
}

func (s *UserServiceServer) CreateAddress(ctx context.Context, req *userv1.CreateAddressRequest) (*userv1.CreateAddressResponse, error) {
	address := &models.Address{
		UserID:        req.UserId,
		Type:          req.Type,
		IsDefault:     req.IsDefault,
		RecipientName: req.RecipientName,
		PhoneNumber:   req.PhoneNumber,
		AddressLine1:  req.AddressLine1,
		AddressLine2:  req.AddressLine2,
		City:          req.City,
		State:         req.State,
		PostalCode:    req.PostalCode,
		Country:       req.Country,
	}
	
	err := s.userService.CreateAddress(ctx, req.UserId, address)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to create address")
	}
	
	return &userv1.CreateAddressResponse{
		Address: modelToProtoAddress(address),
	}, nil
}

func (s *UserServiceServer) GetAddress(ctx context.Context, req *userv1.GetAddressRequest) (*userv1.GetAddressResponse, error) {
	addresses, err := s.userService.GetUserAddresses(ctx, req.AddressId)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to get addresses")
	}
	
	for _, addr := range addresses {
		if addr.AddressID == req.AddressId {
			return &userv1.GetAddressResponse{
				Address: modelToProtoAddress(addr),
			}, nil
		}
	}
	
	return nil, status.Error(codes.NotFound, "address not found")
}

func (s *UserServiceServer) GetUserAddresses(ctx context.Context, req *userv1.GetUserAddressesRequest) (*userv1.GetUserAddressesResponse, error) {
	addresses, err := s.userService.GetUserAddresses(ctx, req.UserId)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to get addresses")
	}
	
	protoAddresses := make([]*userv1.Address, len(addresses))
	for i, addr := range addresses {
		protoAddresses[i] = modelToProtoAddress(addr)
	}
	
	return &userv1.GetUserAddressesResponse{
		Addresses: protoAddresses,
	}, nil
}

func (s *UserServiceServer) UpdateAddress(ctx context.Context, req *userv1.UpdateAddressRequest) (*emptypb.Empty, error) {
	address := &models.Address{
		AddressID: req.AddressId,
		UserID:    req.UserId,
	}
	
	if req.Fields != nil {
		if req.Fields.Type != nil {
			address.Type = *req.Fields.Type
		}
		if req.Fields.IsDefault != nil {
			address.IsDefault = *req.Fields.IsDefault
		}
		if req.Fields.RecipientName != nil {
			address.RecipientName = *req.Fields.RecipientName
		}
		if req.Fields.PhoneNumber != nil {
			address.PhoneNumber = *req.Fields.PhoneNumber
		}
		if req.Fields.AddressLine1 != nil {
			address.AddressLine1 = *req.Fields.AddressLine1
		}
		if req.Fields.AddressLine2 != nil {
			address.AddressLine2 = *req.Fields.AddressLine2
		}
		if req.Fields.City != nil {
			address.City = *req.Fields.City
		}
		if req.Fields.State != nil {
			address.State = *req.Fields.State
		}
		if req.Fields.PostalCode != nil {
			address.PostalCode = *req.Fields.PostalCode
		}
		if req.Fields.Country != nil {
			address.Country = *req.Fields.Country
		}
	}
	
	err := s.userService.UpdateAddress(ctx, req.UserId, req.AddressId, address)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to update address")
	}
	
	return &emptypb.Empty{}, nil
}

func (s *UserServiceServer) DeleteAddress(ctx context.Context, req *userv1.DeleteAddressRequest) (*emptypb.Empty, error) {
	err := s.userService.DeleteAddress(ctx, req.UserId, req.AddressId)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to delete address")
	}
	
	return &emptypb.Empty{}, nil
}

