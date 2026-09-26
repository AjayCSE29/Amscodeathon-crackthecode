export interface UserCredential {
  id: string;
  userId: string;
  teamName: string;
  password?: string;
  isActive: boolean;
}

const STORAGE_KEY = 'amscodeathon_users';

export function getUsers(): UserCredential[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading users from local storage", e);
    return [];
  }
}

export function saveUsers(users: UserCredential[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Error saving users to local storage", e);
  }
}
