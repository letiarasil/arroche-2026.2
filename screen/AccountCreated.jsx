import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

import ButtonContinue from '../components/ButtonContinue';
import FooterTerms from '../components/FooterTerms';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

function AccountCreated({ navigation }) {
  const { login } = useAuth();

  const handleGoToApp = () => {
    // Loga diretamente → RootStack redireciona para Trilhas
    login();
  };

  return (
    <>
      <StatusBar hidden={true} />

      <View style={styles.container}>
        <View style={styles.content}>
          {/* Ícone de Sucesso: Trevo/Flor com check no centro */}
          <View style={styles.flowerContainer}>
            <View style={[styles.petal, styles.petalTopLeft]} />
            <View style={[styles.petal, styles.petalTopRight]} />
            <View style={[styles.petal, styles.petalBottomLeft]} />
            <View style={[styles.petal, styles.petalBottomRight]} />
            <View style={styles.checkWrapper}>
              <MaterialDesignIcons
                name="check"
                size={28}
                color={colors.primary}
              />
            </View>
          </View>

          {/* Mensagem de sucesso */}
          <Text style={styles.title}>
            Sua conta{'\n'}foi criada com sucesso!
          </Text>

          {/* Botão para o Login */}
          <ButtonContinue
            title="Entrar no app"
            onPress={handleGoToApp}
          />
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
    justifyContent: 'space-between',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -30,
  },

  flowerContainer: {
    width: 86,
    height: 86,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
  },

  petal: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.petals || '#C8BAB1',
  },

  petalTopLeft: {
    top: 4,
    left: 4,
  },

  petalTopRight: {
    top: 4,
    right: 4,
  },

  petalBottomLeft: {
    bottom: 4,
    left: 4,
  },

  petalBottomRight: {
    bottom: 4,
    right: 4,
  },

  checkWrapper: {
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 44,
  },
});

export default AccountCreated;
