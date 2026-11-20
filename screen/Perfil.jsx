import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import Menu from '../components/Menu';
import MenuGuia from '../components/MenuGuia';

export default function Perfil({ navigation }) {
  const { logout, user, userProfile, guideProfile, isGuide } = useAuth();

  const displayName =
    guideProfile?.name ||
    userProfile?.name ||
    user?.email?.split('@')[0] ||
    'Usuário';

  const userEmail = user?.email || userProfile?.email || 'email@exemplo.com';
  const roleLabel = isGuide ? 'Guia Profissional' : 'Trilheiro';

  const handleBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Trilhas');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja encerrar sua sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header com botão de retorno e título centralizado */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CONFIGURAÇÕES</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Resumo do Perfil (mantido da HEAD) */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={36} color={colors.primary} />
          </View>
          <Text style={styles.nameText}>{displayName}</Text>
          <Text style={styles.emailText}>{userEmail}</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{roleLabel}</Text>
          </View>

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
              <Feather
                name="eye"
                size={16}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.guideProfileButtonText}>
                Visualizar meu perfil público
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de Opções de Configurações (feature/julia) */}
        <View style={styles.menuList}>
          {/* Opção 1: Dados pessoais */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation?.navigate('DadosPessoais')}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={24}
                color="#111827"
              />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Dados pessoais</Text>
              <Text style={styles.itemSubtitle}>
                Minhas informações da conta
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Opção 2: Configuração de Notificação */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation?.navigate('ConfiguracaoNotificacao')}
          >
            <View style={styles.iconContainer}>
              <Feather name="bell" size={22} color="#111827" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Configuração de Notificação</Text>
              <Text style={styles.itemSubtitle}>
                Gerenciar minhas notificações
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Opção 3: Ajuda */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation?.navigate('Ajuda')}
          >
            <View style={styles.iconContainer}>
              <Feather name="help-circle" size={22} color="#111827" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Ajuda</Text>
              <Text style={styles.itemSubtitle}>Suporte</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Opção 4: Sobre */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation?.navigate('Sobre')}
          >
            <View style={styles.iconContainer}>
              <Feather name="info" size={22} color="#111827" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Sobre</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Botão Sair da Conta com confirmação */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <Feather
            name="log-out"
            size={20}
            color="#EF4444"
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Menu Inferior correspondente ao perfil (mantido da HEAD) */}
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
    backgroundColor: '#FAF9F6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.8,
  },
  headerRightPlaceholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EBF3ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  nameText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 13.5,
    color: '#6B7280',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: '#EBF3ED',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12.5,
    fontWeight: '700',
  },
  guideProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 260,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginTop: 14,
    backgroundColor: '#FFFFFF',
  },
  guideProfileButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13.5,
  },
  menuList: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    width: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemTextCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  itemSubtitle: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 64,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 24,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
});