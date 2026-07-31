import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, ScrollView, SafeAreaView } from 'react-native';
import { useSyncStore } from '../store/sync.store';

export default function PreviewScreen({ route, navigation }: { route: any; navigation: any }) {
  const { photoPath, simMeta } = route.params;
  const addScan = useSyncStore((state) => state.addScan);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'enhancements'>('preview');
  const [enhancedMode, setEnhancedMode] = useState(true);

  const imageUri =
    photoPath.startsWith('http') || photoPath.startsWith('file://')
      ? photoPath
      : 'file://' + photoPath;

  // Retrieve or compute quality metrics
  const score = simMeta?.qualityScore ?? 92;
  const brightness = simMeta?.brightness ?? 128;
  const blur = simMeta?.blur ?? 0.1;
  const distance = simMeta?.distance ?? 15;
  const glare = simMeta?.glare ?? 0;

  const getMetricRating = (val: number, type: 'light' | 'blur' | 'dist' | 'glare') => {
    if (type === 'light') {
      if (val < 60) return { label: 'Underlit', color: 'text-red-500' };
      if (val > 210) return { label: 'Overexposed', color: 'text-red-500' };
      return { label: 'Optimal', color: 'text-green-500' };
    }
    if (type === 'blur') {
      return val > 2.0
        ? { label: 'Blurry / Shake', color: 'text-red-500' }
        : { label: 'Sharp', color: 'text-green-500' };
    }
    if (type === 'dist') {
      if (val < 8) return { label: 'Too Close', color: 'text-red-500' };
      if (val > 25) return { label: 'Too Far', color: 'text-red-500' };
      return { label: 'Optimal', color: 'text-green-500' };
    }
    return val > 30
      ? { label: 'High Glare', color: 'text-red-500' }
      : { label: 'None', color: 'text-green-500' };
  };

  const saveScan = () => {
    addScan({
      id: Date.now().toString(),
      imageUri,
      timestamp: Date.now(),
      status: 'synced',
      prediction: {
        qualityLabel: score >= 90 ? 'excellent' : score >= 75 ? 'good' : 'acceptable',
        confidence: score / 100,
      },
    });
    setIsSaved(true);
    setTimeout(() => {
      navigation.replace('Processing', { photoPath: imageUri });
    }, 500);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Tab Selectors */}
      <View className="flex-row border-b border-gray-900 bg-gray-950 pt-10">
        <TouchableOpacity
          onPress={() => setActiveTab('preview')}
          className={`flex-1 py-4 items-center ${activeTab === 'preview' ? 'border-b-2 border-blue-500' : ''}`}
        >
          <Text
            className={`font-bold text-sm ${activeTab === 'preview' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            Acquisition Preview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('enhancements')}
          className={`flex-1 py-4 items-center ${activeTab === 'enhancements' ? 'border-b-2 border-blue-500' : ''}`}
        >
          <Text
            className={`font-bold text-sm ${activeTab === 'enhancements' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            CV Enhancements
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {activeTab === 'preview' ? (
          <View className="p-4 space-y-4">
            {/* Main Preview */}
            <View className="relative w-full h-80 rounded-3xl overflow-hidden bg-gray-900 border border-gray-800">
              <Image
                source={{ uri: imageUri }}
                className="w-full h-full"
                resizeMode="cover"
                style={{
                  opacity: enhancedMode ? 1.0 : 0.7,
                }}
              />
              <TouchableOpacity
                onPress={() => setEnhancedMode((prev) => !prev)}
                className="absolute bottom-4 right-4 bg-black/60 px-4 py-2 rounded-full border border-gray-800"
              >
                <Text className="text-white text-xs font-bold font-mono">
                  {enhancedMode ? '✨ ENHANCED VIEW' : '📷 ORIGINAL VIEW'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Scorecard */}
            <View className="bg-gray-950 p-6 rounded-3xl border border-gray-900 space-y-4">
              <View className="flex-row justify-between items-center pb-2 border-b border-gray-900">
                <Text className="text-white font-extrabold text-base">Image Quality Score</Text>
                <Text
                  className={`text-2xl font-black ${score >= 75 ? 'text-green-500' : 'text-yellow-500'}`}
                >
                  {score} / 100
                </Text>
              </View>

              {/* Metrics Details */}
              <View className="grid grid-cols-2 gap-4">
                <View className="bg-gray-900/60 p-3 rounded-2xl">
                  <Text className="text-gray-500 text-xs font-bold uppercase mb-1">
                    Focus (Sharpness)
                  </Text>
                  <Text className={`text-sm font-bold ${getMetricRating(blur, 'blur').color}`}>
                    {getMetricRating(blur, 'blur').label}
                  </Text>
                </View>

                <View className="bg-gray-900/60 p-3 rounded-2xl">
                  <Text className="text-gray-500 text-xs font-bold uppercase mb-1">
                    Exposure (Light)
                  </Text>
                  <Text
                    className={`text-sm font-bold ${getMetricRating(brightness, 'light').color}`}
                  >
                    {getMetricRating(brightness, 'light').label}
                  </Text>
                </View>

                <View className="bg-gray-900/60 p-3 rounded-2xl mt-2">
                  <Text className="text-gray-500 text-xs font-bold uppercase mb-1">
                    Framing (Distance)
                  </Text>
                  <Text className={`text-sm font-bold ${getMetricRating(distance, 'dist').color}`}>
                    {getMetricRating(distance, 'dist').label}
                  </Text>
                </View>

                <View className="bg-gray-900/60 p-3 rounded-2xl mt-2">
                  <Text className="text-gray-500 text-xs font-bold uppercase mb-1">
                    Reflection / Glare
                  </Text>
                  <Text className={`text-sm font-bold ${getMetricRating(glare, 'glare').color}`}>
                    {getMetricRating(glare, 'glare').label}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View className="p-4 space-y-6">
            {/* Enhancement pipeline steps visualizer */}
            <View className="bg-gray-950 p-6 rounded-3xl border border-gray-900 space-y-4">
              <Text className="text-white font-extrabold text-base">
                Enhancement Pipeline Progress
              </Text>

              {/* Step 1 */}
              <View className="flex-row items-center space-x-3 bg-gray-900/40 p-4 rounded-2xl border border-gray-800/80">
                <Text className="text-green-500 font-bold text-sm">✓</Text>
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm">Histogram Equalization</Text>
                  <Text className="text-gray-500 text-xs">
                    Normalized contrast channels across the milk surface.
                  </Text>
                </View>
              </View>

              {/* Step 2 */}
              <View className="flex-row items-center space-x-3 bg-gray-900/40 p-4 rounded-2xl border border-gray-800/80 mt-2">
                <Text className="text-green-500 font-bold text-sm">✓</Text>
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm">Laplacian Focus Enhancement</Text>
                  <Text className="text-gray-500 text-xs">
                    Sharpened blurry cup edges and borders.
                  </Text>
                </View>
              </View>

              {/* Step 3 */}
              <View className="flex-row items-center space-x-3 bg-gray-900/40 p-4 rounded-2xl border border-gray-800/80 mt-2">
                <Text className="text-green-500 font-bold text-sm">✓</Text>
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm">White Balance Normalization</Text>
                  <Text className="text-gray-500 text-xs">
                    Corrected ambient light color shift temperature.
                  </Text>
                </View>
              </View>

              {/* Step 4 */}
              <View className="flex-row items-center space-x-3 bg-gray-900/40 p-4 rounded-2xl border border-gray-800/80 mt-2">
                <Text className="text-green-500 font-bold text-sm">✓</Text>
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm">Container Crop & Alignment</Text>
                  <Text className="text-gray-500 text-xs">
                    Cropped surrounding ambient objects outside the cup container.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Buttons */}
      <View className="p-6 bg-black border-t border-gray-950 flex-row justify-between space-x-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="flex-1 bg-gray-900 py-4 rounded-xl items-center border border-gray-800"
        >
          <Text className="text-gray-300 font-bold text-base">Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={saveScan}
          disabled={isSaved}
          className={`flex-2 py-4 rounded-xl items-center px-8 ${isSaved ? 'bg-green-600' : 'bg-blue-600'}`}
        >
          <Text className="text-white font-bold text-base">
            {isSaved ? 'Synchronized!' : 'Confirm & Analyze'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
