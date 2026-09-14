export interface Role {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  roleId?: string | null;
  role?: Role | null;
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
  role?: string;
}

export interface AuthResponse {
  accessToken: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    role?: string;
  };
}
