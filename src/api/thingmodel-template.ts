import { httpRequest } from '@/utils/request'
import { CommonResponse } from '@/types'

export interface TypeSpec {
  type: string
  specs: string
}

export interface InputParam {
  code: string
  name: string
  type_spec: TypeSpec
}

export interface OutputParam {
  code: string
  name: string
  type_spec: TypeSpec
}

export interface Property {
  id: string
  product_id: string
  model_name: string
  name: string
  code: string
  access_mode: string
  require: boolean
  type_spec: TypeSpec
  description: string
  tag: string
  system: boolean
  created: number
  modified: number
}

export interface Event {
  id: string
  model_name: string
  event_type: string
  code: string
  name: string
  product_id: string
  description: string
  require: boolean
  output_params: OutputParam[]
  tag: string
  system: boolean
  created: number
  modified: number
}

export interface Action {
  id: string
  model_name: string
  product_id: string
  code: string
  name: string
  description: string
  require: boolean
  call_type: string
  input_params: InputParam[]
  output_params: any
  tag: string
  system: boolean
  created: number
  modified: number
}

export interface ThingModelTemplate {
  id: string
  category_name: string
  category_key: string
  thing_model_json: string
  properties: Property[]
  events: Event[]
  actions: Action[]
}

export function thingModelTemplate (category_key: string) {
  return httpRequest<any, CommonResponse<ThingModelTemplate>>({
    url: '/api/v1/thingmodel-template/' + category_key,
  })
}
