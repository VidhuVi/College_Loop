import { useEffect, useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

export default function ProfileSetup() {
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('Error', 'No user session found');
      router.replace('/login');
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile && profile.display_name && profile.phone_number) {
      // Already completed profile, skip to home
      setTimeout(() => {
      router.replace('/chat');
      }, 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

    const handleSubmit = async () => {
    const cleanedPhone = phoneNumber.trim();

    // Validate display name
    if (!displayName.trim()) {
        Alert.alert('Validation Error', 'Display name is required');
        return;
    }

    // Validate phone number: exactly 10 digits
    const isValidPhone = /^[0-9]{10}$/.test(cleanedPhone);
    if (!isValidPhone) {
        Alert.alert('Validation Error', 'Phone number must be exactly 10 digits');
        return;
    }

    setSubmitting(true);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        Alert.alert('Error', 'No user session');
        return;
    }

    const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name: displayName.trim(),
        phone_number: cleanedPhone,
    });

    setSubmitting(false);

    if (error) {
        Alert.alert('Error', error.message);
    } else {
        setTimeout(() => {
        router.replace('/chat');
        }, 0);
    }
    };


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Set Up Your Profile</Text>
      <TextInput
        placeholder="Display Name"
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TextInput
        placeholder="Phone Number"
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <Button title={submitting ? 'Submitting...' : 'Submit'} onPress={handleSubmit} disabled={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 16,
    borderRadius: 6,
  },
});
