import React, { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import FeatureCard from '@/components/feature-card';
import { FEATURES, type Feature } from '@/data/features';

export default function HomeScreen() {
  const router = useRouter();

  const renderItem = useCallback(
    ({ item }: { item: Feature }) => (
      <FeatureCard
        title={item.title}
        description={item.description}
        onPress={() => router.push(`/detail/${item.id}`)}
      />
    ),
    [router],
  );

  return (
    <FlatList
      data={FEATURES}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
});
