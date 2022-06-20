export interface JWTPayload {
  userId: number;
  displayName: string;
  mobileNumber: string;
  email: string;
  roles: string[];
  grants: Record<string, string[]>[];
}