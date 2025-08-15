import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileForm } from './ProfileForm';
import { User } from '../types';

describe('ProfileForm', () => {
  const mockUser: User = {
    userId: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    displayName: 'Test User',
    bio: 'Test bio',
    phoneNumber: '090-1234-5678',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    country: 'Japan',
    language: 'ja',
    isActive: true,
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form with user data', () => {
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    expect(screen.getByDisplayValue('test@example.com')).toBeDisabled();
    expect(screen.getByDisplayValue('testuser')).toBeDisabled();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
    expect(screen.getByDisplayValue('090-1234-5678')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1990-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('male')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Japan')).toBeInTheDocument();
  });

  it('should handle form submission successfully', async () => {
    mockOnSubmit.mockResolvedValue(true);
    const user = userEvent.setup();

    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    const displayNameInput = screen.getByLabelText('表示名');
    await user.clear(displayNameInput);
    await user.type(displayNameInput, 'Updated Name');

    const submitButton = screen.getByText('変更を保存');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        displayName: 'Updated Name',
        bio: 'Test bio',
        phoneNumber: '090-1234-5678',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        country: 'Japan',
      });
    });

    expect(screen.getByText('プロフィールを更新しました')).toBeInTheDocument();
  });

  it('should handle form submission error', async () => {
    mockOnSubmit.mockResolvedValue(false);
    const user = userEvent.setup();

    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText('変更を保存');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('更新に失敗しました')).toBeInTheDocument();
    });
  });

  it('should update form fields', async () => {
    const user = userEvent.setup();
    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    const bioTextarea = screen.getByPlaceholderText('自己紹介を入力');
    await user.clear(bioTextarea);
    await user.type(bioTextarea, 'New bio text');

    const phoneInput = screen.getByLabelText('電話番号');
    await user.clear(phoneInput);
    await user.type(phoneInput, '080-9876-5432');

    const genderSelect = screen.getByLabelText('性別');
    await user.selectOptions(genderSelect, 'female');

    expect(bioTextarea).toHaveValue('New bio text');
    expect(phoneInput).toHaveValue('080-9876-5432');
    expect(genderSelect).toHaveValue('female');
  });

  it('should disable submit button while saving', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 1000)));
    const user = userEvent.setup();

    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText('変更を保存');
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should clear messages when form is updated', async () => {
    mockOnSubmit.mockResolvedValue(true);
    const user = userEvent.setup();

    render(<ProfileForm user={mockUser} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText('変更を保存');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('プロフィールを更新しました')).toBeInTheDocument();
    });

    const displayNameInput = screen.getByLabelText('表示名');
    await user.type(displayNameInput, ' Modified');

    expect(screen.queryByText('プロフィールを更新しました')).not.toBeInTheDocument();
  });
});