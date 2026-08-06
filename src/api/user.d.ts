export interface LoginPayload {
  Account: string
  Password: string
}

export function login(data: LoginPayload): Promise<unknown>
export function getLoginUser(): Promise<unknown>
export function logout(): Promise<unknown>
