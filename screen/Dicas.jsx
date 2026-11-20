import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import Menu from '../components/Menu';

const TIPS_DATA = [
  {
    id: 1,
    number: '1',
    title: 'Use roupas confortáveis',
    description: 'Prefira roupas leves e que permitam liberdade de movimento.',
    iconName: 'tshirt-crew-outline',
  },
  {
    id: 2,
    number: '2',
    title: 'Escolha um calçado adequado',
    description:
      'Use tênis ou botas confortáveis, com boa aderência e já utilizados anteriormente.',
    iconName: 'shoe-sneaker',
  },
  {
    id: 3,
    number: '3',
    title: 'Leve água suficiente',
    description:
      'Mantenha-se hidratado durante todo o percurso e leve uma quantidade adequada de água.',
    iconName: 'water-outline',
  },
  {
    id: 4,
    number: '4',
    title: 'Proteja-se do sol',
    description:
      'Use protetor solar, boné ou chapéu e, se possível, roupas que ofereçam proteção.',
    iconName: 'white-balance-sunny',
  },
  {
    id: 5,
    number: '5',
    title: 'Leve alguns alimentos',
    description:
      'Tenha lanches leves e práticos para repor as energias durante a trilha.',
    iconName: 'food-apple-outline',
  },
  {
    id: 6,
    number: '6',
    title: 'Não esqueça seus itens pessoais',
    description:
      'Leve celular, documentos, medicamentos de uso pessoal e outros itens necessários.',
    iconName: 'bag-personal-outline',
  },
  {
    id: 7,
    number: '7',
    title: 'Siga as orientações do guia',
    description:
      'Acompanhe o grupo e siga as instruções do guia durante todo o percurso.',
    iconName: 'account-group-outline',
  },
  {
    id: 8,
    number: '8',
    title: 'Respeite a natureza',
    description:
      'Não deixe lixo pelo caminho e evite retirar plantas, pedras ou outros elementos do ambiente.',
    iconName: 'leaf',
  },
];

export default function Dicas({ navigation }) {
  const handleBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Trilhas');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header com seta de retorno e título centralizado DICAS */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DICAS</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtítulo em verde */}
        <Text style={styles.sectionSubtitle}>Dicas para a trilha</Text>

        {/* Lista Vertical de Cards de Dicas */}
        {TIPS_DATA.map((tip) => (
          <View key={tip.id} style={styles.tipCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name={tip.iconName}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.tipTitle}>
                {tip.number}. {tip.title}
              </Text>
            </View>
            <Text style={styles.tipDescription}>{tip.description}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Menu Inferior com a Aba 'Dicas' Ativa */}
      <Menu activeTab="Dicas" navigation={navigation} />
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
    paddingTop: 18,
    paddingBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EBF3ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  tipTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  tipDescription: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#4B5563',
    paddingLeft: 44,
  },
});

