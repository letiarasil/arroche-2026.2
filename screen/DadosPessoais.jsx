import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from '../components/UserAvatar';

export default function DadosPessoais({ navigation }) {
  const { user } = useAuth();

  const userName = user?.name || 'Sarah Jansen';
  const userEmail = user?.email || 'sarah.jansen@gmail.com';
  const userCpf = user?.cpf || '***.***.***-**';

  const handleBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Perfil');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header com botão de retorno */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DADOS PESSOAIS</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card do Usuário */}
        <View style={styles.userCard}>
          <UserAvatar name={userName} size={72} style={styles.avatar} />
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userRole}>Aventureiro(a) Arroche</Text>
        </View>

        {/* Informações da Conta */}
        <Text style={styles.sectionHeader}>Informações da Conta</Text>

        <View style={styles.infoCard}>
          {/* Nome */}
          <View style={styles.infoRow}>
            <View style={styles.labelCol}>
              <Text style={styles.infoLabel}>Nome completo</Text>
              <Text style={styles.infoValue}>{userName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* E-mail */}
          <View style={styles.infoRow}>
            <View style={styles.labelCol}>
              <Text style={styles.infoLabel}>E-mail</Text>
              <Text style={styles.infoValue}>{userEmail}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* CPF */}
          <View style={styles.infoRow}>
            <View style={styles.labelCol}>
              <Text style={styles.infoLabel}>CPF</Text>
              <Text style={styles.infoValue}>{userCpf}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Status */}
          <View style={styles.infoRow}>
            <View style={styles.labelCol}>
              <Text style={styles.infoLabel}>Status da Conta</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                Ativa
              </Text>
            </View>
          </View>
        </View>

        {/* Nota Informativa sobre Backend */}
        <View style={styles.noteCard}>
          <Feather
            name="info"
            size={18}
            color={colors.primary}
            style={styles.noteIcon}
          />
          <Text style={styles.noteText}>
            A edição de dados cadastrais será disponibilizada assim que os
            serviços de atualização de perfil do backend forem integrados.
          </Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  userRole: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  labelCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EBF3ED',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BDD3C2',
  },
  noteIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: 12.5,
    color: '#264A31',
    lineHeight: 18,
  },
});

