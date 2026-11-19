import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const FAQ_ITEMS = [
  {
    id: 'faq1',
    question: 'Como se inscrever em uma trilha?',
    answer:
      'Navegue pela aba "Trilhas", escolha o percurso desejado e toque em "Ver mais". Na tela de detalhes, selecione a quantidade de vagas e toque em "Inscrever-se" para prosseguir ao pagamento.',
  },
  {
    id: 'faq2',
    question: 'Qual é a política de cancelamento e reembolso?',
    answer:
      'Você pode cancelar sua reserva até 2 dias antes da realização da trilha diretamente na tela de detalhes do evento. O valor pago será estornado em até 3 dias úteis.',
  },
  {
    id: 'faq3',
    question: 'Como entrar em contato com o guia?',
    answer:
      'Você pode interagir com o guia no "Quadro de Avisos / Perguntas" disponível na página de cada trilha ou consultar seu perfil profissional na aba "Guias".',
  },
  {
    id: 'faq4',
    question: 'O que devo levar e vestir para a trilha?',
    answer:
      'Recomendamos roupas confortáveis, calçado aderente, protetor solar e água suficiente. Veja a lista completa de orientações na aba "Dicas".',
  },
];

export default function Ajuda({ navigation }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

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
        <Text style={styles.headerTitle}>AJUDA</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeader}>Perguntas Frequentes</Text>

        <View style={styles.faqList}>
          {FAQ_ITEMS.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <View key={item.id} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqHeaderRow}
                  onPress={() => toggleExpand(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Feather
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionHeader}>Orientações Gerais</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Feather name="shield" size={18} color={colors.primary} />
            <Text style={styles.infoText}>
              Trilhas acompanhadas por guias credenciados com foco em segurança.
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Feather name="file-text" size={18} color={colors.primary} />
            <Text style={styles.infoText}>
              Consulte nossos Termos e Política de Privacidade para mais detalhes.
            </Text>
          </View>
        </View>

        {/* Informação sobre canal de suporte */}
        <View style={styles.noteCard}>
          <Feather
            name="info"
            size={18}
            color={colors.primary}
            style={styles.noteIcon}
          />
          <Text style={styles.noteText}>
            Dúvidas sobre pontos de encontro, horários e itens para cada percurso
            podem ser esclarecidas diretamente com os guias no Quadro de Perguntas da trilha.
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
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  faqList: {
    marginBottom: 20,
    gap: 10,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#111827',
    paddingRight: 10,
  },
  faqAnswerContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4B5563',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EBF3ED',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BDD3C2',
  },
  noteIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: 12.5,
    color: '#264A31',
    lineHeight: 18,
  },
});

