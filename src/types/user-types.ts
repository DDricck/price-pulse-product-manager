
import { User } from '@supabase/supabase-js';

// Use type augmentation for our application-specific user data
export type AppUser = User & {
  email: string; // Make email required for our app
  created_at: string;
  last_sign_in_at: string | null;
};

export type UserRole = {
  id: string;
  user_id: string;
  user_admin: string;
  created_at: string;
  updated_at: string;
};
