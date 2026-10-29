import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import Menu from '../components/Menu';

const TIPS = [
  {
    id: 1,
    title: '1. Use roupas confortáveis',
    description: 'Prefira roupas leves e que permitam liberdade de movimento.',
  },
  {
    id: 2,
    title: '2. Escolha um calçado adequado',
    description:
      'Use tênis ou botas confortáveis, com boa aderência e já utilizados anteriormente.',
  },
  {
    id: 3,
    title: '3. Leve água suficiente',
    description:
      'Mantenha-se hidratado durante todo o percurso e leve uma quantidade adequada de água.',
  },
  {
    id: 4,
    title: '4. Proteja-se do sol',
    description:
      'Use protetor solar, boné ou chapéu e, se possível, roupas que ofereçam proteção.',
  },
  {
    id: 5,
    title: '5. Leve alguns alimentos',
    description:
      'Tenha lanches leves e práticos para repor as energias durante a trilha.',
  },
  {
    id: 6,
    title: '6. Não esqueça seus itens pessoais',
    description:
      'Leve celular, documentos, medicamentos de uso pessoal e outros itens necessários.',
  },
  {
    id: 7,
    title: '7. Siga as orientações do guia',
    description:
      'Acompanhe o grupo e siga as instruções do guia durante todo o percurso.',
  },
  {
    id: 8,
    title: '8. Respeite a natureza',
    description:
      'Não deixe lixo pelo caminho e evite retirar plantas, pedras ou outros elementos do ambiente.',
  },
];

export default function DicasTrilha({ navigation, route }) {
  const { title } = route?.params || {};

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Superior */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DICAS</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      {/* Conteúdo das Dicas */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>
          {title ? `Dicas para a trilha - ${title}` : 'Dicas para a trilha'}
        </Text>

        <View style={styles.tipsList}>
          {TIPS.map((tip) => (
            <View key={tip.id} style={styles.tipItem}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Menu Inferior */}
      <Menu activeTab="Trilhas" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 8 : 46,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.8,
  },
  headerRightSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 32,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 20,
  },
  tipsList: {
    gap: 16,
  },
  tipItem: {
    marginBottom: 6,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
    lineHeight: 18,
  },
  tipDescription: {
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 19,
  },
});
