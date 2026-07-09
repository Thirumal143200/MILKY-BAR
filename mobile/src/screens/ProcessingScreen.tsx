import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { apiCreateScan, apiUploadImage, apiAnalyzeScan } from '../api/client';

export default function ProcessingScreen({ route, navigation }: { route: any; navigation: any }) {
  const { photoPath } = route.params;
  const [statusText, setStatusText] = useState('Initializing scan...');
  const [progress, setProgress] = useState(0.1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    // Progression of descriptive texts
    const statuses = [
      { text: 'Uploading high-resolution sample...', delay: 0 },
      { text: 'Checking image quality and blur...', delay: 1000 },
      { text: 'Performing color metric analysis...', delay: 2200 },
      { text: 'Running AI classification model...', delay: 3500 },
      { text: 'Finalizing quality assessment...', delay: 4800 },
    ];

    statuses.forEach((s) => {
      setTimeout(() => {
        if (active && !error) {
          setStatusText(s.text);
          setProgress((prev) => Math.min(prev + 0.18, 0.95));
        }
      }, s.delay);
    });

    const runAnalysisPipeline = async () => {
      try {
        // Step 1: Create scan record
        if (!active) return;
        const scanRes = await apiCreateScan({ deviceId: 'mobile-app' });
        const scanId = scanRes.data.id;

        // Step 2: Upload image
        if (!active) return;
        await apiUploadImage(scanId, photoPath);

        // Step 3: Run AI Analysis
        if (!active) return;
        const analysisRes = await apiAnalyzeScan(scanId);

        // Success! Go to Result Screen
        if (active) {
          setProgress(1.0);
          setStatusText('Analysis completed!');
          setTimeout(() => {
            navigation.replace('Result', { scanId, prediction: analysisRes.data[0] });
          }, 600);
        }
      } catch (err: any) {
        if (active) {
          console.error(err);
          const errMsg = err.response?.data?.message || err.message || 'Server connection issue';
          setError(errMsg);
        }
      }
    };

    runAnalysisPipeline();

    return () => {
      active = false;
    };
  }, [photoPath, navigation, error]);

  const handleBack = () => {
    navigation.navigate('Home');
  };

  return (
    <View className="flex-1 bg-gray-950 justify-center items-center px-8">
      {!error ? (
        <View className="items-center w-full">
          {/* Animated/Glowing Scanning Indicator */}
          <View className="relative w-40 h-40 items-center justify-center mb-10">
            <View className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
            <View className="w-32 h-32 rounded-full bg-blue-600/10 border border-blue-500/40 justify-center items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
            <View className="absolute top-0 bottom-0 left-0 right-0 justify-center items-center">
              <Text className="text-blue-500 font-bold text-xl">{Math.round(progress * 100)}%</Text>
            </View>
          </View>

          <Text className="text-white text-2xl font-bold mb-3 text-center tracking-wide">
            Processing Milk Sample
          </Text>
          <Text className="text-blue-400 font-medium text-center text-sm h-6">{statusText}</Text>

          <View className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-6">
            <View
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
        </View>
      ) : (
        <View className="items-center w-full">
          <View className="w-20 h-20 bg-red-950/40 border border-red-500/50 rounded-full justify-center items-center mb-6">
            <Text className="text-3xl">⚠️</Text>
          </View>
          <Text className="text-white text-2xl font-bold mb-2">Analysis Failed</Text>
          <Text className="text-gray-400 text-center mb-8 px-4 text-sm">{error}</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Camera')}
            className="w-full bg-blue-600 py-3.5 rounded-xl items-center mb-4"
          >
            <Text className="text-white font-bold text-lg">Retake Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBack}
            className="w-full bg-gray-800 py-3.5 rounded-xl items-center"
          >
            <Text className="text-gray-300 font-semibold text-lg">Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
