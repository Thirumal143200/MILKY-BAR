import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { useSyncStore } from '../store/sync.store';

export default function PreviewScreen({
  route,
  navigation,
}: {
  route: { params: { photoPath: string } };
  navigation: any;
}) {
  const { photoPath } = route.params;
  const addScan = useSyncStore((state) => state.addScan);
  const [isSaved, setIsSaved] = useState(false);

  const imageUri =
    photoPath.startsWith('http') || photoPath.startsWith('file://')
      ? photoPath
      : 'file://' + photoPath;

  const saveScan = () => {
    // Add to local state store as completed/synced since we do it in foreground
    addScan({
      id: Date.now().toString(),
      imageUri,
      timestamp: Date.now(),
      status: 'synced',
    });
    setIsSaved(true);
    setTimeout(() => {
      navigation.replace('Processing', { photoPath: imageUri });
    }, 500);
  };

  return (
    <View className="flex-1 bg-black">
      <Image source={{ uri: imageUri }} className="flex-1" resizeMode="contain" />

      <View className="absolute bottom-10 left-0 right-0 flex-row justify-evenly">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-gray-800 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-bold text-lg">Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={saveScan}
          disabled={isSaved}
          className={`${isSaved ? 'bg-green-600' : 'bg-blue-600'} px-6 py-3 rounded-full flex-row items-center`}
        >
          <Text className="text-white font-bold text-lg">
            {isSaved ? 'Saved to Queue' : 'Save & Analyze'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
