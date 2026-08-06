declare const request: {
  (config: Record<string, unknown>): Promise<unknown>
}

export const ACCESS_TOKEN: string
export const getToken: () => string | null
export const setToken: (token: string) => void
export const clearToken: () => void
export const axios: typeof request

export default request
