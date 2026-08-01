import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { FlashMode, CameraType } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CameraScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('auto');
  const cameraRef = useRef<CameraView>(null);

  // Live Settings
  const [zoom, setZoom] = useState(0);
  const [showGrid, setShowGrid] = useState(true);

  // Simulator controls (essential for emulator testing)
  const [isSimulator, setIsSimulator] = useState(true); // default to true on simulator/emulator
  const [simBrightness, setSimBrightness] = useState(128); // 0-255
  const [simBlur, setSimBlur] = useState(0.5); // 0 (clear) - 5 (blurry)
  const [simDistance, setSimDistance] = useState(15); // cm, optimal is 10-20
  const [simGlare, setSimGlare] = useState(0); // 0 (no glare) - 100

  // Real-time Guidance States
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const [qualityScore, setQualityScore] = useState(100);

  useEffect(() => {
    (async () => {
      if (!permission) {
        const res = await requestPermission();
        if (!res.granted) {
          setIsSimulator(true);
        }
      } else if (!permission.granted) {
        setIsSimulator(true);
      }
    })();
  }, [permission]);

  // Run Real-time calculator for Simulator
  useEffect(() => {
    if (isSimulator) {
      let warning: string | null = null;
      let score = 100;

      // Exposure checks
      if (simBrightness < 60) {
        warning = 'Increase Lighting';
        score -= 30;
      } else if (simBrightness > 210) {
        warning = 'Reduce Reflection';
        score -= 25;
      }

      // Blur checks
      if (simBlur > 2.0) {
        warning = 'Hold Camera Steady';
        score -= 35;
      }

      // Distance checks
      if (simDistance < 8) {
        warning = 'Move Away';
        score -= 20;
      } else if (simDistance > 25) {
        warning = 'Move Closer';
        score -= 20;
      }

      // Glare checks
      if (simGlare > 30) {
        warning = 'Reduce Reflection / Glare';
        score -= 25;
      }

      setQualityWarning(warning);
      setQualityScore(Math.max(0, score));
    }
  }, [simBrightness, simBlur, simDistance, simGlare, isSimulator]);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const takePhoto = async () => {
    if (qualityScore < 60) {
      Alert.alert(
        'Acquisition Error',
        'Image quality does not meet the minimum requirements. Adjust the settings/alignment first.',
      );
      return;
    }

    if (isSimulator || !cameraRef.current) {
      // Simulator flow
      const mockPhoto = {
        path: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600',
        simulated: true,
        brightness: simBrightness,
        blur: simBlur,
        distance: simDistance,
        glare: simGlare,
        qualityScore,
      };
      navigation.navigate('Preview', { photoPath: mockPhoto.path, simMeta: mockPhoto });
    } else {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        if (photo?.uri) {
          navigation.navigate('Preview', {
            photoPath: photo.uri,
            simMeta: {
              brightness: 128,
              blur: 0.1,
              distance: 15,
              glare: 0,
              qualityScore,
            },
          });
        }
      } catch (err: any) {
        Alert.alert('Capture Failed', err.message || 'An error occurred during capture.');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Top Controls */}
      <View className="flex-row justify-between items-center px-6 py-4 absolute top-10 left-0 right-0 z-10 bg-black/40">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-white text-lg font-bold">✕</Text>
        </TouchableOpacity>

        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => setFlash((f) => (f === 'off' ? 'on' : f === 'on' ? 'auto' : 'off'))}
            className="mr-4"
          >
            <Text className="text-white text-sm font-semibold">⚡ {flash.toUpperCase()}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowGrid((g) => !g)} className="mr-4">
            <Text className={`text-sm font-semibold ${showGrid ? 'text-blue-400' : 'text-white'}`}>
              ⚏ GRID
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleCameraFacing}>
            <Text className="text-white text-sm font-semibold">🔄 FLIP</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Simulator Mode Selection Toggle */}
      <TouchableOpacity
        onPress={() => setIsSimulator((prev) => !prev)}
        className="absolute top-24 left-6 bg-blue-600 px-4 py-2 rounded-full z-10"
      >
        <Text className="text-white text-xs font-bold font-mono">
          MODE: {isSimulator ? 'SIMULATOR 🛠️' : 'LIVE CAMERA 📷'}
        </Text>
      </TouchableOpacity>

      {/* Camera Panel */}
      <View className="flex-1 justify-center items-center relative bg-gray-900">
        {!isSimulator && permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            flash={flash}
            zoom={zoom}
          />
        ) : (
          <View className="w-full h-full justify-center items-center">
            <Text className="text-blue-500 text-6xl mb-4">🥛</Text>
            <Text className="text-gray-400 text-sm font-semibold">Milk Cup Alignment Guide</Text>
            <Text className="text-gray-500 text-xs mt-2 text-center px-8">
              Adjust simulator calibration parameters below to change quality checks
            </Text>
          </View>
        )}

        {/* 3x3 Grid Overlay */}
        {showGrid && (
          <View
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
            className="flex-col justify-between p-0"
          >
            <View className="flex-row justify-between w-full h-1/3 border-b border-white/10">
              <View className="h-full w-1/3 border-r border-white/10" />
              <View className="h-full w-1/3 border-r border-white/10" />
            </View>
            <View className="flex-row justify-between w-full h-1/3 border-b border-white/10">
              <View className="h-full w-1/3 border-r border-white/10" />
              <View className="h-full w-1/3 border-r border-white/10" />
            </View>
          </View>
        )}

        {/* Focus Indicator Circle */}
        <View className="w-24 h-24 border border-blue-500 rounded-full absolute border-dashed opacity-40" />

        {/* Quality Banner */}
        <View className="absolute top-36 left-4 right-4 bg-black/60 p-4 rounded-2xl border border-gray-800">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white font-bold text-sm">Acquisition Quality</Text>
            <Text
              className={`font-black text-base ${qualityScore >= 60 ? 'text-green-500' : 'text-red-500'}`}
            >
              {qualityScore} / 100
            </Text>
          </View>

          <Text
            className={`text-xs text-center font-bold uppercase py-1.5 rounded-lg ${qualityWarning ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}
          >
            {qualityWarning || '✓ Ready To Capture'}
          </Text>
        </View>
      </View>

      {/* Simulated Live Slider Controls Panel (Visible in Simulator mode) */}
      {isSimulator && (
        <View className="bg-gray-950 p-6 space-y-3 border-t border-gray-900">
          <Text className="text-white text-xs font-bold uppercase tracking-wider mb-2">
            Simulator Calibration Controls
          </Text>

          {/* Exposure Slider */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-400 text-xs w-28">Lighting: {simBrightness}</Text>
            <TouchableOpacity
              onPress={() => setSimBrightness(Math.max(0, simBrightness - 20))}
              className="bg-gray-800 px-3 py-1 rounded"
            >
              <Text className="text-white text-xs">-</Text>
            </TouchableOpacity>
            <Text className="text-white text-xs px-2 font-mono">{simBrightness}</Text>
            <TouchableOpacity
              onPress={() => setSimBrightness(Math.min(255, simBrightness + 20))}
              className="bg-gray-800 px-3 py-1 rounded"
            >
              <Text className="text-white text-xs">+</Text>
            </TouchableOpacity>
          </View>

          {/* Focus Slider */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-400 text-xs w-28">Blur: {simBlur.toFixed(1)}</Text>
            <TouchableOpacity
              onPress={() => setSimBlur(Math.max(0.1, simBlur - 0.5))}
              className="bg-gray-800 px-3 py-1 rounded"
            >
              <Text className="text-white text-xs">-</Text>
            </TouchableOpacity>
            <Text className="text-white text-xs px-2 font-mono">{simBlur.toFixed(1)}</Text>
            <TouchableOpacity
              onPress={() => setSimBlur(Math.min(5.0, simBlur + 0.5))}
              className="bg-gray-800 px-3 py-1 rounded"
            >
              <Text className="text-white text-xs">+</Text>
            </TouchableOpacity>
          </View>

          {/* Distance Slider */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-400 text-xs w-28">Distance: {simDistance}cm</Text>
            <TouchableOpacity
              onPress={() => setSimDistance(Math.max(5, simDistance - 2))}
              className="bg-gray-800 px-3 py-1 rounded"
            >
              <Text className="text-white text-xs">-</Text>
            </TouchableOpacity>
            <Text className="text-white text-xs px-2 font-mono">{simDistance}cm</Text>
            <TouchableOpacity
              onPress={() => setSimDistance(Math.min(35, simDistance + 2))}
              className="bg-gray-800 px-3 py-1 rounded"
            >
              <Text className="text-white text-xs">+</Text>
            </TouchableOpacity>
          </View>

          {/* Glare Slider */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-400 text-xs w-28">Reflection: {simGlare}%</Text>
            <TouchableOpacity
              onPress={() => setSimGlare(Math.max(0, simGlare - 10))}
              className="bg-gray-800 px-3 py-1 rounded"
            >
              <Text className="text-white text-xs">-</Text>
            </TouchableOpacity>
            <Text className="text-white text-xs px-2 font-mono">{simGlare}%</Text>
            <TouchableOpacity
              onPress={() => setSimGlare(Math.min(100, simGlare + 10))}
              className="bg-gray-800 px-3 py-1 rounded"
            >
              <Text className="text-white text-xs">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Shutter Button controls */}
      <View
        style={{ paddingBottom: insets.bottom + 20 }}
        className="bg-black py-4 items-center justify-center flex-row space-x-12"
      >
        <TouchableOpacity
          onPress={() => setZoom((z) => Math.max(0, z - 0.1))}
          className="w-10 h-10 bg-gray-800 rounded-full justify-center items-center"
        >
          <Text className="text-white font-bold text-xs">-</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={takePhoto}
          disabled={qualityScore < 60}
          className={`w-20 h-20 rounded-full border-4 items-center justify-center ${qualityScore >= 60 ? 'border-blue-600' : 'border-gray-800'}`}
        >
          <View
            className={`w-14 h-14 rounded-full ${qualityScore >= 60 ? 'bg-blue-600' : 'bg-gray-800'}`}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setZoom((z) => Math.min(1, z + 0.1))}
          className="w-10 h-10 bg-gray-800 rounded-full justify-center items-center"
        >
          <Text className="text-white font-bold text-xs">+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
