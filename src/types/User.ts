export interface UserDto {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  isActive: boolean;
  isAdmin: boolean;
  isVerified: boolean;
}
