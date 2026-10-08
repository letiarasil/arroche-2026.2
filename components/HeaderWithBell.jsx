import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function HeaderWithBell({ onBellPress }) {
  return (
    <View style={styles.header}>
      <Image
        source={require('../assets/logo-verde.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <TouchableOpacity
        style={styles.bellButton}
        onPress={onBellPress}
        activeOpacity={0.7}
      >
        <Feather name="bell" size={18} color="#1F2937" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logo: {
    height: 32,
    width: 120,
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
