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
import { mockDatabase, enrichRegisteredGuideUser } from '../constants/mockAuth';
import { useAuth } from '../contexts/AuthContext';

function CreatePassword({ navigation, route }) {
  const { signUp, startRegistration } = useAuth();

  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Email recebido das etapas anteriores (caso necessário no fluxo)
  const userEmail = route?.params?.email || '';
  const profileType = route?.params?.profileType || 'trilheiro';

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
    if (errorMessage) setErrorMessage('');
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

  const isButtonDisabled = !(isNameValid && isCpfComplete && isPasswordValid) || isLoading;

  const handleContinue = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (startRegistration) {
        startRegistration();
      }

      // Conecta com o Firebase Auth e cria o perfil no Firestore
      if (signUp) {
        const role = profileType === 'guia' ? 'guide' : 'hiker';
        await signUp(userEmail.trim(), password, name.trim(), role, {
          cpf: cpf.replace(/\D/g, ''),
          profileType,
        });
      }

      if (profileType === 'guia') {
        enrichRegisteredGuideUser({
          id: `g-${Date.now()}`,
          name: name.trim(),
          email: userEmail.trim(),
          cpf,
        });
      }

      // Direciona para a tela de conta criada com sucesso
      navigation?.navigate('AccountCreated', {
        email: userEmail,
        name,
        cpf,
        profileType,
      });
    } catch (error) {
      console.warn('Erro ao criar conta no Firebase:', error);
      if (error?.code === 'auth/email-already-in-use') {
        setErrorMessage('Este e-mail já está cadastrado em outra conta.');
      } else if (error?.code === 'auth/invalid-email') {
        setErrorMessage('O formato do e-mail é inválido.');
      } else if (error?.code === 'auth/weak-password') {
        setErrorMessage('A senha informada é muito fraca.');
      } else {
        // Fallback para modo offline / testes em desenvolvimento
        mockDatabase.registeredUser = {
          email: userEmail,
          password,
          name,
          cpf,
        profileType,
        };
        navigation?.navigate('AccountCreated', {
          email: userEmail,
          name,
          cpf,
        profileType,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar hidden={true} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StepHeader
          title="Conclua seu cadastro 4 / 4"
          currentStep={4}
          totalSteps={4}
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
              onChangeText={(text) => {
                setName(text);
                if (errorMessage) setErrorMessage('');
              }}
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
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage('');
                }}
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

            {/* Mensagem de Erro de Cadastro */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <MaterialDesignIcons
                  name="alert-circle-outline"
                  size={16}
                  color={colors.strengthWeak}
                  style={styles.errorIcon}
                />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

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
              loading={isLoading}
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

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 2,
  },

  errorIcon: {
    marginRight: 6,
  },

  errorText: {
    color: colors.strengthWeak,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
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
