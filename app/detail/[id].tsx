import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { FEATURES } from '@/data/features';

function formatTime(date: Date): string {
  const y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${M}-${d} ${h}:${m}:${s}`;
}

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const feature = FEATURES.find((f) => f.id === id);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (id !== '2') return;
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [id]);

  if (!feature) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>功能未找到</Text>
      </View>
    );
  }

  const renderContent = () => {
    switch (id) {
      case '1':
        if (imageError) {
          return <Text style={styles.errorText}>图片加载失败</Text>;
        }
        return (
          <Image
            source={{ uri: 'https://picsum.photos/600/400' }}
            style={styles.image}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        );
      case '2':
        return <Text style={styles.timeText}>{formatTime(currentTime)}</Text>;
      case '3':
        return (
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>操作系统</Text>
            <Text style={styles.infoValue}>{Platform.OS}</Text>
            <Text style={styles.infoLabel}>系统版本</Text>
            <Text style={styles.infoValue}>{Platform.Version}</Text>
            <Text style={styles.infoLabel}>系统名称</Text>
            <Text style={styles.infoValue}>{(Platform.constants as any).systemName ?? 'N/A'}</Text>
            <Text style={styles.infoLabel}>界面类型</Text>
            <Text style={styles.infoValue}>{(Platform.constants as any).interfaceIdiom ?? 'N/A'}</Text>
          </View>
        );
      default:
        return <Text style={styles.errorText}>未知功能</Text>;
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: feature.title }} />
      <View style={styles.container}>{renderContent()}</View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    fontVariant: ['tabular-nums'],
  },
  infoContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888888',
    marginTop: 12,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 2,
  },
  errorText: {
    fontSize: 18,
    color: '#999999',
  },
});
