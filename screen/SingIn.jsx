import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import { Link } from '@react-navigation/native';
import { Button } from '@react-navigation/elements';

function SingIn() {
  return (
    <>
      <StatusBar hidden={true} />

      <View style={styles.container}>

        <Image
          source={require('../assets/back-arroche.png')}
          style={styles.background}
          resizeMode="cover"
        />

        <View style={styles.content}>

        <Image
          source={require('../assets/logo-arroche.png')}
          style={styles.logo}
        />         

          <Button
            screen={"CreateAccount"}
            style={styles.button}
          >
            <Text style={styles.buttonText}> Criar uma conta </Text>
          </Button>

          <Link screen="Login" style={styles.link}> Já tem conta? <Text style={styles.bold}> Log in </Text> </Link>

          <Link screen="LoginGuia" style={styles.link}> Entre como <Text style={styles.bold}> Guia </Text> </Link>

        </View>

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },

  button: {
    width: '70%',
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 10,
  },

  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },

  link: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },

  bold:{
    fontWeight: "bold"
  },

  logo: {
    height: 120,
    aspectRatio: 2380 / 1270,
    marginBottom: 45,
  }
});

export default SingIn;