import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

import StepHeader from '../components/StepHeader';
import ButtonContinue from '../components/ButtonContinue';
import FooterTerms from '../components/FooterTerms';
import { colors } from '../constants/colors';
import { mockDatabase } from '../constants/mockAuth';

function CreatePassword({ navigation, route }) {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email recebido das etapas anteriores (caso necessário no fluxo)
  const userEmail = route?.params?.email || '';

  // Formatação com máscara de CPF: 000.000.000-00
  const handleCpfChange = (text) => {
    const raw = text.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;

    if (raw.length > 9) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9, 11)}`;
    } else if (raw.length > 6) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
    } else if (raw.length > 3) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3)}`;
    }

    setCpf(formatted);
  };

  // Regras de validação da senha
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  // Cálculo da força da senha para a barrinha
  const rulesMetCount = [hasMinLength, hasNumber, hasSymbol].filter(Boolean).length;

  const getStrengthBarInfo = () => {
    if (password.length === 0) return { width: '0%', color: 'transparent' };
    if (rulesMetCount === 1) return { width: '33%', color: colors.strengthWeak };
    if (rulesMetCount === 2) return { width: '66%', color: colors.strengthMedium };
    if (rulesMetCount === 3) return { width: '100%', color: colors.strengthStrong };
    return { width: '15%', color: colors.strengthWeak };
  };

  const strengthBar = getStrengthBarInfo();

  // Validação geral do formulário para habilitar o botão
  const isCpfComplete = cpf.replace(/\D/g, '').length === 11;
  const isNameValid = name.trim().length >= 2;
  const isPasswordValid = hasMinLength && hasNumber && hasSymbol;

  const isButtonDisabled = !(isNameValid && isCpfComplete && isPasswordValid);

  const handleContinue = () => {
    // Guarda o usuário recém-cadastrado na memória para permitir o teste de login
    mockDatabase.registeredUser = {
      email: userEmail,
      password,
      name,
      cpf,
    };

    navigation?.navigate('AccountCreated', {
      email: userEmail,
      name,
      cpf,
    });
  };

  return (
    <>
      <StatusBar hidden={true} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StepHeader
          title="Conclua seu cadastro 3 / 3"
          currentStep={3}
          totalSteps={3}
          onBack={() => navigation?.goBack()}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Campo Nome Completo */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Insira seu nome"
              placeholderTextColor={colors.inputBorder}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Campo CPF */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="Insira seu CPF"
              placeholderTextColor={colors.inputBorder}
              value={cpf}
              onChangeText={handleCpfChange}
              keyboardType="numeric"
              maxLength={14}
            />
          </View>

          {/* Campo Senha */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Insira uma senha"
                placeholderTextColor={colors.inputBorder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword((prev) => !prev)}
                activeOpacity={0.7}
              >
                <MaterialDesignIcons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Barra de Força da Senha */}
            {password.length > 0 && (
              <View style={styles.strengthBarBackground}>
                <View
                  style={[
                    styles.strengthBarFill,
                    {
                      width: strengthBar.width,
                      backgroundColor: strengthBar.color,
                    },
                  ]}
                />
              </View>
            )}

            {/* Requisitos da Senha */}
            <View style={styles.requirementsContainer}>
              {/* Mínimo de 6 caracteres */}
              <View style={styles.requirementRow}>
                <View style={[styles.requirementIcon, hasMinLength && styles.requirementIconActive]}>
                  {hasMinLength ? (
                    <MaterialDesignIcons name="check" size={13} color="#ffffff" />
                  ) : (
                    <View style={styles.circleInactive} />
                  )}
                </View>
                <Text style={[styles.requirementText, hasMinLength && styles.requirementTextActive]}>
                  Mínimo de 6 caracteres
                </Text>
              </View>

              {/* Um número */}
              <View style={styles.requirementRow}>
                <View style={[styles.requirementIcon, hasNumber && styles.requirementIconActive]}>
                  {hasNumber ? (
                    <MaterialDesignIcons name="check" size={13} color="#ffffff" />
                  ) : (
                    <View style={styles.circleInactive} />
                  )}
                </View>
                <Text style={[styles.requirementText, hasNumber && styles.requirementTextActive]}>
                  Um número
                </Text>
              </View>

              {/* Um símbolo */}
              <View style={styles.requirementRow}>
                <View style={[styles.requirementIcon, hasSymbol && styles.requirementIconActive]}>
                  {hasSymbol ? (
                    <MaterialDesignIcons name="check" size={13} color="#ffffff" />
                  ) : (
                    <View style={styles.circleInactive} />
                  )}
                </View>
                <Text style={[styles.requirementText, hasSymbol && styles.requirementTextActive]}>
                  Um símbolo
                </Text>
              </View>
            </View>
          </View>

          {/* Botão de envio */}
          <View style={styles.buttonWrapper}>
            <ButtonContinue
              disabled={isButtonDisabled}
              onPress={handleContinue}
            />
          </View>
        </ScrollView>

        {/* Rodapé compartilhado com Termos */}
        <FooterTerms />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  formGroup: {
    width: '90%',
    marginBottom: 16,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'left',
  },

  input: {
    height: 52,
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#ffffff',
  },

  passwordContainer: {
    height: 52,
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.text,
  },

  eyeButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  strengthBarBackground: {
    height: 4,
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },

  strengthBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  requirementsContainer: {
    marginTop: 12,
    gap: 8,
  },

  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  requirementIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  requirementIconActive: {
    backgroundColor: colors.primary,
  },

  circleInactive: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
  },

  requirementText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  requirementTextActive: {
    color: colors.text,
    fontWeight: '500',
  },

  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
});

export default CreatePassword;
