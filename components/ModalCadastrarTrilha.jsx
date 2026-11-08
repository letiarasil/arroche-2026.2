import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { TRAIL_IMAGES } from '../services/trailImages';

const IMAGE_OPTIONS = [
  { key: 'lemos', label: 'Trilha do Lemos', source: TRAIL_IMAGES.lemos },
  { key: 'pedra-cruzeiro', label: 'Pedra do Cruzeiro', source: TRAIL_IMAGES['pedra-cruzeiro'] },
  { key: 'vale-perdido', label: 'Vale Perdido', source: TRAIL_IMAGES['vale-perdido'] },
  { key: 'cabeca-bruxa', label: 'Cabeça da Bruxa', source: TRAIL_IMAGES['cabeca-bruxa'] },
];

const DIFFICULTIES = ['Fácil', 'Médio', 'Difícil'];

export default function ModalCadastrarTrilha({ visible, onClose, onSave, guideName }) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Fácil');
  const [duration, setDuration] = useState('1 hr');
  const [distance, setDistance] = useState('2km');
  const [departureLocation, setDepartureLocation] = useState('Quixadá/CE');
  const [selectedImageKey, setSelectedImageKey] = useState('lemos');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDifficulty('Fácil');
    setDuration('1 hr');
    setDistance('2km');
    setDepartureLocation('Quixadá/CE');
    setSelectedImageKey('lemos');
    setDescription('');
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Campo Obrigatório', 'Por favor, informe o nome da trilha.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave?.({
        title: title.trim(),
        difficulty,
        duration: duration.trim() || '1 hr',
        distance: distance.trim() || '2km',
        departureLocation: departureLocation.trim() || 'Quixadá/CE',
        imageKey: selectedImageKey,
        description: description.trim() || 'Trilha cadastrada no Arroche.',
        guideName: guideName || 'Guia',
      });
      resetForm();
    } catch (err) {
      Alert.alert('Erro ao Salvar', err?.message || 'Não foi possível cadastrar a trilha.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalCard}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Cadastrar Nova Trilha</Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7} style={styles.closeBtn}>
              <Feather name="x" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Nome da Trilha */}
            <Text style={styles.label}>Nome da Trilha *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Trilha do Lemos"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />

            {/* Dificuldade */}
            <Text style={styles.label}>Dificuldade</Text>
            <View style={styles.pillsRow}>
              {DIFFICULTIES.map((diff) => {
                const isSelected = difficulty === diff;
                return (
                  <TouchableOpacity
                    key={diff}
                    style={[styles.diffPill, isSelected && styles.diffPillActive]}
                    onPress={() => setDifficulty(diff)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.diffPillText, isSelected && styles.diffPillTextActive]}>
                      {diff}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Duração e Distância */}
            <View style={styles.rowInputs}>
              <View style={styles.halfInputCol}>
                <Text style={styles.label}>Duração estimada</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 1 hr"
                  placeholderTextColor="#9CA3AF"
                  value={duration}
                  onChangeText={setDuration}
                />
              </View>
              <View style={styles.halfInputCol}>
                <Text style={styles.label}>Distância</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 2km"
                  placeholderTextColor="#9CA3AF"
                  value={distance}
                  onChangeText={setDistance}
                />
              </View>
            </View>

            {/* Local de Saída */}
            <Text style={styles.label}>Local de Saída / Ponto de Encontro</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Praça Central - Quixadá/CE"
              placeholderTextColor="#9CA3AF"
              value={departureLocation}
              onChangeText={setDepartureLocation}
            />

            {/* Escolha da Foto da Trilha */}
            <Text style={styles.label}>Foto de Capa</Text>
            <View style={styles.imageSelectorGrid}>
              {IMAGE_OPTIONS.map((img) => {
                const isSelected = selectedImageKey === img.key;
                return (
                  <TouchableOpacity
                    key={img.key}
                    style={[styles.imageOptionCard, isSelected && styles.imageOptionActive]}
                    onPress={() => setSelectedImageKey(img.key)}
                    activeOpacity={0.8}
                  >
                    <Image source={img.source} style={styles.imageThumb} />
                    <Text style={styles.imageOptionText} numberOfLines={1}>
                      {img.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Feather name="check" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Descrição */}
            <Text style={styles.label}>Descrição e Recomendações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva o percurso, o que esperar da trilha e itens recomendados..."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {/* Botão de Envio */}
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar e Publicar Trilha</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    height: 75,
    textAlignVertical: 'top',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  diffPill: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  diffPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  diffPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  diffPillTextActive: {
    color: '#FFFFFF',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInputCol: {
    flex: 1,
  },
  imageSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageOptionCard: {
    width: '47%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FAF9F6',
    paddingBottom: 6,
  },
  imageOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDF4',
  },
  imageThumb: {
    width: '100%',
    height: 70,
  },
  imageOptionText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 6,
    paddingTop: 4,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
