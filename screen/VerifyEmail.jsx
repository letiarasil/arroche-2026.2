import { View, Text, TextInput, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useState, useRef } from 'react';

import StepHeader from '../components/StepHeader';
import ButtonContinue from '../components/ButtonContinue';
import FooterTerms from '../components/FooterTerms';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

function VerifyEmail({ navigation, route }) {
  const [code, setCode] = useState(['', '', '', '', '']);
  const inputsRef = useRef([]);
  const { login } = useAuth();

  // Pega o email vindo da tela anterior ou usa o fallback
  const userEmail = route?.params?.email || 'sarah.jansen@gmail.com';

  // Habilita o botão somente quando os 5 dígitos estiverem preenchidos
  const isButtonDisabled = code.some((digit) => digit.trim() === '');

  const handleChangeText = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Pula para o próximo campo automaticamente se preenchido
    if (text && index < 4) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Volta para o campo anterior ao apagar se o campo atual estiver vazio
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <>
      <StatusBar hidden={true} />

      <View style={styles.container}>
        
        {/* Cabeçalho da etapa 2 */}
        <StepHeader
          title="Verifique seu email 2 / 3"
          currentStep={2}
          totalSteps={3}
          onBack={() => navigation?.goBack()}
        />

        {/* Conteúdo principal */}
        <View style={styles.content}>
          
          {/* Mensagem informativa */}
          <Text style={styles.description}>
            Acabamos de enviar um código de 5 dígitos{'\n'}
            para {userEmail}. Insira-o abaixo:
          </Text>

          {/* Campo de Código com 5 dígitos */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Code</Text>
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputsRef.current[index] = ref)}
                  style={styles.codeInput}
                  value={digit}
                  onChangeText={(text) => handleChangeText(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                />
              ))}
            </View>
          </View>

          <ButtonContinue
            disabled={isButtonDisabled}
            onPress={() => {
              login(); // Muda o estado para logado
            }}
          />

          {/* Link para e-mail incorreto */}
          <TouchableOpacity 
            style={styles.changeEmailContainer}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.changeEmailText}>
              E-mail incorreto?{' '}
              <Text style={styles.changeEmailBold}>Enviar para um e-mail diferente</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rodapé compartilhado */}
        <FooterTerms />

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },

  description: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 15,
  },

  formGroup: {
    width: '90%',
    marginBottom: 24,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'left',
  },

  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  codeInput: {
    width: 52,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    backgroundColor: '#ffffff',
  },

  changeEmailContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
  },

  changeEmailText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },

  changeEmailBold: {
    fontWeight: 'bold',
    color: '#111827',
  },
});

export default VerifyEmail;
