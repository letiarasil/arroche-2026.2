import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export default function Sobre({ navigation }) {
  const handleBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Perfil');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header com botão de retorno */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOBRE</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner com Logo do App */}
        <View style={styles.appBrandCard}>
          <Image
            source={require('../assets/logo-verde.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Arroche</Text>
          <Text style={styles.appTagline}>Trilhas, Hiking e Trekking</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Versão 1.0.0</Text>
          </View>
        </View>

        {/* Sobre a Plataforma */}
        <Text style={styles.sectionHeader}>O Aplicativo</Text>
        <View style={styles.infoCard}>
          <Text style={styles.bodyText}>
            O Arroche é a plataforma dedicada a conectar amantes da natureza a
            guias credenciados para expedições, trilhas e turismo de aventura no
            sertão central do Ceará e região dos monólitos de Quixadá.
          </Text>
          <Text style={styles.bodyText}>
            Nossa missão é promover o ecoturismo sustentável, a valorização dos
            condutores locais e a preservação ambiental com segurança e
            comodidade para os participantes.
          </Text>
        </View>

        {/* Iniciativa Ecológica */}
        <Text style={styles.sectionHeader}>Compromisso com o Meio Ambiente</Text>
        <View style={styles.ecoCard}>
          <Ionicons name="leaf" size={26} color="#1F3E29" style={styles.ecoIcon} />
          <View style={styles.ecoTextCol}>
            <Text style={styles.ecoTitle}>Vamos replantar o mundo</Text>
            <Text style={styles.ecoDescription}>
              Iniciativa de conscientização e reflorestamento para manter as trilhas
              vivas para as futuras gerações.
            </Text>
          </View>
        </View>

        {/* Informações Técnicas e Direitos */}
        <View style={styles.footerInfo}>
          <Text style={styles.copyrightText}>
            © 2026 Arroche. Todos os direitos reservados.
          </Text>
          <Text style={styles.platformText}>
            Desenvolvido com React Native e Expo.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.8,
  },
  headerRightPlaceholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  appBrandCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 26,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  brandLogo: {
    width: 140,
    height: 38,
    marginBottom: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  appTagline: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  versionBadge: {
    backgroundColor: '#EBF3ED',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#4B5563',
    marginBottom: 8,
  },
  ecoCard: {
    backgroundColor: '#BDD3C2',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  ecoIcon: {
    marginRight: 14,
  },
  ecoTextCol: {
    flex: 1,
  },
  ecoTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1F3E29',
    marginBottom: 3,
  },
  ecoDescription: {
    fontSize: 12,
    color: '#34573D',
    lineHeight: 16,
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  copyrightText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  platformText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

