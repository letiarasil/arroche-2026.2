import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Faz upload de uma imagem do dispositivo para o Firebase Storage
 * e retorna a URL permanente pública gerada.
 *
 * @param {string} localUri - Caminho do arquivo no dispositivo (file://... ou content://...)
 * @param {string} destinationPath - Caminho no Storage (ex: 'trails/{uid}/cover_{timestamp}.jpg')
 * @returns {Promise<string>} Download URL do Firebase Storage
 */
export async function uploadImageToStorage(localUri, destinationPath) {
  if (!localUri) throw new Error('URI local não informada');

  // Se já for URL web externa (http ou https), não precisa fazer upload
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return localUri;
  }

  try {
    const response = await fetch(localUri);
    const blob = await response.blob();
    const storageRef = ref(storage, destinationPath);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.warn('Aviso: Falha no upload para o Firebase Storage, utilizando URI local como fallback:', error?.message || error);
    return localUri;
  }
}
