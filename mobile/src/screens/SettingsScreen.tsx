import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwt_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user_role');
    navigation.replace('Login');
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { label: 'Profile', route: 'Profile' },
        { label: 'Scan History', route: 'ScanHistory' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', route: 'Help' },
        { label: 'Feedback', route: 'Feedback' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { label: 'About', route: 'About' },
        { label: 'Privacy Policy', route: 'Privacy' },
        { label: 'Terms of Service', route: 'Terms' },
      ],
    },
  ];

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-black p-4">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-white text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {sections.map((section, idx) => (
          <View key={idx} className="mb-6">
            <Text className="text-gray-400 font-bold mb-2 ml-2 uppercase tracking-wider text-xs">
              {section.title}
            </Text>
            <View className="bg-gray-900 rounded-xl overflow-hidden">
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={itemIdx}
                  onPress={() => navigation.navigate(item.route)}
                  className={`p-4 flex-row justify-between items-center ${
                    itemIdx !== section.items.length - 1 ? 'border-b border-gray-800' : ''
                  }`}
                >
                  <Text className="text-white text-lg">{item.label}</Text>
                  <Text className="text-gray-500">›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-900/30 p-4 rounded-xl mt-4 mb-10 border border-red-900/50"
        >
          <Text className="text-red-500 font-bold text-center text-lg">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
