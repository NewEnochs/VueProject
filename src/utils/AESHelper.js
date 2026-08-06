import CryptoJS from 'crypto-js'

const keyStr = 'GVvVJyrsFRKms8XKhwfwpgB47DtIaZ2p'
const ivStr = '4XEUxWxkTSGcEZxe'

const key = CryptoJS.enc.Utf8.parse(keyStr)
const iv = CryptoJS.enc.Utf8.parse(ivStr)

export default {
  Encrypt(word) {
    const srcs = CryptoJS.enc.Utf8.parse(word)
    const encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
    return encrypted.toString()
  },

  Decrypt(word) {
    const decrypt = CryptoJS.AES.decrypt(word, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
    return CryptoJS.enc.Utf8.stringify(decrypt).toString()
  },
}
