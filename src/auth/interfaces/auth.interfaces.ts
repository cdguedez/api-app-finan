export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  /** Token biométrico registrado desde el dispositivo Expo */
  biometricToken?: string;
  createdAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: Pick<User, 'firstName' | 'lastName'>;
}
