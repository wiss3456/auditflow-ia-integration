export interface User {
  department?: string;
  id: string;
  name?: string;
  avatar?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  username?: string;

  [key: string]: unknown;
}
