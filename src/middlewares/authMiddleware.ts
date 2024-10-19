import dotenv from 'dotenv';

dotenv.config();

const users: string[] = process.env.ALLOWED_USERS?.split(',') || [];

export function checkUserAccess(userId: string | undefined): boolean {
  if (!userId) return false;
  return users.includes(userId);
}
