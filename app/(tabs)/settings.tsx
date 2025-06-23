import { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const [profile, setProfile] = useState<{ display_name: string; phone_number: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('Error', 'No user session found.');
      router.replace('/login');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('display_name, phone_number')
      .eq('id', user.id)
      .single();

    if (error) {
      Alert.alert('Error loading profile', error.message);
    } else {
      setProfile(data);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout error', error.message);
    } else {
      router.replace('/login');
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>
      <Text style={styles.label}>Display Name</Text>
      <Text style={styles.value}>{profile?.display_name || 'N/A'}</Text>

      <Text style={styles.label}>Phone Number</Text>
      <Text style={styles.value}>{profile?.phone_number || 'N/A'}</Text>

      <View style={{ marginTop: 30 }}>
        <Button title="Log Out" color="red" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 10 },
  value: { fontSize: 16, marginBottom: 8 },
});
