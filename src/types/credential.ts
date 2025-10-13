export interface Credential {
  id: string;
  userId: string;
  title: string;
  category: CredentialCategory;
  username: string;
  encryptedPassword: string;
  website?: string;
  notes?: string;
  tags: string[];
  password?: string;
  passwordHistory: PasswordHistory[];
  lastPasswordChange: Date;
  passwordChangeReminder: Date;
  createdAt: Date;
  updatedAt: Date;
  lastAccessed?: Date;
  isFavorite: boolean;
}

export interface PasswordHistory {
  id: string;
  encryptedPassword: string;
  createdAt: Date;
}

export enum CredentialCategory {
  BANKING = "banking",
  EMAIL = "email",
  SOCIAL_MEDIA = "social_media",
  WORK = "work",
  SHOPPING = "shopping",
  ENTERTAINMENT = "entertainment",
  GOVERNMENT = "government",
  HEALTH = "health",
  EDUCATION = "education",
  OTHER = "other",
}

export interface User {
  uid: string;
  email: string;
  masterPasswordHash: string;
  createdAt: Date;
  lastLogin: Date;
  settings: UserSettings;
}

export interface UserSettings {
  passwordReminderFrequency: number; // days
  autoLockTimeout: number; // minutes
  requireMasterPasswordForView: boolean;
  enablePasswordHistory: boolean;
  maxPasswordHistory: number;
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  suggestions: string[];
}

export interface SearchFilter {
  query: string;
  category?: CredentialCategory;
  tags?: string[];
  favorites?: boolean;
}
