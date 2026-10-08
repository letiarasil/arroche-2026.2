import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export default function FooterLogoBanner() {
  return (
    <View style={styles.footerBanner}>
      <Image
        source={require('../assets/logo-arroche.png')}
        style={styles.footerLogo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footerBanner: {
    backgroundColor: colors.primary,
    paddingVertical: 30,
    alignItems: 'center',
    marginTop: 24,
  },
  footerLogo: {
    height: 48,
    width: 200,
    tintColor: '#FFFFFF',
  },
});
