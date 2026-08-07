import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUser } from '@/api/user'
import { clearToken } from '@/utils/request'

const USER_INFO_KEY = 'Login-User-Info'

function readUserInfo() {
  const cachedValue = localStorage.getItem(USER_INFO_KEY)

  if (!cachedValue) {
    return null
  }

  try {
    return JSON.parse(cachedValue)
  } catch {
    localStorage.removeItem(USER_INFO_KEY)
    return null
  }
}

function getPayload(response: unknown) {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: unknown }).data
  }

  return response
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<any>(readUserInfo())
  const displayName = computed(() => {
    const user = userInfo.value

    if (!user) {
      return 'User'
    }

    return user
  })

  function setUserInfo(user: any) {
    userInfo.value = user

    if (userInfo.value) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo.value))
    } else {
      localStorage.removeItem(USER_INFO_KEY)
    }
  }

  async function fetchUserInfo() {
    const response = await getLoginUser()
    const user = getPayload(response) as any
    setUserInfo(user)
    return user
  }

  function clearSession(clearAll = false) {
    clearToken()
    setUserInfo(null)

    if (clearAll) {
      localStorage.clear()
      sessionStorage.clear()
    }
  }

  return {
    userInfo,
    displayName,
    setUserInfo,
    fetchUserInfo,
    clearSession,
  }
})
