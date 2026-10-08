import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function ReplantBanner({ onPress }) {
  return (
    <TouchableOpacity style={styles.bannerContainer} activeOpacity={0.9} onPress={onPress}>
      <Ionicons name="leaf" size={28} color="#1F3E29" />
      <View style={styles.bannerTextCol}>
        <Text style={styles.bannerTitle}>Vamos replantar o mundo</Text>
        <Text style={styles.bannerSubtitle}>2 árvores para cada amigo</Text>
      </View>
      <Feather name="arrow-right" size={22} color="#1F3E29" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: '#BDD3C2',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F3E29',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#34573D',
    marginTop: 2,
  },
});
