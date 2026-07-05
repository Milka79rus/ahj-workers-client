import crypto from 'crypto-js';

self.addEventListener('message', async (event) => {
  const { file, algorithm } = event.data;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const wordArray = crypto.lib.WordArray.create(arrayBuffer);
    let hash = '';

    if (algorithm === 'MD5') hash = crypto.MD5(wordArray).toString(crypto.enc.Hex);
    else if (algorithm === 'SHA1') hash = crypto.SHA1(wordArray).toString(crypto.enc.Hex);
    else if (algorithm === 'SHA256') hash = crypto.SHA256(wordArray).toString(crypto.enc.Hex);
    else if (algorithm === 'SHA512') hash = crypto.SHA512(wordArray).toString(crypto.enc.Hex);

    self.postMessage({ status: 'success', hash, fileName: file.name });
  } catch (error) {
    self.postMessage({ status: 'error', error: error.message });
  }
});
