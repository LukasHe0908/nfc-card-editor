import CryptoJS from 'crypto-js';

const key = CryptoJS.enc.Utf8.parse('ri7y1lhoZwyKjons');
const iv = CryptoJS.enc.Utf8.parse('114514');

export const AESTool = {
  encrypt: (message: string) => {
    let sendData = CryptoJS.enc.Utf8.parse(message);
    let encrypted = CryptoJS.AES.encrypt(sendData, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString(); //Base64字符串
  },

  decrypt: (message: string) => {
    let decrypt = CryptoJS.AES.decrypt(message, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypt.toString(CryptoJS.enc.Utf8);
  },
};
