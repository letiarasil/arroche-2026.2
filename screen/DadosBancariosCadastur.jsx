import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

import FooterTerms from '../components/FooterTerms';
import { colors } from '../constants/colors';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  saveGuideProfile,
  formatCadastur,
  getStoredBankingInfo,
} from '../services/guideService';

export default function DadosBancariosCadastur({ navigation, route }) {
  const returnTo = route?.params?.returnTo || 'CadastrarEvento';
  const { user, guideProfile, updateGuideProfile } = useAuth();
  const guideId = auth.currentUser?.uid || user?.uid || user?.id || 'guide_default';

  // Estados dos campos do formulário
  const [cadastur, setCadastur] = useState(guideProfile?.cadasturFormatted || guideProfile?.cadasturNumber || '');
  const [banco, setBanco] = useState(guideProfile?.bank || '');
  const [agencia, setAgencia] = useState(guideProfile?.agency || '');
  const [conta, setConta] = useState(guideProfile?.account || '');
  const [accountType, setAccountType] = useState(guideProfile?.accountType || 'corrente'); // 'corrente' ou 'poupanca'

  const [showConta, setShowConta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carrega dados bancários salvos anteriormente se existirem no cache
  useEffect(() => {
    async function loadSavedData() {
      try {
        const stored = await getStoredBankingInfo(guideId);
        if (stored) {
          if (stored.cadasturFormatted || stored.cadasturNumber) {
            setCadastur(stored.cadasturFormatted || stored.cadasturNumber);
          }
          if (stored.bank) setBanco(stored.bank);
          if (stored.agency) setAgencia(stored.agency);
          if (stored.account) setConta(stored.account);
          if (stored.accountType) setAccountType(stored.accountType);
        }
      } catch (_e) {}
    }
    loadSavedData();
  }, [guideId]);

  // Formatação automática do Cadastur
  const handleCadasturChange = (text) => {
    const formatted = formatCadastur(text);
    setCadastur(formatted || text);
  };

  const handleSubmit = async () => {
    const rawCadastur = cadastur.trim();
    const rawBanco = banco.trim();
    const rawAgencia = agencia.trim();
    const rawConta = conta.trim();

    if (!rawCadastur) {
      Alert.alert('Campo Obrigatório', 'Por favor, insira o número do Cadastur.');
      return;
    }
    if (!rawBanco) {
      Alert.alert('Campo Obrigatório', 'Por favor, insira o nome do seu banco.');
      return;
    }
    if (!rawAgencia) {
      Alert.alert('Campo Obrigatório', 'Por favor, insira a sua agência.');
      return;
    }
    if (!rawConta) {
      Alert.alert('Campo Obrigatório', 'Por favor, insira o número da sua conta.');
      return;
    }

    setIsSubmitting(true);
    try {
      const bankingPayload = {
        cadasturNumber: rawCadastur,
        bank: rawBanco,
        agency: rawAgencia,
        account: rawConta,
        accountType,
        hasCompletedBankingInfo: true,
      };

      // 1. Salva no Firestore e no cache AsyncStorage
      await saveGuideProfile(guideId, bankingPayload);

      // 2. Atualiza estado em memória no AuthContext
      if (updateGuideProfile) {
        updateGuideProfile(bankingPayload);
      }

      // 3. Feedback e navegação para a tela de cadastro de evento
      Alert.alert(
        'Cadastro Concluído!',
        'Seus dados bancários e Cadastur foram salvos com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (returnTo) {
                navigation?.replace(returnTo);
              } else {
                navigation?.replace('CadastrarEvento');
              }
            },
          },
        ]
      );
    } catch (err) {
      console.warn('Erro ao salvar dados bancários:', err);
      if (updateGuideProfile) {
        updateGuideProfile({
          cadasturNumber: rawCadastur,
          bank: rawBanco,
          agency: rawAgencia,
          account: rawConta,
          accountType,
          hasCompletedBankingInfo: true,
        });
      }
      navigation?.replace(returnTo || 'CadastrarEvento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormFilled =
    cadastur.trim().length > 0 &&
    banco.trim().length > 0 &&
    agencia.trim().length > 0 &&
    conta.trim().length > 0 &&
    Boolean(accountType);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation?.goBack()}
              activeOpacity={0.7}
            >
              <MaterialDesignIcons name="arrow-left" size={26} color="#000000" />
            </TouchableOpacity>

            <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit>
              Dados Bancários e Cadastur
            </Text>

            <View style={styles.headerRightSpacer} />
          </View>

          {/* 4 Barrinhas de Progresso Roxas */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={[styles.progressBar, styles.progressActive]} />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Campo: Número Cadastur */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Número Cadastur</Text>
            <TextInput
              style={styles.input}
              placeholder="Insira o número do Cadastur"
              placeholderTextColor={colors.inputBorder}
              value={cadastur}
              onChangeText={handleCadasturChange}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Campo: Banco */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Banco</Text>
            <TextInput
              style={styles.input}
              placeholder="Insira o nome do seu banco"
              placeholderTextColor={colors.inputBorder}
              value={banco}
              onChangeText={setBanco}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Campo: Agência */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Agência</Text>
            <TextInput
              style={styles.input}
              placeholder="Insira o número da sua agência"
              placeholderTextColor={colors.inputBorder}
              value={agencia}
              onChangeText={setAgencia}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Campo: Conta (com botão de ocultar/revelar) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Conta</Text>
            <View style={styles.accountInputWrapper}>
              <TextInput
                style={styles.accountInput}
                placeholder="Insira o número da conta"
                placeholderTextColor={colors.inputBorder}
                value={conta}
                onChangeText={setConta}
                secureTextEntry={!showConta}
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConta((prev) => !prev)}
                activeOpacity={0.7}
              >
                <Feather
                  name={showConta ? 'eye' : 'eye-off'}
                  size={22}
                  color="#374151"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Linha Divisória em Barra Arredondada */}
          <View style={styles.dividerBarWrapper}>
            <View style={styles.dividerBar} />
          </View>

          {/* Opções de Tipo de Conta (Radio buttons) */}
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setAccountType('corrente')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.radioCircle,
                  accountType === 'corrente' && styles.radioCircleSelected,
                ]}
              >
                {accountType === 'corrente' && <View style={styles.radioCircleInner} />}
              </View>
              <Text style={styles.radioLabel}>Conta Corrente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setAccountType('poupanca')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.radioCircle,
                  accountType === 'poupanca' && styles.radioCircleSelected,
                ]}
              >
                {accountType === 'poupanca' && <View style={styles.radioCircleInner} />}
              </View>
              <Text style={styles.radioLabel}>Conta Poupança</Text>
            </TouchableOpacity>
          </View>

          {/* Botão Concluir Cadastro */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isFormFilled || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isFormFilled || isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Concluir cadastro</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Rodapé compartilhado com Termos de Uso */}
        <FooterTerms />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 12 : 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  headerRightSpacer: {
    width: 36,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  progressBar: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.progressInactive || '#ECEFF1',
  },
  progressActive: {
    backgroundColor: colors.progressActive || '#BEADFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  formGroup: {
    width: '90%',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text || '#27252E',
    marginBottom: 8,
    textAlign: 'left',
  },
  input: {
    height: 52,
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.inputBorder || '#9CA3AF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text || '#27252E',
    backgroundColor: '#ffffff',
  },
  accountInputWrapper: {
    height: 52,
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.inputBorder || '#9CA3AF',
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 10,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.text || '#27252E',
  },
  eyeButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dividerBarWrapper: {
    width: '90%',
    marginVertical: 14,
  },
  dividerBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    width: '100%',
  },
  radioGroup: {
    width: '90%',
    marginBottom: 18,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.8,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#ffffff',
  },
  radioCircleSelected: {
    borderColor: colors.primary || '#264A31',
  },
  radioCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary || '#264A31',
  },
  radioLabel: {
    fontSize: 16,
    color: colors.text || '#27252E',
    fontWeight: '500',
  },
  submitButton: {
    width: '90%',
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary || '#264A31',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: colors.primary || '#264A31',
    opacity: 0.4,
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
