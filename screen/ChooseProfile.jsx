import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';

import StepHeader from '../components/StepHeader';
import FooterTerms from '../components/FooterTerms';
import { colors } from '../constants/colors';

function ChooseProfile({ navigation }) {
  const handleSelectProfile = (profileType) => {
    navigation?.navigate('CreateEmail', { profileType });
  };

  return (
    <>
      <StatusBar hidden={true} />

      <View style={styles.container}>
        {/* Cabeçalho da etapa 1 de 4 */}
        <StepHeader
          title="Escolha seu perfil 1 / 4"
          currentStep={1}
          totalSteps={4}
          onBack={() => navigation?.goBack()}
        />

        <View style={styles.content}>
          <Text style={styles.questionText}>Como você quer usar o Arroche?</Text>

          {/* Opção 1: Sou trilheiro */}
          <TouchableOpacity
            style={[styles.card, styles.cardHiker]}
            onPress={() => handleSelectProfile('trilheiro')}
            activeOpacity={0.8}
          >
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, styles.titleHiker]}>Sou trilheiro</Text>
              <Text style={styles.cardSubtitle}>
                Explore trilhas e encontre guias para suas aventuras
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#1F2937" />
          </TouchableOpacity>

          <Text style={styles.dividerText}>ou</Text>

          {/* Opção 2: Sou guia */}
          <TouchableOpacity
            style={[styles.card, styles.cardGuide]}
            onPress={() => handleSelectProfile('guia')}
            activeOpacity={0.8}
          >
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, styles.titleGuide]}>Sou guia</Text>
              <Text style={styles.cardSubtitle}>
                Cadastre suas trilhas e conecte-se com trilheiros
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Rodapé compartilhado com Termos */}
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
    paddingHorizontal: 20,
    paddingTop: 30,
  },

  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },

  cardHiker: {
    borderColor: colors.primary,
  },

  cardGuide: {
    borderColor: colors.buttonOrange || '#EA6D12',
  },

  cardInfo: {
    flex: 1,
    paddingRight: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },

  titleHiker: {
    color: colors.primary,
  },

  titleGuide: {
    color: colors.buttonOrange || '#EA6D12',
  },

  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  dividerText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
    marginVertical: 20,
  },
});

export default ChooseProfile;
