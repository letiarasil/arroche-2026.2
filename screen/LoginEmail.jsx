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
  Alert,
} from 'react-native';
import { useState } from 'react';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

import ButtonContinue from '../components/ButtonContinue';
import FooterTerms from '../components/FooterTerms';
import { colors } from '../constants/colors';
import { mockDatabase } from '../constants/mockAuth';

function LoginEmail({ navigation, route }) {
  // Preenche com o e-mail cadastrado caso tenha sido redirecionado do cadastro
  const initialEmail = route?.params?.email || mockDatabase.registeredUser?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());

  // O botão fica desabilitado quando o e-mail for inválido, a senha estiver vazia ou durante o carregamento
  const isButtonDisabled = !isEmailValid || password.length === 0 || isLoading;

  const handleEmailChange = (text) => {
    setEmail(text);
    if (hasError) setHasError(false);
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (hasError) setHasError(false);
  };

  const handleLogin = () => {
    setIsLoading(true);
    setHasError(false);

    setTimeout(() => {
      setIsLoading(false);

      const typedEmail = email.trim().toLowerCase();
      const typedPass = password;

      // 1. Confere se bate com o usuário cadastrado no fluxo anterior
      const registered = mockDatabase.registeredUser;
      const isMatchRegistered =
        registered &&
        registered.email.trim().toLowerCase() === typedEmail &&
        registered.password === typedPass;

      // 2. Ou confere com o usuário padrão de teste (sarah.jansen@gmail.com / senha123@)
      const isMatchDefault =
        mockDatabase.defaultUser.email.toLowerCase() === typedEmail &&
        mockDatabase.defaultUser.password === typedPass;

      if (isMatchRegistered || isMatchDefault) {
        const userName = registered?.name || 'Sarah Jansen';
        Alert.alert(
          'Login realizado!',
          `Bem-vindo(a) de volta, ${userName}!`,
          [{ text: 'OK' }]
        );
      } else {
        // Erro: exibe a mensagem vermelha do protótipo
        setHasError(true);
      }
    }, 800);
  };

  return (
    <>
      <StatusBar hidden={true} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <MaterialDesignIcons
              name="arrow-left"
              size={28}
              color="#000"
            />
          </TouchableOpacity>
          <Text style={styles.title}>Acesse sua conta</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Campo Email */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="example@example"
              placeholderTextColor={colors.inputBorder}
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Campo Senha */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Senha</Text>
            <View
              style={[
                styles.passwordContainer,
                hasError && styles.passwordContainerError,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Insira sua senha"
                placeholderTextColor={colors.inputBorder}
                value={password}
                onChangeText={handlePasswordChange}
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

            {/* Mensagem de Erro de Senha/Email Incorreto */}
            {hasError && (
              <View style={styles.errorContainer}>
                <MaterialDesignIcons
                  name="alert-circle-outline"
                  size={16}
                  color={colors.strengthWeak}
                  style={styles.errorIcon}
                />
                <Text style={styles.errorText}>
                  Ops! E-mail ou senha incorretos. Tente novamente.
                </Text>
              </View>
            )}
          </View>

          {/* Botão Log In com suporte a Loading */}
          <View style={styles.buttonWrapper}>
            <ButtonContinue
              title="Log In"
              disabled={isButtonDisabled}
              loading={isLoading}
              onPress={handleLogin}
            />
          </View>

          {/* Link Esqueceu a senha */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => {
              // Navegar para recuperação de senha futuramente
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
          </TouchableOpacity>
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },

  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },

  headerRight: {
    width: 36,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  formGroup: {
    width: '90%',
    marginBottom: 20,
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

  passwordContainerError: {
    borderColor: colors.strengthWeak,
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

  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },

  forgotPasswordButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});

export default LoginEmail;
