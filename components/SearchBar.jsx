import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Pesquisar por trilhas',
  onFilterPress,
}) {
  return (
    <View style={styles.searchContainer}>
      <Feather name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
      />
      <TouchableOpacity onPress={onFilterPress} activeOpacity={0.7}>
        <Ionicons name="options-outline" size={18} color="#374151" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 46,
    marginHorizontal: 20,
    marginVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
});
