import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import Menu from '../components/Menu';
import MenuGuia from '../components/MenuGuia';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/colors';

export default function Perfil({ navigation }) {
  const { logout, user, userProfile, guideProfile, isGuide } = useAuth();

  const displayName =
    guideProfile?.name ||
    userProfile?.name ||
    user?.email?.split('@')[0] ||
    'Usuário';

  const userEmail = user?.email || userProfile?.email || 'email@exemplo.com';
  const roleLabel = isGuide ? 'Guia Profissional' : 'Trilheiro';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.content}>
        {/* Avatar Circular */}
        <View style={styles.avatarContainer}>
          <Feather name="user" size={48} color={colors.primary} />
        </View>

        {/* Informações do Usuário */}
        <Text style={styles.nameText}>{displayName}</Text>
        <Text style={styles.emailText}>{userEmail}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{roleLabel}</Text>
        </View>

        {/* Atalho para Ver Perfil de Guia se for Guia */}
        {isGuide && (
          <TouchableOpacity
            style={styles.guideProfileButton}
            onPress={() =>
              navigation?.navigate('PerfilGuia', {
                guide: guideProfile,
                guideId: user?.uid,
              })
            }
            activeOpacity={0.8}
          >
            <Feather name="eye" size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.guideProfileButtonText}>Visualizar meu perfil público</Text>
          </TouchableOpacity>
        )}

        {/* Botão de Logout */}
        <TouchableOpacity
          onPress={logout}
          style={styles.logoutButton}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Inferior correspondente ao perfil */}
      {isGuide ? (
        <MenuGuia activeTab="Perfil" navigation={navigation} />
      ) : (
        <Menu activeTab="Perfil" navigation={navigation} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EBF3ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#EBF3ED',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 28,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  guideProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 280,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  guideProfileButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 280,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    marginTop: 6,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
