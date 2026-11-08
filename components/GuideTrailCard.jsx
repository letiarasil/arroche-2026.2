import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');
// Calcula largura para grade de 2 colunas com padding
const CARD_WIDTH = (width - 48) / 2;

export default function GuideTrailCard({ item, onEdit, onPress }) {
  const imageSource =
    typeof item.image === 'string'
      ? { uri: item.image }
      : item.image || { uri: 'https://via.placeholder.com/400x200' };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => onPress?.(item)}
    >
      {/* Contêiner da Imagem */}
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />

        {/* Ícone de marcador no canto superior direito */}
        <View style={styles.bookmarkBadge}>
          <FontAwesome name="bookmark-o" size={14} color="#FFFFFF" />
        </View>
      </View>

      {/* Detalhes da Trilha */}
      <View style={styles.cardDetails}>
        {/* Metadados: Dificuldade e Avaliação */}
        <View style={styles.metaRow}>
          <Text style={styles.difficultyText}>{item.difficulty || 'Fácil'}</Text>

          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={11} color="#111827" />
            <Text style={styles.ratingText}>
              {item.rating ? Number(item.rating).toFixed(1) : '4.5'}
              <Text style={styles.reviewsText}>
                {' '}({item.reviews || 90})
              </Text>
            </Text>
          </View>
        </View>

        {/* Título da Trilha */}
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title || item.name}
        </Text>

        {/* Nome do Guia */}
        <Text style={styles.guideName} numberOfLines={1}>
          {item.guideName || item.author || 'Guia'}
        </Text>

        {/* Tempo e Distância */}
        <Text style={styles.timeDistance} numberOfLines={1}>
          {item.time || item.duration || '1 hr'} - {item.distance || '2km'}
        </Text>

        {/* Botão Editar */}
        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.75}
          onPress={(e) => {
            e.stopPropagation?.();
            onEdit?.(item);
          }}
        >
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 125,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  bookmarkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDetails: {
    padding: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 11.5,
    color: '#4B5563',
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11.5,
    color: '#111827',
    fontWeight: '600',
  },
  reviewsText: {
    color: '#6B7280',
    fontWeight: '400',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  guideName: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
  },
  timeDistance: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 8,
  },
  editButton: {
    width: '100%',
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#EEF5F0',
    borderWidth: 1,
    borderColor: colors.primary || '#264A31',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  editText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary || '#264A31',
  },
});
