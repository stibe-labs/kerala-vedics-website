export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  dosha_affinity: string;
  phone?: string;
  created_at: string;
}

// Global in-memory user registry for persistent development and verified signups
const globalUsers: Map<string, StoredUser> = (globalThis as any).__kvUsers || new Map<string, StoredUser>();
(globalThis as any).__kvUsers = globalUsers;

export function saveUser(user: StoredUser) {
  globalUsers.set(user.email.toLowerCase().trim(), user);
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return globalUsers.get(email.toLowerCase().trim());
}
