import { useEffect, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { supabase } from '../../lib/supabase';

const PAGE_SIZE = 20;
const bannedWords = ["fuck"];

export default function ChatScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastMessageTime, setLastMessageTime] = useState<string | null>(null);

  const containsBannedWord = (text: string) => {
    const normalized = text.toLowerCase();
    return bannedWords.some((word) => normalized.includes(word));
  };

  const fetchMessages = async (isInitial = false) => {
    if (!hasMore && !isInitial) return;

    const query = supabase
      .from('messages')
      .select('id, content, created_at, profiles(display_name)')
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (!isInitial && lastMessageTime) {
      query.lt('created_at', lastMessageTime);
    }

    const { data, error } = await query;

    if (error) {
      Alert.alert('Error fetching messages', error.message);
      return;
    }

    if (data.length < PAGE_SIZE) {
      setHasMore(false);
    }

    const updated = [...messages, ...data.reverse()];
    setMessages(updated);
    if (data.length > 0) {
      setLastMessageTime(data[data.length - 1].created_at);
    }
  };

  const sendMessage = async () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    if (containsBannedWord(trimmed)) {
      Alert.alert('Message not allowed', 'Your message contains inappropriate content.');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
    Alert.alert('Error', 'No user session found.');
    return;
}
    const { error } = await supabase.from('messages').insert({
      content: trimmed,
      user_id: user.id,
    });

    if (error) {
      Alert.alert('Send failed', error.message);
    } else {
      setMessageText('');
    }
  };

  const setupRealtime = useCallback(() => {
    const channel = supabase
      .channel('realtime:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new;
          setMessages((current) => [...current, { ...newMessage, profiles: { display_name: 'Someone' } }]);
          // NOTE: This will update in realtime, but display_name won't appear unless fetched again.
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setMessages([]);
    setHasMore(true);
    fetchMessages(true);
    const unsubscribe = setupRealtime();
    return unsubscribe;
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.message}>
      <Text style={styles.sender}>{item.profiles?.display_name || 'Unknown'}</Text>
      <Text>{item.content}</Text>
      <Text style={styles.time}>{new Date(item.created_at).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onEndReached={() => fetchMessages()}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
          style={styles.input}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  message: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  sender: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  time: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
  },
});
