import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export default function TrailCard({ item, isSaved, fullWidth = false, onToggleSave, onPressVerMais }) {
  const imageSource =
    typeof item.image === 'string'
      ? { uri: item.image }
      : item.image || { uri: 'https://via.placeholder.com/400x200' };

  return (
    <View style={[styles.card, fullWidth && styles.cardFullWidth]}>
      <View style={[styles.imageContainer, fullWidth && styles.imageContainerFullWidth]}>
        <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />

        <TouchableOpacity
          style={[styles.bookmarkButton, isSaved && styles.bookmarkButtonActive]}
          onPress={() => onToggleSave?.(item.id)}
          activeOpacity={0.8}
        >
          <FontAwesome
            name={isSaved ? 'bookmark' : 'bookmark-o'}
            size={16}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* Container interno com padding quando o card está em modo fullWidth */}
      <View style={fullWidth ? styles.cardDetailsContainer : null}>
        <View style={styles.cardMeta}>
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
          {item.rating && (
            <View style={styles.ratingBox}>
              <FontAwesome name="star" size={12} color="#111827" />
              <Text style={styles.ratingText}>
                {item.rating} {item.reviews ? `(${item.reviews})` : ''}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title || item.name}
        </Text>
        <Text style={styles.cardAuthor}>{item.author || item.guideName || 'Autor desconhecido'}</Text>
        <Text style={styles.cardInfo}>
          {item.time || item.duration || 'N/A'} · {item.distance || 'N/A'}
        </Text>

        <TouchableOpacity
          style={styles.verMaisButton}
          activeOpacity={0.7}
          onPress={() => onPressVerMais?.(item)}
        >
          <Text style={styles.verMaisText}>Ver mais</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    marginRight: 16,
    marginBottom: 16,
  },
  // Estilo com Sombra e Card destacado para a coluna da tela de Salvos
  cardFullWidth: {
    width: '100%',
    marginRight: 0,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    // Sombra para iOS
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Sombra para Android
    elevation: 3,
    // Linha/Borda inferior sutil para refinar a separação
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardDetailsContainer: {
    paddingHorizontal: 4,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  imageContainerFullWidth: {
    height: 180,
    borderRadius: 12,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkButtonActive: {
    backgroundColor: colors.primary || '#2e7d32',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  difficultyText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  cardAuthor: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  cardInfo: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  verMaisButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.primary || '#2e7d32',
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#F7FAF8',
  },
  verMaisText: {
    color: colors.primary || '#2e7d32',
    fontSize: 13,
    fontWeight: '600',
  },
});