import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export default function MenuGuia({ activeTab = 'Trilhas', navigation }) {
  const tabs = [
    { 
      name: 'Trilhas', 
      route: 'HomeGuia', 
      iconType: 'feather', 
      iconName: 'compass' 
    },
    { 
      name: 'Pagamentos', 
      route: 'Pagamentos', 
      iconType: 'feather', 
      iconName: 'dollar-sign' 
    },
    { 
      name: 'Perfil', 
      route: 'Perfil', 
      iconType: 'feather', 
      iconName: 'user' 
    },
    { 
      name: 'Configurações', 
      route: 'Configuracoes', 
      iconType: 'feather', 
      iconName: 'settings' 
    },
  ];

  const handleTabPress = (tab) => {
    if (tab.route === 'HomeGuia') {
      navigation?.navigate('HomeGuia');
    } else if (tab.route === 'Perfil') {
      navigation?.navigate('Perfil');
    } else if (tab.name === 'Pagamentos') {
      Alert.alert(
        'Painel Financeiro',
        'O módulo de recebimentos e repasses de trilhas realizadas estará disponível em breve.',
        [{ text: 'OK' }]
      );
    } else if (tab.name === 'Configurações') {
      Alert.alert(
        'Configurações do Guia',
        'Configurações de conta, preferências e notificações do guia.',
        [{ text: 'OK' }]
      );
    } else if (tab.route) {
      navigation?.navigate(tab.route);
    }
  };

  const renderIcon = (tab, isActive) => {
    const color = isActive ? colors.primary : colors.textSecondary;
    if (tab.name === 'Trilhas') {
      return <Feather name="compass" size={24} color={color} />;
    }
    if (tab.name === 'Pagamentos') {
      return <Feather name="dollar-sign" size={23} color={color} />;
    }
    if (tab.name === 'Perfil') {
      return <Feather name="user" size={23} color={color} />;
    }
    if (tab.name === 'Configurações') {
      return <Feather name="settings" size={23} color={color} />;
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
            onPress={() => handleTabPress(tab)}
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
}

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
