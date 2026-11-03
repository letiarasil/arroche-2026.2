// Mapeamento centralizado de imagens de trilhas para suportar tanto referências do banco quanto assets locais
export const TRAIL_IMAGES = {
  lemos: require('../assets/trilhas/lemos.jpg'),
  'pedra-cruzeiro': require('../assets/trilhas/pedra-cruzeiro.jpg'),
  'vale-perdido': require('../assets/trilhas/vale-perdido.jpg'),
  'cabeca-bruxa': require('../assets/trilhas/cabeca-bruxa.jpg'),
  default: require('../assets/trilhas/lemos.jpg'),
};

/**
 * Resolve a imagem de uma trilha recebida do banco de dados ou do mock.
 * Aceita:
 * - Objeto require (number em React Native)
 * - Nome da chave (ex: 'lemos', 'vale-perdido')
 * - URL remota (string começando com http)
 */
export function resolveTrailImage(img) {
  if (!img) return TRAIL_IMAGES.default;

  // Se já for require local
  if (typeof img === 'number' || (typeof img === 'object' && img.uri)) {
    return img;
  }

  // Se for URL web
  if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
    return { uri: img };
  }

  // Se for chave conhecida
  if (typeof img === 'string') {
    const cleanKey = img.toLowerCase().replace('.jpg', '').replace('.png', '').trim();
    if (TRAIL_IMAGES[cleanKey]) {
      return TRAIL_IMAGES[cleanKey];
    }
  }

  return TRAIL_IMAGES.default;
}

