import { View, Text, TextInput, StyleSheet, StatusBar } from 'react-native';
import { useState } from 'react';

import StepHeader from '../components/StepHeader';
import ButtonContinue from '../components/ButtonContinue';
import FooterTerms from '../components/FooterTerms';
import { colors } from '../constants/colors';

function CreateEmail({ navigation }) {
  const [email, setEmail] = useState('');

  const isButtonDisabled = email.trim().length === 0;

  return (
    <>
      <StatusBar hidden={true} />

      <View style={styles.container}>
        
        {/* Cabeçalho da etapa 1 */}
        <StepHeader
          title="Adicione seu email 1 / 3"
          currentStep={1}
          totalSteps={3}
          onBack={() => navigation?.goBack()}
        />
      
        {/* Formulário */}
        <View style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="example@exemplo"
              placeholderTextColor={colors.inputBorder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <ButtonContinue 
            disabled={isButtonDisabled}
            onPress={() => {
              navigation?.navigate('VerifyEmail', { email });
            }}
          />
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
    paddingTop: 40,
    paddingHorizontal: 20,
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
});

export default CreateEmail;