export interface StudentItem {
  guid?: string
  xm?: string
  xb?: number
  xbname?: string | null
  age?: string | number
  csrq?: string
  sfzh?: string
  brdh?: string
  xzzqm?: string
  gljbys?: string
  glztName?: string | null
  zdrqmcs?: string
  gljb?: string
  zrysmc?: string
  gxsj?: string
  jdrmc?: string
  jdjgmc?: string
  zrysid?: number
  jdrid?: number
  orgid?: number
  jdorgid?: number
  jcpZ_FJGLJB_ID?: string | null
  orderid?: string
  mbgxy?: number
  mbtnb?: number
  mbgxb?: number
  mbncz?: number
  mbmzf?: number
  mbmxszb?: number
  gljgmc?: string | null
  id?: string | null
  glzt?: number
  zbglyy?: string | null
  jjlxR1?: string
  jjlxR2?: string
  jjlxrdH1?: string
  jjlxrdH2?: string
  cjsj?: string
  qyzt?: number
  qyztmc?: string
  jtysmc?: string | null
  xcxbdzt?: number
  xcxbdztmc?: string
}

export interface StudentPageData {
  pageIndex?: number
  pageSize?: number
  totalCount?: number
  totalPages?: number
  items?: StudentItem[]
}

export interface StudentQuery {
  leftFilterType: number
  ZT: number
  glzt: number
  searchValue: string
  gljb: string
  PageNo: number
  pageSize: number
  nextPage: boolean
  prevPage: boolean
  pageNo: number
}

export const studentColumns: unknown[]
export function createDefaultQuery(): StudentQuery
export function extractStudentPageData(response: unknown): StudentPageData
export function getGenderText(value?: number): string
export function getStatusText(value?: number): string
export function getTagItems(value?: string): string[]
export function formatDate(value?: string): string
