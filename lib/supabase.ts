import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
// import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
// Access variables directly from process.env because of the EXPO_PUBLIC_ prefix
// Expo automatically makes variables starting with EXPO_PUBLIC_ available in the client-side bundle.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Basic validation to ensure the variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing in environment variables. ' +
                  'Please ensure your .env file is correctly configured with EXPO_PUBLIC_SUPABASE_URL ' +
                  'and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
