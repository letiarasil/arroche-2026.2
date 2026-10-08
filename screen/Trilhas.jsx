import React, { useState } from 'react';
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
            onPressVerMais={() => {}}
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
        <HeaderWithBell onBellPress={() => {}} />

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
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Fácil Section */}
        {renderSection('Fácil', MOCK_TRAILS.facil)}

        {/* Replant Banner */}
        <ReplantBanner onPress={() => {}} />

        {/* Médio Section */}
        {renderSection('Médio', MOCK_TRAILS.medio)}

        {/* Difícil Section */}
        {renderSection('Difícil', MOCK_TRAILS.dificil)}

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
