export interface TableRequestType {
  page?: number
  pageSize?: number
  isAll?: boolean
  platform?: string
  end_time?: number
  start_time?: number
  time?: any
}

export interface TableReponseType<T> {
  list: T[]
  page: number
  pageSize: number
  total: number
}

export type CommonResponse<T> = {
  errorCode: number
  errorMsg?: string
  successMsg?: string
  result: T
  success: boolean
}
