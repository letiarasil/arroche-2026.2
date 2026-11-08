import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../constants/colors';
import { getEventDetails } from '../constants/mockEvents';
import Menu from '../components/Menu';
import UserAvatar from '../components/UserAvatar';
import { useSubscriptions } from '../contexts/SubscriptionsContext';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/firebase';
import { addTrailSubscription } from '../services/trailService';

// Ícone SVG de Cartão de Crédito
function CardIcon({ size = 22, color = '#3B82F6' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z"
        fill={color}
      />
    </Svg>
  );
}

export default function PagamentoTrilha({ navigation, route }) {
  const routeParams = route?.params || {};
  const event = routeParams.event || getEventDetails(routeParams.eventId, routeParams.item);
  const ticketCount = routeParams.ticketCount || 1;

  const { user, userProfile } = useAuth();
  const { subscribeToTrail } = useSubscriptions();

  // Seleção da forma de pagamento: 'pix' ou 'card'
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [isProcessing, setIsProcessing] = useState(false);

  // Controle dos Modais
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Cálculos de valores (Subtotal, Taxa de serviço e Total)
  const basePricePerTicket = event.price || 10.0;
  const rawTotal = basePricePerTicket * ticketCount;
  const serviceFee = 1.0;
  const subTotal = Math.max(0, rawTotal - serviceFee);

  const formattedSubTotal = subTotal.toFixed(2).replace('.', ',');
  const formattedServiceFee = serviceFee.toFixed(2).replace('.', ',');
  const formattedTotal = rawTotal.toFixed(2).replace('.', ',');

  // 1. Processa o pagamento e persiste no Firestore + contexto
  const handleFinalizePayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const trailId = event.id || event.trailId;
      const currentUserId = auth.currentUser?.uid || user?.uid || 'anon';
      const currentUserName = userProfile?.name || auth.currentUser?.displayName || 'Aventureiro';
      const currentUserEmail = userProfile?.email || auth.currentUser?.email || '';
      const currentUserAvatar = userProfile?.avatarUrl || userProfile?.avatar || auth.currentUser?.photoURL || null;

      // Grava a inscrição do usuário no Firebase Firestore
      if (trailId) {
        await addTrailSubscription(trailId, {
          userId: currentUserId,
          name: currentUserName,
          email: currentUserEmail,
          avatar: currentUserAvatar,
          ticketCount,
          paymentMethod,
          totalPrice: rawTotal,
          status: 'confirmada',
        });
      }

      // Inscreve a trilha na lista do usuário no contexto
      subscribeToTrail(event, { ticketCount });

      // Abre o 1º modal: Deu certo + aviso de cancelamento
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Erro ao registrar inscrição no Firebase:', err);
      Alert.alert(
        'Erro na Inscrição',
        'Ocorreu um erro ao processar a inscrição no banco de dados. Tente novamente.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Transiciona do 1º Modal para o 2º Modal (Parabéns + Dicas da Trilha)
  const handleAdvanceToTipsModal = () => {
    setShowSuccessModal(false);
    setShowConfirmationModal(true);
  };

  // 3. Ações do Modal de Dicas
  const handleGoToTipsScreen = () => {
    setShowConfirmationModal(false);
    navigation?.navigate('DicasTrilha', {
      eventId: event.id,
      title: event.title,
    });
  };

  const handleCloseAllAndStay = () => {
    setShowConfirmationModal(false);
    // Retorna para os detalhes da trilha atualizada
    navigation?.navigate('DetalhesEvento', {
      eventId: event.id,
      justSubscribed: true,
      ticketCount,
    });
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Superior com Botão Voltar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>INSCRIÇÃO</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Informações da Trilha */}
        <View style={styles.eventInfoSection}>
          <Text style={styles.eventTitle}>{event.title}</Text>

          <View style={styles.guideRow}>
            <UserAvatar
              source={event.guide?.avatar}
              name={event.guide?.name}
              size={26}
            />
            <Text style={styles.guideText}>
              {event.guide?.name} • {event.guide?.role}
            </Text>
          </View>

          <View style={styles.departureBox}>
            <Text style={styles.departureLabel}>Local de Saída</Text>
            <Text style={styles.departureValue}>{event.departureLocation}</Text>
          </View>

          {/* Grid de Estatísticas */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Data</Text>
              <Text style={styles.statValue}>{event.date}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Horário de saída</Text>
              <Text style={styles.statValue}>{event.departureTime}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Duração</Text>
              <Text style={styles.statValue}>{event.duration}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Distância</Text>
              <Text style={styles.statValue}>{event.distance}</Text>
            </View>
          </View>
        </View>

        {/* Formas de Pagamento */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Formas de pagamento</Text>

          {/* Opção PIX */}
          <TouchableOpacity
            style={[
              styles.paymentOptionCard,
              paymentMethod === 'pix' && styles.paymentOptionCardSelected,
            ]}
            onPress={() => setPaymentMethod('pix')}
            activeOpacity={0.8}
          >
            <View style={styles.paymentOptionLeft}>
              <Image
                source={require('../assets/pix.png')}
                style={styles.pixLogo}
                resizeMode="contain"
              />
            </View>
            <View
              style={[
                styles.radioCircle,
                paymentMethod === 'pix' && styles.radioCircleSelected,
              ]}
            >
              {paymentMethod === 'pix' && <View style={styles.radioInnerCircle} />}
            </View>
          </TouchableOpacity>

          {/* Opção Cartão */}
          <TouchableOpacity
            style={[
              styles.paymentOptionCard,
              paymentMethod === 'card' && styles.paymentOptionCardSelected,
            ]}
            onPress={() => setPaymentMethod('card')}
            activeOpacity={0.8}
          >
            <View style={styles.paymentOptionLeft}>
              <CardIcon size={24} />
              <Text style={styles.paymentOptionText}>Cartão</Text>
            </View>
            <View
              style={[
                styles.radioCircle,
                paymentMethod === 'card' && styles.radioCircleSelected,
              ]}
            >
              {paymentMethod === 'card' && <View style={styles.radioInnerCircle} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Resumo dos Valores */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Resumo dos Valores:</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>SubTotal</Text>
            <Text style={styles.summaryValue}>R$ {formattedSubTotal}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxa de Serviço</Text>
            <Text style={styles.summaryValue}>R$ {formattedServiceFee}</Text>
          </View>

          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>R$ {formattedTotal}</Text>
          </View>
        </View>

        <Text style={styles.refundPolicyText}>
          Você pode cancelar sua reserva até 2 dias antes da realização da trilha e receber o reembolso do valor pago.
        </Text>

        {/* Botão Finalizar */}
        <TouchableOpacity
          style={[styles.finalizeButton, isProcessing && styles.finalizeButtonDisabled]}
          onPress={handleFinalizePayment}
          activeOpacity={0.85}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.finalizeButtonText}>
              Finalizar  •  R${formattedTotal}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Menu Inferior Padrão */}
      <Menu activeTab="Trilhas" navigation={navigation} />

      {/* ============================================================ */}
      {/* 1º MODAL: CONFIRMAÇÃO DE PAGAMENTO & REEMBOLSO */}
      {/* ============================================================ */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.checkIconCircle}>
              <Feather name="check" size={28} color="#FFFFFF" />
            </View>

            <Text style={styles.modalTitle}>Inscrição Confirmada!</Text>
            <Text style={styles.modalSubtitle}>
              Seu pagamento foi processado com sucesso.
            </Text>

            <Text style={styles.modalBodyText}>
              Você tem até <Text style={styles.highlightTextBold}>2 dias antes</Text> da trilha para cancelar a reserva e solicitar reembolso integral se necessário.
            </Text>

            <TouchableOpacity
              style={styles.primaryModalButton}
              onPress={handleAdvanceToTipsModal}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryModalButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* 2º MODAL: DICAS E PREPARAÇÃO DA TRILHA */}
      {/* ============================================================ */}
      <Modal
        visible={showConfirmationModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseAllAndStay}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={handleCloseAllAndStay}
              activeOpacity={0.8}
            >
              <Feather name="x" size={20} color="#111827" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Parabéns, aventureiro!</Text>
            <Text style={styles.modalSubtitle}>
              Você acabou de se inscrever na {event.title}.
            </Text>

            <Text style={styles.modalBodyText}>
              Preparamos uma lista de{' '}
              <Text style={styles.highlightTextGreen}>
                dicas e informações importantes
              </Text>{' '}
              para ajudar você a se preparar e aproveitar a trilha com mais segurança.
            </Text>

            <TouchableOpacity
              style={styles.primaryModalButton}
              onPress={handleGoToTipsScreen}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryModalButtonText}>Ver dicas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryModalButton, { marginTop: 10 }]}
              onPress={handleCloseAllAndStay}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryModalButtonText}>Concluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },

  /* Seção de Informações */
  eventInfoSection: {
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: -0.3,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  guideText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginLeft: 8,
  },
  departureBox: {
    marginTop: 6,
    marginBottom: 12,
  },
  departureLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },
  departureValue: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },

  /* Formas de Pagamento */
  paymentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  paymentOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  paymentOptionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F4F7F4',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  pixLogo: {
    width: 82,
    height: 28,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },

  /* Resumo dos Valores */
  summarySection: {
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#4B5563',
  },
  summaryValue: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  summaryTotalRow: {
    marginTop: 4,
    paddingTop: 6,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },

  refundPolicyText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    marginTop: 10,
  },

  /* Botão Finalizar */
  finalizeButton: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 10,
  },
  finalizeButtonDisabled: {
    backgroundColor: colors.primaryMuted,
    opacity: 0.7,
  },
  finalizeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  /* Overlays e Cards de Modais */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#F5F7F5',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  checkIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary || '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalBodyText: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  highlightTextBold: {
    fontWeight: 'bold',
    color: '#111827',
  },
  highlightTextGreen: {
    color: colors.primary || '#2e7d32',
    fontWeight: '700',
  },
  primaryModalButton: {
    borderWidth: 1.5,
    borderColor: colors.primary || '#2e7d32',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 34,
    backgroundColor: '#F9FAF9',
    width: '100%',
    alignItems: 'center',
  },
  primaryModalButtonText: {
    color: colors.primary || '#2e7d32',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryModalButton: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 34,
    backgroundColor: '#F3F4F6',
    width: '100%',
    alignItems: 'center',
  },
  secondaryModalButtonText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
  },
  modalCloseButton: {
    position: 'absolute',
    top: -18,
    right: -10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 5,
    zIndex: 10,
  },
});