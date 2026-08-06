import axios from 'axios'
import { message, notification } from 'ant-design-vue'
import AESHelper from './AESHelper'

export const ACCESS_TOKEN = 'Access-Token'

export const getToken = () => localStorage.getItem(ACCESS_TOKEN)
export const setToken = (token) => localStorage.setItem(ACCESS_TOKEN, token)
export const clearToken = () => localStorage.removeItem(ACCESS_TOKEN)

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 300000,
})

let isToken = true

function getErrorText(data, fallback = '请求失败') {
  if (!data) {
    return fallback
  }

  if (typeof data === 'string') {
    return data || fallback
  }

  return (
    data.message ||
    data.Message ||
    data.msg ||
    data.error ||
    data.Errors?.[0]?.Message ||
    data.errors?.[0]?.message ||
    fallback
  )
}

function showErrorByStatus(status, data) {
  const errorText = getErrorText(data, `请求失败，状态码 ${status}`)

  if (status === 401) {
    if (isToken) {
      notification.error({
        message: '登录已失效',
        description: errorText || '请重新登录',
      })
      clearToken()
      sessionStorage.clear()
      isToken = false

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return
  }

  if (status === 403) {
    notification.error({
      message: '权限不足',
      description: errorText,
    })
    return
  }

  if (status === 502) {
    message.error(errorText || '网关错误，请检查后端服务或代理配置')
    return
  }

  message.error(errorText)
}

const err = (error) => {
  if (!error.response) {
    message.error(error.message || '请求失败，请检查网络或服务是否可用')
    return Promise.reject(error)
  }

  const { status, data = {} } = error.response
  showErrorByStatus(status, data)

  return Promise.reject(error)
}

window._axiosPromiseArr = []

service.interceptors.request.use((config) => {
  config.cancelToken = new axios.CancelToken((cancel) => {
    window._axiosPromiseArr.push({ cancel })
  })

  if (config.data?.signal) {
    config.signal = config.data.signal
    delete config.data.signal
  }

  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (!config.data || config.data instanceof FormData) {
    return config
  }

  config.data = AESHelper.Encrypt(JSON.stringify(config.data))
  return config
}, err)

service.interceptors.response.use((response) => {
  isToken = true

  if (response.headers['content-disposition']) {
    return response
  }

  if (response.config.decrypt !== false && response.data?.data && typeof response.data.data === 'string') {
    try {
      const decryptedData = AESHelper.Decrypt(response.data.data)

      if (decryptedData) {
        try {
          response.data.data = JSON.parse(`{"datas":${decryptedData}}`).datas
        } catch {
          response.data.data = decryptedData
        }
      }
    } catch {
      // Keep plain-text response data unchanged.
    }
  }

  if (response.data?.success === false) {
    const errorText = getErrorText(response.data, '请求失败')
    message.error(errorText)
    return Promise.reject(response.data)
  }

  return response.data
}, err)

export { service as axios }
export default service
