export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const;

export type SystemRole = (typeof ROLES)['ADMIN'] | (typeof ROLES)['USER'];
export type ActiveRole = 'TEACHER' | 'STUDENT';
export type UserRole = (typeof ROLES)[keyof typeof ROLES];

