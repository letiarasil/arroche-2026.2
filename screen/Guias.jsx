import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { colors } from '../constants/colors';
import { MOCK_GUIDES_LIST } from '../constants/mockGuideProfile';
import HeaderWithBell from '../components/HeaderWithBell';
import SearchBar from '../components/SearchBar';
import UserAvatar from '../components/UserAvatar';
import Menu from '../components/Menu';

export default function Guias({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtra a lista de guias pelo nome ou especialidades pesquisadas
  const filteredGuides = MOCK_GUIDES_LIST.filter((guide) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const nameMatch =
      guide.name.toLowerCase().includes(query) ||
      (guide.displayName && guide.displayName.toLowerCase().includes(query));
    const specialtyMatch =
      guide.specialties && guide.specialties.toLowerCase().includes(query);
    return nameMatch || specialtyMatch;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header com Logo ARROCHE e Notificações (Sino) */}
      <HeaderWithBell onBellPress={() => {}} />

      {/* Barra de Pesquisa de Guias */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Pesquisar por guias"
        onFilterPress={() => {}}
      />

      {/* Listagem de Cards de Profissionais */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredGuides.map((guide) => (
          <TouchableOpacity
            key={guide.id}
            style={styles.guideCard}
            activeOpacity={0.7}
            onPress={() => navigation?.navigate('PerfilGuia', { guide })}
          >
            <UserAvatar
              source={guide.avatar}
              name={guide.displayName || guide.name}
              size={50}
              style={styles.cardAvatar}
            />

            <View style={styles.cardInfo}>
              <Text style={styles.guideName}>
                {guide.displayName || guide.name}
              </Text>
              <Text style={styles.guideSpecialties} numberOfLines={2}>
                {guide.specialties}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {filteredGuides.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhum guia encontrado para "{searchQuery}".
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Menu Inferior com a Aba 'Guias' Ativa */}
      <Menu activeTab="Guias" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 6,
    paddingBottom: 20,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardAvatar: {
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  guideName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  guideSpecialties: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 16,
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
