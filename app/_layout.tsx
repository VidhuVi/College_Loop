import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndProfile = async () => {
      // Get session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const segment = segments[0]; // e.g., "", "login", "profile", "(tabs)"

      if (!session) {
        if (segment !== 'login') {
          router.replace('/login');
        }
        setLoading(false);
        return;
      }

      // Session exists: check if profile exists
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
      // Something went wrong, maybe session expired
      router.replace('/login');
      setLoading(false);
      return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, phone_number')
        .eq('id', user.id)
        .single();

      const profileComplete = profile?.display_name && profile?.phone_number;

      if (!profileComplete && segment !== 'profile') {
        router.replace('/profile');
      } else if (profileComplete && (segment === 'login' || segment === 'profile')) {
        setTimeout(() => {
        router.replace('/chat');
        }, 0);
      }

      setLoading(false);
    };

    checkSessionAndProfile();
  }, [segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{
        headerShown: false,
      }}/>;
}
