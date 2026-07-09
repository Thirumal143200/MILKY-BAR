import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { runOnJS } from 'react-native-reanimated';

export default function CameraScreen({ navigation }: { navigation: any }) {
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const insets = useSafeAreaInsets();

  const [hasPermission, setHasPermission] = useState(false);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Frame processor for real-time AI guidance (Lighting, Blur)
  const frameProcessor = useFrameProcessor((frame: any) => {
    'worklet';
    try {
      // In a real production environment, frame.toArrayBuffer() is available in vision-camera v4
      // We process a subsample of pixels for performance to detect blur and exposure.
      const buffer = frame.toArrayBuffer();
      const pixels = new Uint8Array(buffer);

      let sumBrightness = 0;
      let sumGradient = 0;
      let count = 0;

      // Subsample: Check every 1000th pixel for performance (edge devices)
      for (let i = 0; i < pixels.length; i += 1000) {
        const p = pixels[i];
        sumBrightness += p;
        count++;

        // Simple gradient calculation for blur estimation
        if (i + 4 < pixels.length) {
          sumGradient += Math.abs(p - pixels[i + 4]);
        }
      }

      const avgBrightness = count > 0 ? sumBrightness / count : 0;
      const avgGradient = count > 0 ? sumGradient / count : 0;

      // Blur threshold (low gradient = blurry)
      const BLUR_THRESHOLD = 5;

      if (avgBrightness < 40) {
        runOnJS(setQualityWarning)('Too dark. Move to a well-lit area.');
      } else if (avgBrightness > 220) {
        runOnJS(setQualityWarning)('Too bright. Avoid direct glare.');
      } else if (avgGradient < BLUR_THRESHOLD) {
        runOnJS(setQualityWarning)('Image is blurry. Hold the camera still.');
      } else {
        runOnJS(setQualityWarning)(null);
      }
    } catch {
      // Fallback if toArrayBuffer is not supported on this specific device format
    }
  }, []);

  const takePhoto = async () => {
    if (camera.current && !qualityWarning) {
      const photo = await camera.current.takePhoto({
        flash: 'auto',
      });
      // Pass the photo to the offline sync manager
      navigation.navigate('Preview', { photoPath: photo.path });
    }
  };

  if (!hasPermission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Camera permission is required.</Text>
      </View>
    );
  }

  const mockTakePhoto = () => {
    const mockMilkUrl =
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600';
    navigation.navigate('Preview', { photoPath: mockMilkUrl });
  };

  if (!hasPermission || device == null) {
    return (
      <View className="flex-1 bg-gray-950 justify-center items-center px-6">
        <View className="w-24 h-24 bg-blue-600/10 border border-blue-500/30 rounded-3xl justify-center items-center mb-6">
          <Text className="text-4xl">📸</Text>
        </View>
        <Text className="text-white text-2xl font-bold mb-2">Camera Simulator</Text>
        <Text className="text-gray-400 text-center mb-8 text-sm">
          Physical camera is not available on this device or permission is not granted. You can
          proceed with a mock milk sample photo.
        </Text>

        <TouchableOpacity
          onPress={mockTakePhoto}
          className="w-full bg-blue-600 py-4 rounded-xl items-center shadow-lg shadow-blue-500/20"
        >
          <Text className="text-white font-bold text-lg">Use Mock Milk Sample</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
          <Text className="text-gray-400 text-base font-semibold">Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        frameProcessor={frameProcessor}
      />

      {/* Real-time Guidance Overlay */}
      {qualityWarning && (
        <View className="absolute top-20 left-10 right-10 bg-red-500/80 p-4 rounded-xl items-center">
          <Text className="text-white font-bold text-center">{qualityWarning}</Text>
        </View>
      )}

      {/* Simulator Shortcut for quick testing */}
      <TouchableOpacity
        onPress={mockTakePhoto}
        className="absolute top-12 right-6 bg-black/60 px-4 py-2 rounded-full border border-gray-700"
      >
        <Text className="text-white text-xs font-semibold">Simulate</Text>
      </TouchableOpacity>

      {/* Camera Controls */}
      <View
        style={{ paddingBottom: insets.bottom + 20 }}
        className="absolute bottom-0 left-0 right-0 items-center animate-fade-in"
      >
        <TouchableOpacity
          onPress={takePhoto}
          disabled={!!qualityWarning}
          className={`w-20 h-20 rounded-full border-4 border-white items-center justify-center ${qualityWarning ? 'opacity-50' : 'opacity-100'}`}
        >
          <View className="w-16 h-16 bg-white rounded-full" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
