import type { Request } from 'express';

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};
