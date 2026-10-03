import { View, Text, Image, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

function CreateAccount({ navigation }) {
  return (
    <>
      <StatusBar hidden={true} />

      <View style={styles.container}>
        
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
          <Text style={styles.title}>Criar nova conta</Text>
          <View style={styles.headerRight} />
        </View>
      
        <Text style={styles.subtitle}>Comece criando uma nova conta gratuita</Text>

        <View style={styles.content}>

          <TouchableOpacity
            style={[styles.button, styles.buttonPri]}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, styles.buttonTextPri]}>Continuar com email</Text>
          </TouchableOpacity>

          <Text style={styles.dividerText}>ou</Text>

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

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Ao usar o Arroche você concorda com os{'\n'}
            <Text style={styles.linkText} onPress={() => {}}>Termos</Text>
            {' e a '}
            <Text style={styles.linkText} onPress={() => {}}>Política de Privacidade.</Text>
          </Text>
        </View>

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    color: '#27252E',
    textAlign: 'center',
  },

  headerRight: {
    width: 36,
  },

  subtitle: {
    color: '#71717A',
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
    width: '80%',
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonPri: {
    backgroundColor: '#264A31',
    marginBottom: 16,
  },

  buttonSec: {
    backgroundColor: '#ffffff',
    borderColor: '#C7C5CC',
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
    color: '#71717A',
    fontSize: 16,
    textAlign: 'center',
  },

  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 35,
    paddingHorizontal: 25,
  },

  footerText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  linkText: {
    color: '#1D61B0',
    fontWeight: '500',
  },
});

export default CreateAccount;