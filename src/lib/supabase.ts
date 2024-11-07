import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
        };
        Insert: {
          email: string;
          name: string;
          password?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          name: string;
          job_title?: string;
          image_url?: string;
          about?: string;
          website?: string;
          calendar_link?: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          job_title?: string;
          image_url?: string;
          about?: string;
          website?: string;
          calendar_link?: string;
          user_id: string;
        };
      };
      contact_methods: {
        Row: {
          id: string;
          type: string;
          value: string;
          is_primary: boolean;
          contact_id: string;
        };
        Insert: {
          type: string;
          value: string;
          is_primary: boolean;
          contact_id: string;
        };
      };
      social_links: {
        Row: {
          id: string;
          platform: string;
          url: string;
          contact_id: string;
        };
        Insert: {
          platform: string;
          url: string;
          contact_id: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          date: string;
          summary: string;
          transcript?: string;
          contact_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          date: string;
          summary: string;
          transcript?: string;
          contact_id: string;
        };
      };
    };
  };
};