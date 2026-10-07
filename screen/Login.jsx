import { View, Text, Image, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

import FooterTerms from '../components/FooterTerms';
import { colors } from '../constants/colors';

function Login({ navigation }) {
  return (
    <>
      <StatusBar hidden={true} />

      <View style={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.topo}>
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

        <Text style={styles.subtitle}>Bem vindo de volta!</Text>

        <View style={styles.content}>
          {/* Botão Primário: Continuar com e-mail */}
          <TouchableOpacity
            style={[styles.button, styles.buttonPri]}
            onPress={() => navigation?.navigate('LoginEmail')}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, styles.buttonTextPri]}>Continuar com e-mail</Text>
          </TouchableOpacity>

          <Text style={styles.dividerText}>ou</Text>

          {/* Botão Secundário: Continuar com o Google */}
          <TouchableOpacity
            style={[styles.button, styles.buttonSec]}
            activeOpacity={0.8}
          >
            <Image
              source={require('../assets/google.png')}
              style={styles.googleIcon}
              resizeMode="contain"
            />
            <Text style={[styles.buttonText, styles.buttonTextSec]}>Continuar com o Google</Text>
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

  topo: {
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

  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 30,
  },

  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 50,
    marginTop: 60,
  },

  button: {
    width: '90%',
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonPri: {
    backgroundColor: colors.primary,
    marginBottom: 16,
  },

  buttonSec: {
    backgroundColor: '#ffffff',
    borderColor: colors.border,
    borderWidth: 1.5,
    marginTop: 16,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  buttonTextPri: {
    color: '#ffffff',
  },

  buttonTextSec: {
    color: '#040404',
  },

  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
  },

  dividerText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Login;
