import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export default function TrailCard({ item, isSaved, onToggleSave, onPressVerMais }) {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.cardImage} />
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={() => onToggleSave?.(item.id)}
          activeOpacity={0.8}
        >
          <Feather
            name="bookmark"
            size={16}
            color={isSaved ? colors.primary : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardMeta}>
        <Text style={styles.difficultyText}>{item.difficulty}</Text>
        <View style={styles.ratingBox}>
          <FontAwesome name="star" size={12} color="#111827" />
          <Text style={styles.ratingText}>
            {item.rating} ({item.reviews})
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.cardAuthor}>{item.author}</Text>
      <Text style={styles.cardInfo}>
        {item.time} · {item.distance}
      </Text>

      <TouchableOpacity
        style={styles.verMaisButton}
        activeOpacity={0.7}
        onPress={() => onPressVerMais?.(item)}
      >
        <Text style={styles.verMaisText}>Ver mais</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    marginRight: 16,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  cardAuthor: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  cardInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  verMaisButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: '#F7FAF8',
  },
  verMaisText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
