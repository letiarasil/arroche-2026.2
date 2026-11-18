// Mapeamento centralizado de imagens de trilhas para suportar tanto referências do banco quanto assets locais
let lemosAsset = { uri: 'https://images.unsplash.com/photo-1551632811-561732d1e306' };
let cruzeiroAsset = { uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' };
let valeAsset = { uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' };
let bruxaAsset = { uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba' };

try {
  lemosAsset = require('../assets/trilhas/lemos.jpg');
  cruzeiroAsset = require('../assets/trilhas/pedra-cruzeiro.jpg');
  valeAsset = require('../assets/trilhas/vale-perdido.jpg');
  bruxaAsset = require('../assets/trilhas/cabeca-bruxa.jpg');
} catch (_e) {}

export const TRAIL_IMAGES = {
  lemos: lemosAsset,
  'pedra-cruzeiro': cruzeiroAsset,
  'vale-perdido': valeAsset,
  'cabeca-bruxa': bruxaAsset,
  default: lemosAsset,
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

  // Se já for require local (number) ou objeto com uri
  if (typeof img === 'number' || (typeof img === 'object' && img.uri)) {
    return img;
  }

  if (typeof img === 'string') {
    const trimmed = img.trim();
    if (!trimmed) return TRAIL_IMAGES.default;

    // Se for URL web, file URI, content URI, base64 data URI ou caminho com barras
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('file:') ||
      trimmed.startsWith('content:') ||
      trimmed.startsWith('ph:') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('/') ||
      trimmed.includes('/') ||
      trimmed.includes('\\')
    ) {
      return { uri: trimmed };
    }

    const cleanKey = trimmed.toLowerCase().replace('.jpg', '').replace('.png', '').trim();
    if (TRAIL_IMAGES[cleanKey]) {
      return TRAIL_IMAGES[cleanKey];
    }
  }

  return TRAIL_IMAGES.default;
}

