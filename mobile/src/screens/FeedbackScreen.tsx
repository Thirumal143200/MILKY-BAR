import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../api/client';

type FeedbackType = 'feedback' | 'bug_report' | 'feature_request';
type PriorityType = 'low' | 'medium' | 'high' | 'critical';

export default function FeedbackScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();

  const [type, setType] = useState<FeedbackType>('feedback');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<PriorityType>('medium');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    if (message.length < 10) {
      Alert.alert('Error', 'Message must be at least 10 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/feedback', {
        type,
        subject: subject.trim(),
        message: message.trim(),
        priority,
      });

      Alert.alert(
        'Feedback Submitted',
        'Thank you for your feedback! Our support team will review it.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (e: any) {
      console.error(e);
      const errMsg = e.response?.data?.message || 'Failed to submit feedback. Please try again.';
      Alert.alert('Submission Failed', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="bg-gray-900 px-4"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-6 mt-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-white text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold">Feedback</Text>
      </View>

      <View className="bg-gray-800/40 border border-gray-800 rounded-3xl p-6 mb-8 space-y-4">
        {/* Type Selector */}
        <View>
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            Category
          </Text>
          <View className="flex-row space-x-2">
            {(['feedback', 'bug_report', 'feature_request'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                className={`flex-1 py-2.5 rounded-xl border items-center ${
                  type === t ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-gray-700'
                }`}
              >
                <Text
                  className={`font-semibold text-[10px] capitalize ${
                    type === t ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {t.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority Selector */}
        <View className="mt-4">
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            Priority
          </Text>
          <View className="flex-row space-x-2">
            {(['low', 'medium', 'high', 'critical'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                className={`flex-1 py-2.5 rounded-xl border items-center ${
                  priority === p ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-gray-700'
                }`}
              >
                <Text
                  className={`font-semibold text-[10px] capitalize ${
                    priority === p ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subject Input */}
        <View className="mt-4">
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            Subject
          </Text>
          <TextInput
            className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700"
            placeholder="Summarize your issue..."
            placeholderTextColor="#9ca3af"
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        {/* Message Input */}
        <View className="mt-4">
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            Message
          </Text>
          <TextInput
            className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 h-32"
            placeholder="Provide details (min 10 characters)..."
            placeholderTextColor="#9ca3af"
            multiline
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmitFeedback}
          disabled={isLoading}
          className={`bg-blue-600 py-4 rounded-xl flex-row justify-center items-center mt-6 ${
            isLoading ? 'opacity-70' : ''
          }`}
        >
          {isLoading ? <ActivityIndicator size="small" color="#ffffff" className="mr-2" /> : null}
          <Text className="text-white font-bold text-lg">
            {isLoading ? 'Submitting...' : 'Submit Feedback'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
