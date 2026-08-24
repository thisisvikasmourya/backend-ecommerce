import { Role } from '../constants/roles.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}
