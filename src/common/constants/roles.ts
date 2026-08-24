export const Roles = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
