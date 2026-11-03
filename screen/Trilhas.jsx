import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { colors } from '../constants/colors';
import { MOCK_TRAILS } from '../constants/mockTrails';
import { getActiveTrails } from '../services/trailService';
import HeaderWithBell from '../components/HeaderWithBell';
import SearchBar from '../components/SearchBar';
import TabSelector from '../components/TabSelector';
import TrailCard from '../components/TrailCard';
import ReplantBanner from '../components/ReplantBanner';
import FooterLogoBanner from '../components/FooterLogoBanner';
import Menu from '../components/Menu';

const TABS = [
  { id: 'disponiveis', label: 'Trilhas Disponíveis' },
  { id: 'minhas', label: 'Minhas Trilhas' },
];

export default function Trilhas({ navigation }) {
  const [activeTab, setActiveTab] = useState('disponiveis');
  const [savedTrails, setSavedTrails] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [trailsData, setTrailsData] = useState(MOCK_TRAILS);

  // Conexão com o banco de dados Firestore para buscar trilhas ativas
  useEffect(() => {
    let isMounted = true;
    async function fetchTrails() {
      try {
        const firestoreTrails = await getActiveTrails();
        if (firestoreTrails && firestoreTrails.length > 0 && isMounted) {
          const facil = firestoreTrails.filter(
            (t) =>
              t.difficulty?.toLowerCase().includes('fácil') ||
              t.difficulty?.toLowerCase().includes('facil')
          );
          const medio = firestoreTrails.filter(
            (t) =>
              t.difficulty?.toLowerCase().includes('médio') ||
              t.difficulty?.toLowerCase().includes('medio')
          );
          const dificil = firestoreTrails.filter(
            (t) =>
              t.difficulty?.toLowerCase().includes('difícil') ||
              t.difficulty?.toLowerCase().includes('dificil')
          );

          setTrailsData({
            facil: facil.length > 0 ? facil : MOCK_TRAILS.facil,
            medio: medio.length > 0 ? medio : MOCK_TRAILS.medio,
            dificil: dificil.length > 0 ? dificil : MOCK_TRAILS.dificil,
          });
        }
      } catch (err) {
        console.warn('Conexão Firestore: usando dados locais de trilhas.', err?.message);
      }
    }

    fetchTrails();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSave = (id) => {
    setSavedTrails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderSection = (title, data) => (
    <View key={title}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        {data.map((item) => (
          <TrailCard
            key={item.id}
            item={item}
            isSaved={!!savedTrails[item.id]}
            onToggleSave={toggleSave}
            onPressVerMais={(trailItem) =>
              navigation?.navigate('DetalhesEvento', {
                eventId: trailItem.id,
                item: trailItem,
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <HeaderWithBell onBellPress={() => navigation?.navigate('Notificacoes')} />

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Pesquisar por trilhas"
          onFilterPress={() => {}}
        />

        {/* Sub Header Tabs */}
        <TabSelector
          tabs={TABS}
          activeTab="disponiveis"
          onSelectTab={(tabId) => {
            if (tabId === 'minhas') {
              navigation?.navigate('MinhasTrilhas');
            } else {
              setActiveTab(tabId);
            }
          }}
        />

        {/* Fácil Section */}
        {renderSection('Fácil', trailsData.facil)}

        {/* Replant Banner */}
        <ReplantBanner onPress={() => {}} />

        {/* Médio Section */}
        {renderSection('Médio', trailsData.medio)}

        {/* Difícil Section */}
        {renderSection('Difícil', trailsData.dificil)}

        {/* Footer Logo Banner */}
        <FooterLogoBanner />
      </ScrollView>

      {/* Menu Bar at Bottom */}
      <Menu activeTab="Trilhas" navigation={navigation} />
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
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  horizontalScrollContent: {
    paddingLeft: 20,
    paddingRight: 8,
  },
});
