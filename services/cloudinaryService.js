const CLOUDINARY_CLOUD_NAME = 'nc6ny1z7';
const CLOUDINARY_UPLOAD_PRESET = 'arroche';

/**
 * Envia uma imagem local (file:// ou content://) para o Cloudinary
 * e retorna a URL segura pública (https://).
 * Lança erro se falhar, impedindo salvar caminhos locais no Firestore.
 */
function uriToDataUrl(localUri) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.onload = function () {
      const blob = xhr.response;
      if (!blob) {
        reject(new Error('Não foi possível ler o arquivo local da imagem.'));
        return;
      }

      const reader = new FileReader();

      reader.onloadend = function () {
        if (typeof reader.result === 'string' && reader.result.startsWith('data:')) {
          resolve(reader.result);
        } else {
          reject(new Error('Falha ao converter imagem para base64.'));
        }

        if (typeof blob.close === 'function') {
          blob.close();
        }
      };

      reader.onerror = function () {
        if (typeof blob.close === 'function') {
          blob.close();
        }
        reject(new Error('Falha ao ler o conteúdo da imagem.'));
      };

      reader.readAsDataURL(blob);
    };

    xhr.onerror = function () {
      reject(new Error('Falha ao acessar o URI local da imagem.'));
    };

    xhr.responseType = 'blob';
    xhr.open('GET', localUri, true);
    xhr.send(null);
  });
}

/**
 * Envia uma imagem local (file:// ou content://) para o Cloudinary em base64
 * e retorna a URL segura pública (https://).
 */
export async function uploadImageToCloudinary(localUri, folder = 'arroche/trails') {
  if (!localUri) {
    return null;
  }

  if (typeof localUri !== 'string') {
    throw new Error('URI de imagem inválida.');
  }

  // Já é uma URL remota HTTP/HTTPS
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return localUri;
  }

  // Já é uma chave pré-cadastrada (ex.: "cabeca-bruxa")
  if (!localUri.startsWith('file://') && !localUri.startsWith('content://')) {
    return localUri;
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      'Configure CLOUDINARY_CLOUD_NAME e CLOUDINARY_UPLOAD_PRESET em cloudinaryService.js.'
    );
  }

  const dataUrl = await uriToDataUrl(localUri);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const payload = {
    file: dataUrl,
    upload_preset: CLOUDINARY_UPLOAD_PRESET,
  };

  if (folder) {
    payload.folder = folder;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data?.secure_url) {
    const errorMessage = data?.error?.message || 'Falha ao enviar imagem para o Cloudinary.';
    throw new Error(errorMessage);
  }

  return data.secure_url;
}