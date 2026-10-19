import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function UserAvatar({ source, name = 'U', size = 36, style }) {
  const [hasError, setHasError] = useState(false);

  if (!source || hasError) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
      <View
        style={[
          styles.fallback,
          { width: size, height: size, borderRadius: size / 2 },
          style,
        ]}
      >
        <Text style={[styles.initial, { fontSize: size * 0.42 }]}>
          {initial}
        </Text>
      </View>
    );
  }

  const imageSource = typeof source === 'string' ? { uri: source } : source;
  return (
    <Image
      source={imageSource}
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      onError={() => setHasError(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    color: '#374151',
    fontWeight: 'bold',
  },
});
