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
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../constants/colors';
import { getEventDetails } from '../constants/mockEvents';
import Menu from '../components/Menu';

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

// Avatar utilitário com fallback
function UserAvatar({ source, name = 'U', size = 26 }) {
  const [hasError, setHasError] = useState(false);

  if (!source || hasError) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
      <View
        style={[
          styles.avatarFallback,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Text style={[styles.avatarInitial, { fontSize: size * 0.45 }]}>
          {initial}
        </Text>
      </View>
    );
  }

  const imageSource = typeof source === 'string' ? { uri: source } : source;
  return (
    <Image
      source={imageSource}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      onError={() => setHasError(true)}
    />
  );
}

export default function PagamentoTrilha({ navigation, route }) {
  const routeParams = route?.params || {};
  const event = routeParams.event || getEventDetails(routeParams.eventId, routeParams.item);
  const ticketCount = routeParams.ticketCount || 1;

  // Seleção da forma de pagamento: 'pix' ou 'card'
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [isProcessing, setIsProcessing] = useState(false);

  // Cálculos de valores (Subtotal, Taxa de serviço e Total)
  const basePricePerTicket = event.price || 10.0;
  const rawTotal = basePricePerTicket * ticketCount;
  const serviceFee = 1.0;
  const subTotal = Math.max(0, rawTotal - serviceFee);

  const formattedSubTotal = subTotal.toFixed(2).replace('.', ',');
  const formattedServiceFee = serviceFee.toFixed(2).replace('.', ',');
  const formattedTotal = rawTotal.toFixed(2).replace('.', ',');

  // Finalização do pagamento com simulação e backend readiness
  const handleFinalizePayment = () => {
    setIsProcessing(true);

    // BACKEND INTEGRATION:
    // Chamada à API de pagamento:
    // POST /api/v1/payments/checkout
    // Payload:
    // {
    //   eventId: event.id,
    //   spots: ticketCount,
    //   paymentMethod: paymentMethod, // 'pix' | 'card'
    //   subTotal: subTotal,
    //   serviceFee: serviceFee,
    //   totalAmount: rawTotal
    // }
    setTimeout(() => {
      setIsProcessing(false);

      // Limpa a tela de pagamento do histórico da pilha (stack) para que
      // ao voltar ou fechar a tela de detalhes, o usuário volte direto para a tela Trilhas.
      navigation?.reset({
        index: 1,
        routes: [
          { name: 'Trilhas' },
          {
            name: 'DetalhesEvento',
            params: {
              eventId: event.id,
              item: event,
              justSubscribed: true,
              ticketCount: ticketCount,
            },
          },
        ],
      });
    }, 700);
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Superior com Botão Voltar e Título INSCRIÇÃO */}
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
              {event.guide?.name} - {event.guide?.role}
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

        {/* Mensagem informativa sobre política de cancelamento */}
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

  /* Seção de Informações da Trilha */
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

  /* Aviso de Cancelamento / Reembolso */
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

  /* Avatar Fallback */
  avatarFallback: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#374151',
    fontWeight: 'bold',
  },
});

