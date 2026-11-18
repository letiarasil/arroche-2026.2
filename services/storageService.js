import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Função auxiliar para garantir que o upload não trave a aplicação
 * caso o Firebase Storage esteja offline, bloqueado por regras ou lento.
 */
const withStorageTimeout = (promise, ms = 2500) => {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Storage timeout')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
};

/**
 * Faz upload de uma imagem do dispositivo para o Firebase Storage
 * e retorna a URL permanente pública gerada.
 * Se houver lentidão, erro de regras ou rede, retorna imediatamente o URI local como fallback seguro.
 *
 * @param {string} localUri - Caminho do arquivo no dispositivo (file://... ou content://...)
 * @param {string} destinationPath - Caminho no Storage (ex: 'trails/{uid}/cover_{timestamp}.jpg')
 * @returns {Promise<string>} Download URL do Firebase Storage ou o URI local
 */
export async function uploadImageToStorage(localUri, destinationPath) {
  if (!localUri) return null;

  // Se já for URL web externa (http ou https), não precisa fazer upload
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return localUri;
  }

  try {
    const response = await withStorageTimeout(fetch(localUri), 2500);
    const blob = await withStorageTimeout(response.blob(), 2500);
    const storageRef = ref(storage, destinationPath);

    await withStorageTimeout(uploadBytes(storageRef, blob), 3000);
    const downloadURL = await withStorageTimeout(getDownloadURL(storageRef), 2500);
    return downloadURL;
  } catch (error) {
    console.warn('Aviso: Falha ou tempo limite no upload para o Storage, utilizando URI local como fallback:', error?.message || error);
    return localUri;
  }
}
