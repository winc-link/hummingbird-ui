import { httpRequest } from '@/utils/request'
import { TableRequestType, TableReponseType, CommonResponse } from '@/types'

export function iotPlatform () {
  return httpRequest<any, CommonResponse<string[]>>({
    url: '/api/v1/iot-platform',
  })
}

type AddProductParams = {
  name: string
  category_template_id: string
  node_type: string
  protocol: string
  data_format: string
  factory: string
  net_type: string
  description: string
}

export function addProduct<T> (data: AddProductParams) {
  return httpRequest<any, CommonResponse<TableReponseType<T>>, AddProductParams>({
    url: '/api/v1/product',
    method: 'post',
    data,
  })
}

export function allProductSync<T> (data: { cloud_instance_id: string }) {
  return httpRequest<any, CommonResponse<TableReponseType<T>>, { cloud_instance_id: string }>({
    url: '/api/v1/product-sync',
    method: 'post',
    data,
  })
}

export function productSync<T> (data: { product_id: string }) {
  return httpRequest<any, CommonResponse<TableReponseType<T>>, { product_id: string }>({
    url: `/api/v1/product-sync/${data.product_id}`,
    method: 'post',
    data,
  })
}

export function getProductInfo<T> (productId: string) {
  return httpRequest<any, CommonResponse<T>, { productId: string }>({
    url: `/api/v1/product/${productId}`,
    method: 'get',
    params: {
      productId,
    },
  })
}

export function deleteProduct<T> (productId: string) {
  return httpRequest<any, CommonResponse<TableReponseType<T>>, { productId: string }>({
    url: `/api/v1/product/${productId}`,
    method: 'delete',
    data: {
      productId,
    },
  })
}

export interface ProductType {
  status: string
  id: string
  product_id: string
  name: string
  node_type: string
  platform: string
  created_at: number
  category_name: string
}

export function getProductList (params: TableRequestType) {
  return httpRequest<any, CommonResponse<TableReponseType<ProductType>>>({
    url: '/api/v1/products',
    params,
  })
}
