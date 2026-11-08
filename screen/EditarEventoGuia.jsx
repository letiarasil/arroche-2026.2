import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../constants/colors';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { updateGuideTrail, getTrailById } from '../services/trailService';
import { uploadImageToStorage } from '../services/storageService';
import { resolveTrailImage } from '../services/trailImages';
import MenuGuia from '../components/MenuGuia';

export default function EditarEventoGuia({ navigation, route }) {
  const { user } = useAuth();
  const guideUid = auth.currentUser?.uid || user?.uid;

  const initialItem = route?.params?.item;
  const trailId = route?.params?.trailId || initialItem?.id;

  const [coverImageUri, setCoverImageUri] = useState(null);
  const [trailName, setTrailName] = useState(initialItem?.title || initialItem?.name || '');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [departureLocation, setDepartureLocation] = useState(initialItem?.departureLocation || '');
  const [date, setDate] = useState(initialItem?.date || '');
  const [departureTime, setDepartureTime] = useState(initialItem?.departureTime || '');
  const [distanceKm, setDistanceKm] = useState(
    initialItem?.distance ? String(initialItem.distance).replace('km', '').trim() : ''
  );
  const [duration, setDuration] = useState(initialItem?.duration || '');
  const [capacity, setCapacity] = useState(String(initialItem?.capacity || initialItem?.totalSpots || '12'));
  const [price, setPrice] = useState(String(initialItem?.price || '10.00'));

  const [isSaving, setIsSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(!initialItem);

  const [isDateModalVisible, setIsDateModalVisible] = useState(false);
  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!initialItem && trailId) {
        setLoadingInitial(true);
        try {
          const fetched = await getTrailById(trailId);
          if (fetched) {
            setTrailName(fetched.title || fetched.name || '');
            setDescription(fetched.description || '');
            setDepartureLocation(fetched.departureLocation || '');
            setDate(fetched.date || '');
            setDepartureTime(fetched.departureTime || '');
            setDistanceKm(fetched.distance ? String(fetched.distance).replace('km', '').trim() : '');
            setDuration(fetched.duration || '');
            setCapacity(String(fetched.capacity || fetched.totalSpots || '12'));
            setPrice(String(fetched.price || '10.00'));
            if (fetched.imageUrl) {
              setCoverImageUri(fetched.imageUrl);
            }
          }
        } catch (_e) {
        } finally {
          setLoadingInitial(false);
        }
      } else if (initialItem?.imageUrl) {
        setCoverImageUri(initialItem.imageUrl);
      }
    }
    loadData();
  }, [trailId, initialItem]);

  const handlePickCoverImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissão necessária', 'Permita o acesso à galeria para alterar a foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCoverImageUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível acessar a galeria de imagens.');
    }
  };

  const handleSalvarEdicao = async () => {
    if (!trailName.trim()) {
      Alert.alert('Campo Obrigatório', 'Informe o nome da trilha.');
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = coverImageUri;

      // Se a imagem for um arquivo local novo do dispositivo, faz o upload para o Storage
      if (coverImageUri && !coverImageUri.startsWith('http://') && !coverImageUri.startsWith('https://')) {
        const coverPath = `trails/${guideUid}/cover_${Date.now()}.jpg`;
        finalImageUrl = await uploadImageToStorage(coverImageUri, coverPath);
      }

      const formattedDistance = distanceKm ? `${distanceKm} km` : distanceKm;

      await updateGuideTrail(trailId, guideUid, {
        title: trailName.trim(),
        name: trailName.trim(),
        description: description.trim(),
        departureLocation: departureLocation.trim(),
        date: date.trim(),
        departureTime: departureTime.trim(),
        distance: formattedDistance,
        duration: duration.trim(),
        capacity: parseInt(capacity.replace(/\D/g, ''), 10) || 12,
        totalSpots: parseInt(capacity.replace(/\D/g, ''), 10) || 12,
        price: parseFloat(price.replace('R$', '').replace(',', '.').trim()) || 0.0,
        imageUrl: finalImageUrl,
      });

      Alert.alert('Sucesso', 'Informações da trilha atualizadas com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            if (navigation?.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('HomeGuia');
            }
          },
        },
      ]);
    } catch (err) {
      console.error('Erro ao atualizar trilha:', err);
      Alert.alert('Erro', err?.message || 'Não foi possível atualizar a trilha.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Evento</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Detalhes da Trilha</Text>

          {/* Foto de Capa */}
          <Text style={styles.label}>Foto de Capa</Text>
          <TouchableOpacity
            style={styles.coverPreviewCard}
            activeOpacity={0.8}
            onPress={handlePickCoverImage}
          >
            {coverImageUri ? (
              <Image
                source={
                  coverImageUri.startsWith('http') || coverImageUri.startsWith('file:')
                    ? { uri: coverImageUri }
                    : resolveTrailImage(coverImageUri)
                }
                style={styles.coverPreviewImage}
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Feather name="upload" size={18} color="#6B7280" />
                <Text style={styles.uploadText}>Selecionar foto da galeria</Text>
              </View>
            )}
            <View style={styles.coverChangeBtn}>
              <Feather name="refresh-cw" size={14} color="#111827" />
              <Text style={styles.coverChangeText}>Trocar foto</Text>
            </View>
          </TouchableOpacity>

          {/* Nome da Trilha */}
          <Text style={styles.label}>Nome da Trilha *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome da Trilha"
            placeholderTextColor="#9CA3AF"
            value={trailName}
            onChangeText={setTrailName}
          />

          {/* Descrição */}
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Insira a descrição"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          {/* Local de Saída */}
          <Text style={styles.label}>Local de Saída *</Text>
          <TextInput
            style={styles.input}
            placeholder="Insira um local"
            placeholderTextColor="#9CA3AF"
            value={departureLocation}
            onChangeText={setDepartureLocation}
          />

          {/* Linha Data e Horário */}
          <View style={styles.rowInputs}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Data *</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9CA3AF"
                value={date}
                onChangeText={(text) => {
                  const clean = text.replace(/\D/g, '').slice(0, 8);
                  let formatted = clean;
                  if (clean.length > 4) {
                    formatted = `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4)}`;
                  } else if (clean.length > 2) {
                    formatted = `${clean.slice(0, 2)}/${clean.slice(2)}`;
                  }
                  setDate(formatted);
                }}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.halfCol}>
              <Text style={styles.label}>Horário de Saída *</Text>
              <TextInput
                style={styles.input}
                placeholder="00:00"
                placeholderTextColor="#9CA3AF"
                value={departureTime}
                onChangeText={(text) => {
                  const clean = text.replace(/\D/g, '').slice(0, 4);
                  let formatted = clean;
                  if (clean.length > 2) {
                    formatted = `${clean.slice(0, 2)}:${clean.slice(2)}`;
                  }
                  setDepartureTime(formatted);
                }}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Linha Distância e Duração */}
          <View style={styles.rowInputs}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Distância</Text>
              <View style={styles.inputWithUnitContainer}>
                <TextInput
                  style={styles.inputInside}
                  placeholder="0.0"
                  placeholderTextColor="#9CA3AF"
                  value={distanceKm}
                  onChangeText={(text) => {
                    const clean = text.replace(/[^0-9.,]/g, '').replace(',', '.');
                    setDistanceKm(clean);
                  }}
                  keyboardType="decimal-pad"
                />
                <View style={styles.unitBadge}>
                  <Text style={styles.unitBadgeText}>km</Text>
                </View>
              </View>
            </View>

            <View style={styles.halfCol}>
              <Text style={styles.label}>Duração</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 22 min ou 2h"
                placeholderTextColor="#9CA3AF"
                value={duration}
                onChangeText={setDuration}
              />
            </View>
          </View>

          {/* SEÇÃO 2: Detalhes das Inscrições */}
          <Text style={[styles.sectionTitle, { marginTop: 22 }]}>
            Detalhes das Inscrições
          </Text>

          <View style={styles.rowInputs}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Capacidade de Pessoas *</Text>
              <TextInput
                style={styles.input}
                placeholder="12"
                placeholderTextColor="#9CA3AF"
                value={capacity}
                onChangeText={(text) => setCapacity(text.replace(/\D/g, ''))}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.halfCol}>
              <Text style={styles.label}>Valor por pessoa *</Text>
              <View style={styles.inputWithCurrencyContainer}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  style={styles.inputInsideCurrency}
                  placeholder="0,00"
                  placeholderTextColor="#9CA3AF"
                  value={price}
                  onChangeText={(text) => {
                    const clean = text.replace(/[^0-9.,]/g, '').replace(',', '.');
                    setPrice(clean);
                  }}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          {/* Botão Salvar Alterações */}
          <TouchableOpacity
            style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
            activeOpacity={0.88}
            onPress={handleSalvarEdicao}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <MenuGuia activeTab="Trilhas" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    height: 72,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  coverPreviewCard: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
  },
  coverPreviewImage: {
    width: '100%',
    height: '100%',
  },
  coverChangeBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  coverChangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  uploadPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 13.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  inputWithUnitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    height: 48,
    paddingLeft: 14,
    paddingRight: 10,
  },
  inputInside: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#111827',
  },
  unitBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unitBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  inputWithCurrencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    height: 48,
    paddingLeft: 14,
  },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginRight: 6,
  },
  inputInsideCurrency: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#111827',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
