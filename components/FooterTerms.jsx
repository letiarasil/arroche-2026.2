import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

function FooterTerms() {
  return (
    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>
        Ao usar o Arroche você concorda com os{'\n'}
        <Text style={styles.linkText} onPress={() => {}}>Termos</Text>
        {' e a '}
        <Text style={styles.linkText} onPress={() => {}}>Política de Privacidade.</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 35,
    paddingHorizontal: 25,
  },

  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  linkText: {
    color: colors.link,
    fontWeight: '500',
  },
});

export default FooterTerms;
