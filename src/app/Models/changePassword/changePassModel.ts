export interface PasswordChangeRequest {
  companyId: string;
  userId: string;
  userName: string;
  oldPassword?: string | null | undefined;
  newPassword?: string | null | undefined;
  confirmPassword?: string | null | undefined;
}
