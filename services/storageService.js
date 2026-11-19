import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const withTimeout = (promise, ms, label) => {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} excedeu ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
};

function uriToBlob(uri) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (!xhr.response) {
        reject(new Error('Resposta vazia ao ler o arquivo local'));
        return;
      }
      resolve(xhr.response);
    };
    xhr.onerror = () => reject(new Error('Falha ao ler arquivo local para Blob'));
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}

/**
 * Faz upload de uma imagem local para o Firebase Storage e retorna a URL pública (https://).
 * Lança erro em caso de falha ou timeout, impedindo que caminhos locais (file://) sejam salvos.
 *
 * @param {string | null | undefined} localUri
 * @param {string} destinationPath
 * @returns {Promise<string | null>}
 */
export async function uploadImageToStorage(localUri, destinationPath) {
  if (!localUri) {
    return null;
  }

  if (typeof localUri !== 'string') {
    throw new Error('URI de imagem inválida');
  }

  // Se já for uma URL pública HTTP/HTTPS, não precisa fazer novo upload
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return localUri;
  }

  if (!destinationPath) {
    throw new Error('Caminho de destino no Firebase Storage não informado');
  }

  const blob = await withTimeout(uriToBlob(localUri), 10000, 'Leitura da imagem');

  if (typeof blob.size === 'number' && blob.size === 0) {
    if (blob && typeof blob.close === 'function') {
      blob.close();
    }
    throw new Error('O arquivo de imagem selecionado está vazio (0 bytes)');
  }

  try {
    const storageRef = ref(storage, destinationPath);
    const metadata = {
      contentType:
        typeof blob.type === 'string' && blob.type.startsWith('image/')
          ? blob.type
          : 'image/jpeg',
    };

    await withTimeout(
      uploadBytes(storageRef, blob, metadata),
      20000,
      'Upload no Firebase Storage'
    );

    const downloadURL = await withTimeout(
      getDownloadURL(storageRef),
      10000,
      'Obtenção da URL pública'
    );

    if (!downloadURL || !downloadURL.startsWith('https://')) {
      throw new Error('URL pública inválida retornada pelo Firebase Storage');
    }

    return downloadURL;
  } catch (error) {
    console.error('Erro no uploadImageToStorage:', {
      code: error?.code,
      message: error?.message,
      serverResponse: error?.customData?.serverResponse,
      destinationPath,
    });
    throw error;
  } finally {
    if (blob && typeof blob.close === 'function') {
      blob.close();
    }
  }
}