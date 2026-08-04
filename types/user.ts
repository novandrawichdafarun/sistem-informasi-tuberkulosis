export type UserRole = "pasien" | "super_admin";

export interface UserData {
  id_user: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
}

export interface UpdateUserPayload {
  id_user: string;
  email: string;
  password?: string;
}
