import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import FeatureCard from '@/components/feature-card';
import { FEATURES } from '@/data/features';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <FlatList
      data={FEATURES}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <FeatureCard
          title={item.title}
          description={item.description}
          onPress={() => router.push(`/detail/${item.id}`)}
        />
      )}
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
