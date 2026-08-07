export function getGradeList(data?: unknown): Promise<unknown>
export function studentPage(data: unknown): Promise<unknown>
export interface UpdatePassWordPayload {
  passWord: string
  newPassWord: string
}
export function updatePassWord(data: UpdatePassWordPayload): Promise<unknown>
