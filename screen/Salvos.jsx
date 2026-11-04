import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { colors } from '../constants/colors';
import { getUserSavedTrailIds, toggleSaveTrailInFirestore } from '../services/userService';
import { getTrailsByIds } from '../services/trailService';
import TrailCard from '../components/TrailCard';
import Menu from '../components/Menu';

export default function Salvos({ navigation }) {
  const [savedTrails, setSavedTrails] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function fetchSavedTrails() {
        if (!userId) {
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          const savedIds = await getUserSavedTrailIds(userId);

          if (savedIds && savedIds.length > 0) {
            const trails = await getTrailsByIds(savedIds);
            if (isMounted) setSavedTrails(trails);
          } else {
            if (isMounted) setSavedTrails([]);
          }
        } catch (error) {
          console.error('Erro ao carregar trilhas salvas:', error);
        } finally {
          if (isMounted) setLoading(false);
        }
      }

      fetchSavedTrails();

      return () => {
        isMounted = false;
      };
    }, [userId])
  );

  const handleRemoveSave = async (trailId) => {
    setSavedTrails((prev) => prev.filter((item) => item.id !== trailId));

    try {
      if (userId) {
        await toggleSaveTrailInFirestore(userId, trailId, true);
      }
    } catch (error) {
      console.error('Erro ao remover trilha dos salvos:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.content}>
        <Text style={styles.title}>Minhas Trilhas Salvas</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary || '#2e7d32'} />
          </View>
        ) : savedTrails.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Você ainda não possui nenhuma trilha salva.</Text>
          </View>
        ) : (
          <FlatList
            data={savedTrails}
            keyExtractor={(item) => item.id || String(Math.random())}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            // Coluna única: um abaixo do outro
            renderItem={({ item }) => (
              <TrailCard
                item={item}
                isSaved={true}
                fullWidth={true} // Prop informando para o card preencher a tela
                onToggleSave={() => handleRemoveSave(item.id)}
                onPressVerMais={(trail) =>
                  navigation?.navigate('DetalhesEvento', {
                    eventId: trail.id,
                    item: trail,
                  })
                }
              />
            )}
          />
        )}
      </View>

      <Menu activeTab="Salvos" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20, // Respeita os limites/margens das telas anteriores
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text || '#111827',
    marginTop: 10,
    marginBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
});