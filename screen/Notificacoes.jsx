import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import Menu from '../components/Menu';

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Trilha agendada pra amanhã!',
    message:
      'Você agendou uma trilha para 23/09/2026, não esqueça de checar as informações e chegar no horário. Boa trilha, aventureiro!',
    date: '23/09/2026',
    read: false,
    trailId: '1',
  },
];

export default function Notificacoes({ navigation }) {
  const [notifications] = useState(INITIAL_NOTIFICATIONS);

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Superior */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NOTIFICAÇÕES</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      {/* Lista de Notificações */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={40} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
            <Text style={styles.emptySubtitle}>
              Você será avisado quando houver novidades sobre suas trilhas.
            </Text>
          </View>
        ) : (
          notifications.map((item) => (
            <View key={item.id} style={styles.notificationWrapper}>
              <View style={styles.notificationCard}>
                {/* Ícone Circular com borda verde */}
                <View style={styles.iconCircle}>
                  <FontAwesome5
                    name="hiking"
                    size={20}
                    color={colors.primary}
                    style={styles.hikingIcon}
                  />
                </View>

                {/* Conteúdo de Texto */}
                <View style={styles.textContent}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationMessage}>{item.message}</Text>
                </View>
              </View>

              {/* Linha Tracejada Divisória */}
              <View style={styles.dashedDivider} />
            </View>
          ))
        )}
      </ScrollView>

      {/* Menu Inferior */}
      <Menu activeTab="Trilhas" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 8 : 46,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.8,
  },
  headerRightSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  notificationWrapper: {
    width: '100%',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#54715F',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  hikingIcon: {
    transform: [{ scaleX: -1 }], // Inverte para caminhar subindo da esquerda para direita como no protótipo
  },
  textContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
  },
  dashedDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginTop: 6,
    marginHorizontal: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});
