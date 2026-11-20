import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export default function ConfiguracaoNotificacao({ navigation }) {
  // Preferências locais controladas por switches
  const [allowAll, setAllowAll] = useState(true);
  const [trailReminders, setTrailReminders] = useState(true);
  const [newTrails, setNewTrails] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

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
        <Text style={styles.headerTitle}>NOTIFICAÇÕES</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeader}>Preferências no Aplicativo</Text>

        <View style={styles.card}>
          {/* Todas as notificações */}
          <View style={styles.optionRow}>
            <View style={styles.textCol}>
              <Text style={styles.optionTitle}>Notificações no aplicativo</Text>
              <Text style={styles.optionDescription}>
                Receba alertas sobre suas atividades e mensagens dos guias
              </Text>
            </View>
            <Switch
              value={allowAll}
              onValueChange={setAllowAll}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : allowAll ? '#FFFFFF' : '#F4F3F4'}
            />
          </View>

          <View style={styles.divider} />

          {/* Lembretes de trilha */}
          <View style={styles.optionRow}>
            <View style={styles.textCol}>
              <Text style={styles.optionTitle}>Lembretes de trilha</Text>
              <Text style={styles.optionDescription}>
                Avisos 24 horas e 2 horas antes do horário de saída
              </Text>
            </View>
            <Switch
              value={trailReminders && allowAll}
              onValueChange={setTrailReminders}
              disabled={!allowAll}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor={
                Platform.OS === 'ios'
                  ? '#FFFFFF'
                  : trailReminders && allowAll
                  ? '#FFFFFF'
                  : '#F4F3F4'
              }
            />
          </View>

          <View style={styles.divider} />

          {/* Novas trilhas e eventos */}
          <View style={styles.optionRow}>
            <View style={styles.textCol}>
              <Text style={styles.optionTitle}>Novas trilhas disponíveis</Text>
              <Text style={styles.optionDescription}>
                Saiba quando novas expedições forem abertas na região
              </Text>
            </View>
            <Switch
              value={newTrails && allowAll}
              onValueChange={setNewTrails}
              disabled={!allowAll}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor={
                Platform.OS === 'ios'
                  ? '#FFFFFF'
                  : newTrails && allowAll
                  ? '#FFFFFF'
                  : '#F4F3F4'
              }
            />
          </View>
        </View>

        <Text style={styles.sectionHeader}>Comunicações Externas</Text>

        <View style={styles.card}>
          {/* Notificações por e-mail */}
          <View style={styles.optionRow}>
            <View style={styles.textCol}>
              <Text style={styles.optionTitle}>E-mails informativos</Text>
              <Text style={styles.optionDescription}>
                Receba comprovantes de inscrição e novidades por e-mail
              </Text>
            </View>
            <Switch
              value={emailUpdates}
              onValueChange={setEmailUpdates}
              trackColor={{ false: '#D1D5DB', true: colors.primary }}
              thumbColor={
                Platform.OS === 'ios' ? '#FFFFFF' : emailUpdates ? '#FFFFFF' : '#F4F3F4'
              }
            />
          </View>
        </View>

        {/* Informação sobre sincronização com backend */}
        <View style={styles.noteCard}>
          <Feather
            name="info"
            size={18}
            color={colors.primary}
            style={styles.noteIcon}
          />
          <Text style={styles.noteText}>
            A sincronização com serviços de notificações push em nuvem
            será ativada assim que os endpoints de preferências do backend
            estiverem operacionais.
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
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  textCol: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12.5,
    color: '#6B7280',
    lineHeight: 17,
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

