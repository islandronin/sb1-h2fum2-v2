import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

export const auth = {
  async register(data: { email: string; password: string; name: string }) {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
      },
    });

    if (signUpError) throw new Error(signUpError.message);

    // Create user profile in users table
    const { error: profileError } = await supabase
      .from('users')
      .insert([{ id: authData.user?.id, email: data.email, name: data.name }]);

    if (profileError) throw new Error(profileError.message);

    return { user: authData.user, session: authData.session };
  },

  async login(data: { email: string; password: string }) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw new Error(error.message);
    return { user: authData.user, session: authData.session };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw new Error(error.message);
    return user;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },
};

export const contacts = {
  async getAll() {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        contact_methods (*),
        social_links (*),
        conversations (*)
      `);

    if (error) throw new Error(error.message);
    return data;
  },

  async create(contact: any) {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contact])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, contact: any) {
    const { data, error } = await supabase
      .from('contacts')
      .update(contact)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },
};