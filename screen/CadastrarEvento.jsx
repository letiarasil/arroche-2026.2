import React, { useState } from 'react';
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
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../constants/colors';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { createGuideTrail } from '../services/trailService';
import { uploadImageToStorage } from '../services/storageService';
import MenuGuia from '../components/MenuGuia';

export default function CadastrarEvento({ navigation }) {
  const { user, userProfile, guideProfile } = useAuth();
  const guideUid = auth.currentUser?.uid || user?.uid;
  const guideName = guideProfile?.name || userProfile?.name || 'Guia profissional';

  // Estados dos campos do formulário
  const [coverImageUri, setCoverImageUri] = useState(null);
  const [trailName, setTrailName] = useState('');
  const [description, setDescription] = useState('');
  const [departureLocation, setDepartureLocation] = useState('');
  const [date, setDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [galleryUris, setGalleryUris] = useState([]);
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');

  // Estados de controle e feedback
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');

  // Modais de Seleção de Data e Horário
  const [isDateModalVisible, setIsDateModalVisible] = useState(false);
  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);

  // --- SELEÇÃO DE IMAGENS DO DISPOSITIVO (EXPO-IMAGE-PICKER) ---

  // 1. Foto de Capa
  const handlePickCoverImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Permita o acesso à galeria para selecionar fotos da trilha.'
        );
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
      console.error('Erro ao abrir galeria:', err);
      Alert.alert('Erro', 'Não foi possível acessar a galeria de imagens.');
    }
  };

  // 2. Fotos Adicionais da Galeria
  const handlePickGalleryImages = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Permita o acesso à galeria para adicionar fotos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map((a) => a.uri);
        setGalleryUris((prev) => [...prev, ...newUris]);
      }
    } catch (err) {
      console.error('Erro ao adicionar fotos da galeria:', err);
      Alert.alert('Erro', 'Não foi possível selecionar fotos adicionais.');
    }
  };

  const handleRemoveGalleryImage = (index) => {
    setGalleryUris((prev) => prev.filter((_, i) => i !== index));
  };

  // --- TRATAMENTO DOS CAMPOS NUMÉRICOS, MÁSCARAS E VALIDAÇÕES ---

  // Distância: aceita somente números e decimais (ex: 1.5 ou 10)
  const handleDistanceChange = (text) => {
    // Permite dígitos e apenas um ponto ou vírgula
    const clean = text.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = clean.split('.');
    const formatted = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : clean;
    setDistanceKm(formatted);
  };

  // Duração Horas: aceita apenas números inteiros
  const handleDurationHoursChange = (text) => {
    setDurationHours(text.replace(/\D/g, '').slice(0, 2));
  };

  // Duração Minutos: aceita apenas números inteiros até 59
  const handleDurationMinutesChange = (text) => {
    const clean = text.replace(/\D/g, '').slice(0, 2);
    if (parseInt(clean, 10) > 59) {
      setDurationMinutes('59');
    } else {
      setDurationMinutes(clean);
    }
  };

  // Capacidade de Pessoas: aceita somente números inteiros
  const handleCapacityChange = (text) => {
    setCapacity(text.replace(/\D/g, ''));
  };

  // Valor por pessoa: aceita somente números e decimais
  const handlePriceChange = (text) => {
    const clean = text.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = clean.split('.');
    const formatted = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : clean;
    setPrice(formatted);
  };

  // Digitação manual com máscara de Data (DD/MM/AAAA)
  const handleDateManualChange = (text) => {
    const clean = text.replace(/\D/g, '').slice(0, 8);
    let formatted = clean;
    if (clean.length > 4) {
      formatted = `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4)}`;
    } else if (clean.length > 2) {
      formatted = `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    setDate(formatted);
  };

  // Digitação manual com máscara de Horário (HH:MM)
  const handleTimeManualChange = (text) => {
    const clean = text.replace(/\D/g, '').slice(0, 4);
    let formatted = clean;
    if (clean.length > 2) {
      formatted = `${clean.slice(0, 2)}:${clean.slice(2)}`;
    }
    setDepartureTime(formatted);
  };

  // --- SELETORES INTERATIVOS DE DATA E HORÁRIO ---

  // Gera dias do mês para o seletor visual de data
  const renderDatePickerOptions = () => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dayStr = String(d.getDate()).padStart(2, '0');
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const yearStr = d.getFullYear();
      const formatted = `${dayStr}/${monthStr}/${yearStr}`;
      
      const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      days.push({ formatted, label: `${weekday}, ${dayStr}/${monthStr}` });
    }

    return (
      <View style={styles.pickerGrid}>
        {days.map((item) => (
          <TouchableOpacity
            key={item.formatted}
            style={[
              styles.pickerOption,
              date === item.formatted && styles.pickerOptionSelected,
            ]}
            onPress={() => {
              setDate(item.formatted);
              setIsDateModalVisible(false);
            }}
          >
            <Text
              style={[
                styles.pickerOptionText,
                date === item.formatted && styles.pickerOptionTextSelected,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Horários comuns para o seletor visual de horário
  const renderTimePickerOptions = () => {
    const times = [
      '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
      '08:00', '08:30', '09:00', '14:00', '15:00', '16:00',
    ];

    return (
      <View style={styles.pickerGrid}>
        {times.map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.pickerOption,
              departureTime === t && styles.pickerOptionSelected,
            ]}
            onPress={() => {
              setDepartureTime(t);
              setIsTimeModalVisible(false);
            }}
          >
            <Text
              style={[
                styles.pickerOptionText,
                departureTime === t && styles.pickerOptionTextSelected,
              ]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // --- SUBMISSÃO E PERSISTÊNCIA NO FIREBASE STORAGE + FIRESTORE ---

  const handleCadastrar = async () => {
    if (isSaving) return;

    // 1. Validação de autenticação
    if (!guideUid) {
      Alert.alert(
        'Sessão expirada',
        'Não foi possível identificar o usuário autenticado. Por favor, faça login novamente.'
      );
      return;
    }

    // 2. Validações dos campos obrigatórios
    if (!coverImageUri) {
      Alert.alert('Foto Obrigatória', 'Por favor, selecione uma foto de capa para a trilha.');
      return;
    }

    if (!trailName.trim()) {
      Alert.alert('Campo Obrigatório', 'Informe o nome da trilha.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Campo Obrigatório', 'Informe a descrição da trilha.');
      return;
    }

    if (!departureLocation.trim()) {
      Alert.alert('Campo Obrigatório', 'Informe o local de saída.');
      return;
    }

    if (!date.trim() || date.trim().length < 8) {
      Alert.alert('Data Inválida', 'Informe uma data válida no formato DD/MM/AAAA.');
      return;
    }

    if (!departureTime.trim()) {
      Alert.alert('Horário Inválido', 'Informe o horário de saída no formato HH:MM.');
      return;
    }

    const capacityNum = parseInt(capacity, 10);
    if (!capacityNum || capacityNum <= 0) {
      Alert.alert('Capacidade Inválida', 'Informe a capacidade máxima de pessoas (apenas números inteiros maiores que zero).');
      return;
    }

    if (!price.trim()) {
      Alert.alert('Valor Obrigatório', 'Informe o valor por pessoa.');
      return;
    }

    setIsSaving(true);
    setUploadProgressText('Enviando foto de capa para o Firebase Storage...');

    try {
      // 3. Upload da Foto de Capa para o Firebase Storage
      const coverTimestamp = Date.now();
      const coverStoragePath = `trails/${guideUid}/cover_${coverTimestamp}.jpg`;
      const coverDownloadUrl = await uploadImageToStorage(coverImageUri, coverStoragePath);

      // 4. Upload das Fotos Adicionais da Galeria para o Storage
      const galleryDownloadUrls = [];
      if (galleryUris.length > 0) {
        setUploadProgressText(`Enviando ${galleryUris.length} fotos adicionais...`);
        for (let i = 0; i < galleryUris.length; i++) {
          const galleryStoragePath = `trails/${guideUid}/gallery_${coverTimestamp}_${i}.jpg`;
          const url = await uploadImageToStorage(galleryUris[i], galleryStoragePath);
          galleryDownloadUrls.push(url);
        }
      }

      // 5. Montagem dos dados formatados da trilha
      setUploadProgressText('Salvando dados da trilha no Cloud Firestore...');

      // Formata duração composta (ex: 2h 30min ou 45 min)
      let formattedDuration = '';
      if (durationHours && durationMinutes) {
        formattedDuration = `${durationHours}h ${durationMinutes}min`;
      } else if (durationHours) {
        formattedDuration = `${durationHours} hr${durationHours > 1 ? 's' : ''}`;
      } else if (durationMinutes) {
        formattedDuration = `${durationMinutes} min`;
      } else {
        formattedDuration = '22 min';
      }

      // Formata distância com unidade separada
      const formattedDistance = distanceKm ? `${distanceKm} km` : '1,5 km';

      // 6. Persistência no Cloud Firestore associando ao UID do guia
      await createGuideTrail(guideUid, {
        title: trailName.trim(),
        name: trailName.trim(),
        description: description.trim(),
        departureLocation: departureLocation.trim(),
        date: date.trim(),
        departureTime: departureTime.trim(),
        distance: formattedDistance,
        duration: formattedDuration,
        capacity: capacityNum,
        totalSpots: capacityNum,
        price: parseFloat(price) || 0.0,
        imageUrl: coverDownloadUrl,
        galleryUrls: galleryDownloadUrls,
        guideName,
      });

      // 7. Notificação de sucesso e redirecionamento para a Home do Guia
      Alert.alert(
        'Sucesso!',
        'Sua trilha foi cadastrada com sucesso e as imagens foram salvas no Firebase Storage.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation?.navigate('HomeGuia');
            },
          },
        ]
      );
    } catch (err) {
      console.error('Falha no cadastro do evento:', err);
      Alert.alert(
        'Erro ao Cadastrar',
        err?.message || 'Ocorreu um erro ao salvar os dados no Firebase. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setIsSaving(false);
      setUploadProgressText('');
    }
  };

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
        <Text style={styles.headerTitle}>Cadastrar Evento</Text>
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
          {/* SEÇÃO 1: Detalhes da Trilha */}
          <Text style={styles.sectionTitle}>Detalhes da Trilha</Text>

          {/* Foto de Capa do Dispositivo */}
          <Text style={styles.label}>Foto de Capa *</Text>
          {coverImageUri ? (
            <View style={styles.coverPreviewCard}>
              <Image source={{ uri: coverImageUri }} style={styles.coverPreviewImage} />
              <TouchableOpacity
                style={styles.coverChangeBtn}
                onPress={handlePickCoverImage}
                activeOpacity={0.8}
              >
                <Feather name="refresh-cw" size={14} color="#111827" />
                <Text style={styles.coverChangeText}>Trocar foto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.coverDeleteBtn}
                onPress={() => setCoverImageUri(null)}
                activeOpacity={0.8}
              >
                <Feather name="trash-2" size={15} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadBox}
              activeOpacity={0.8}
              onPress={handlePickCoverImage}
            >
              <View style={styles.uploadPlaceholder}>
                <Feather name="upload" size={18} color="#6B7280" />
                <Text style={styles.uploadText}>Enviar imagem do celular</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Nome da Trilha */}
          <Text style={styles.label}>Nome da Trilha *</Text>
          <TextInput
            style={styles.input}
            placeholder="Insira o nome da trilha"
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

          {/* Linha: Data e Horário de Saída */}
          <View style={styles.rowInputs}>
            {/* Campo Data */}
            <View style={styles.halfCol}>
              <Text style={styles.label}>Data *</Text>
              <View style={styles.inputWithIconContainer}>
                <TextInput
                  style={styles.inputInside}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#9CA3AF"
                  value={date}
                  onChangeText={handleDateManualChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <TouchableOpacity
                  style={styles.iconInsideBtn}
                  onPress={() => setIsDateModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Feather name="calendar" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Campo Horário de Saída */}
            <View style={styles.halfCol}>
              <Text style={styles.label}>Horário de Saída *</Text>
              <View style={styles.inputWithIconContainer}>
                <TextInput
                  style={styles.inputInside}
                  placeholder="00:00"
                  placeholderTextColor="#9CA3AF"
                  value={departureTime}
                  onChangeText={handleTimeManualChange}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TouchableOpacity
                  style={styles.iconInsideBtn}
                  onPress={() => setIsTimeModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Feather name="clock" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Linha: Distância e Duração */}
          <View style={styles.rowInputs}>
            {/* Campo Distância (Apenas números e decimais com km fixo) */}
            <View style={styles.halfCol}>
              <Text style={styles.label}>Distância</Text>
              <View style={styles.inputWithUnitContainer}>
                <TextInput
                  style={styles.inputInside}
                  placeholder="0.0"
                  placeholderTextColor="#9CA3AF"
                  value={distanceKm}
                  onChangeText={handleDistanceChange}
                  keyboardType="decimal-pad"
                />
                <View style={styles.unitBadge}>
                  <Text style={styles.unitBadgeText}>km</Text>
                </View>
              </View>
            </View>

            {/* Campo Duração (Apenas números separados por h e min) */}
            <View style={styles.halfCol}>
              <Text style={styles.label}>Duração</Text>
              <View style={styles.durationRowContainer}>
                <View style={styles.durationInputPart}>
                  <TextInput
                    style={styles.durationInput}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    value={durationHours}
                    onChangeText={handleDurationHoursChange}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <Text style={styles.durationUnitText}>h</Text>
                </View>

                <View style={styles.durationInputPart}>
                  <TextInput
                    style={styles.durationInput}
                    placeholder="00"
                    placeholderTextColor="#9CA3AF"
                    value={durationMinutes}
                    onChangeText={handleDurationMinutesChange}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <Text style={styles.durationUnitText}>min</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Imagens Adicionais da Trilha */}
          <Text style={styles.label}>Imagens da Trilha</Text>
          <TouchableOpacity
            style={styles.uploadBox}
            activeOpacity={0.8}
            onPress={handlePickGalleryImages}
          >
            <View style={styles.uploadPlaceholder}>
              <Feather name="image" size={18} color="#6B7280" />
              <Text style={styles.uploadText}>
                {galleryUris.length > 0
                  ? `Adicionar mais imagens (${galleryUris.length} selecionada${galleryUris.length > 1 ? 's' : ''})`
                  : 'Adicionar imagens da galeria'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Grade de Pré-visualização das Imagens Adicionais com opção de remover */}
          {galleryUris.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryPreviewRow}
            >
              {galleryUris.map((uri, index) => (
                <View key={`${uri}_${index}`} style={styles.galleryThumbWrapper}>
                  <Image source={{ uri }} style={styles.galleryThumbImage} />
                  <TouchableOpacity
                    style={styles.galleryThumbDeleteBtn}
                    onPress={() => handleRemoveGalleryImage(index)}
                    activeOpacity={0.8}
                  >
                    <Feather name="x" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* SEÇÃO 2: Detalhes das Inscrições */}
          <Text style={[styles.sectionTitle, { marginTop: 22 }]}>
            Detalhes das Inscrições
          </Text>

          <View style={styles.rowInputs}>
            {/* Capacidade de Pessoas (Apenas inteiros) */}
            <View style={styles.halfCol}>
              <Text style={styles.label}>Capacidade de Pessoas *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 12"
                placeholderTextColor="#9CA3AF"
                value={capacity}
                onChangeText={handleCapacityChange}
                keyboardType="number-pad"
              />
            </View>

            {/* Valor por pessoa (Apenas números com R$ fixo) */}
            <View style={styles.halfCol}>
              <Text style={styles.label}>Valor por pessoa *</Text>
              <View style={styles.inputWithCurrencyContainer}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  style={styles.inputInsideCurrency}
                  placeholder="0,00"
                  placeholderTextColor="#9CA3AF"
                  value={price}
                  onChangeText={handlePriceChange}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          {/* Indicador de progresso do upload */}
          {isSaving && uploadProgressText ? (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.progressText}>{uploadProgressText}</Text>
            </View>
          ) : null}

          {/* Botão Cadastrar Evento */}
          <TouchableOpacity
            style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
            activeOpacity={0.88}
            onPress={handleCadastrar}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Cadastrar Evento</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Menu Inferior Fixo do Guia */}
      <MenuGuia activeTab="Trilhas" navigation={navigation} />

      {/* MODAL: Seletor de Data */}
      <Modal
        visible={isDateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Data</Text>
              <TouchableOpacity onPress={() => setIsDateModalVisible(false)}>
                <Feather name="x" size={22} color="#111827" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {renderDatePickerOptions()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL: Seletor de Horário */}
      <Modal
        visible={isTimeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTimeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o Horário de Saída</Text>
              <TouchableOpacity onPress={() => setIsTimeModalVisible(false)}>
                <Feather name="x" size={22} color="#111827" />
              </TouchableOpacity>
            </View>
            {renderTimePickerOptions()}
          </View>
        </View>
      </Modal>
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
  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 48,
    justifyContent: 'center',
  },
  uploadPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 13.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  coverPreviewCard: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
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
  coverDeleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  inputWithIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    height: 48,
    paddingLeft: 14,
    paddingRight: 6,
  },
  inputInside: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#111827',
  },
  iconInsideBtn: {
    padding: 8,
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
  durationRowContainer: {
    flexDirection: 'row',
    gap: 6,
    height: 48,
  },
  durationInputPart: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  durationInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
  },
  durationUnitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 2,
  },
  galleryPreviewRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  galleryThumbWrapper: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  galleryThumbImage: {
    width: '100%',
    height: '100%',
  },
  galleryThumbDeleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  progressText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pickerOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  pickerOptionTextSelected: {
    color: '#FFFFFF',
  },
});
