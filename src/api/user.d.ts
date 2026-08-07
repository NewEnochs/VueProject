export interface LoginPayload {
  Account: string
  Password: string
}

export function login(data: LoginPayload): Promise<unknown>
export function getLoginUser(params?: Record<string, unknown>): Promise<any>
export function logout(): Promise<unknown>
