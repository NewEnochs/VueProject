declare const request: {
  (config: Record<string, unknown>): Promise<unknown>
}

export const ACCESS_TOKEN: string
export const TOKEN_EXPIRY_MS: number
export const getToken: () => string | null
export const setToken: (token: string) => void
export const clearToken: () => void
export function isTokenExpired(): boolean
export const axios: typeof request

export default request
