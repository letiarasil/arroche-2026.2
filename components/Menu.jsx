import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Mountain } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { VazadoIcon } from './icons/VazadoIcon';

const Menu = ({ activeTab, navigation }) => {
  const tabs = [
    { name: 'Trilhas', route: 'Trilhas', iconType: 'LucideMountain' },
    { name: 'Guias', route: 'Guias', iconType: 'Vazado' },
    { name: 'Salvos', route: 'Salvos', iconType: 'Feather', iconName: 'bookmark' },
    { name: 'Perfil', route: 'Perfil', iconType: 'Feather', iconName: 'user' },
  ];

  const renderIcon = (tab, isActive) => {
    const color = isActive ? colors.primary : colors.textSecondary;
    if (tab.iconType === 'LucideMountain') {
      return <Mountain size={24} color={color} strokeWidth={2} />;
    } else if (tab.iconType === 'Vazado') {
      return <VazadoIcon size={24} color={color} />;
    } else if (tab.iconType === 'Feather') {
      return <Feather name={tab.iconName} size={24} color={color} />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButton}
            onPress={() => navigation?.navigate(tab.route)}
            activeOpacity={0.7}
          >
            {renderIcon(tab, isActive)}
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default Menu;