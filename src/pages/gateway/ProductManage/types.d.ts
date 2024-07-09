export type TypeSpec = 'array' | 'bool' | 'struct' | 'enum' | 'date' | 'text' | 'int' | 'float'

export type ThingModelType = 'property' | 'event' | 'action'

export type AccessModelType = 'R' | 'RW'

export interface ProductProperties {
  access_mode: AccessModelType
  code: string
  created: number
  description: string
  id: string
  model_name: string
  modified: number
  name: string
  product_id: string
  require: boolean
  system: boolean
  tag: string
  type: 'property'
  type_spec: {
    specs: string
    type: TypeSpec
  }
}

export interface ProductActions {
  call_type: string
  code: string
  created: number
  description: string
  id: string
  input_params: any[]
  model_name: string
  modified: number
  name: string
  output_params: any[]
  product_id: string
  require: boolean
  system: boolean
  tag: string
  type: 'action'
}

export interface ProductEvents {
  code: string
  created: number
  description: string
  event_type: string
  id: string
  model_name: string
  modified: number
  name: string
  output_params: any[]
  product_id: string
  require: boolean
  system: boolean
  tag: string
  type: 'event'
}

export type ProductThingModelType = ProductProperties | ProductEvents | ProductActions

export interface ProductInfo {
  actions: ProductActions[]
  cloud_instance_id: string
  cloud_product_id: string
  created_at: number
  data_format: string
  description: string
  events: ProductEvents[]
  factory: string
  id: string
  last_sync_time: number
  name: string
  net_type: string
  node_type: string
  platform: string
  properties: ProductProperties[]
  protocol: string
  status: string
}

export interface CategoryTemplate {
  category_key: string
  category_name: string
  id: string
  scene: string
}

export interface ThingModelUnit {
  id: string
  symbol: string
  unit_name: string
}

interface InputOutputParams {
  code: string
  name: string
  type: string
  specs: any
}

export interface PropertyThingModelType {
  property: {
    access_model: string
    require?: boolean
    type: string
    specs: any
  }
}

export interface EventThingModelType {
  event: {
    event_type: string
    output_param: Array<InputOutputParams>
  }
}

export interface ActionThingModelType {
  action: {
    call_type: string
    input_param: Array<InputOutputParams>
    output_param: Array<InputOutputParams>
  }
}

export interface BaseThingModelType {
  code: string
  description?: string
  name: string
  product_id?: string
  action?: ActionThingModelType['action']
  event?: EventThingModelType['event']
  property?: PropertyThingModelType['property']
  tag: string
  thing_model_type: string
}

export interface EnumValue {
  id: string
  keyName: string
  key: number | undefined
  valueName: string
  value: string | undefined
}

export interface DeatilModalFormValue {
  code: string
  name: string
  description?: string
  thing_model_type: ThingModelType
  access_model: AccessModelType
  type: TypeSpec

  /**
   * @memberof property
   * @memberof int
   * @memberof float
   */
  min?: string
  max?: string
  step?: string
  unitObj?: string

  /**
   * @memberof property
   * @memberof bool
   */
  0?: string
  1?: string

  /**
   * @memberof property
   * @memberof text
   */
  length?: string

  /**
   * @memberof property
   * @memberof enum
   */
  enumObject: EnumValue[]

  /**
   * @memberof property
   * @memberof array
   */
  size?: string
  array_type?: string

  /**
   * @memberof event
   */
  event_type: string
  structObj: InputOutputParams[]

  /**
   * @memberof action
   */
  call_type: string
  structInput: InputOutputParams[]
  structOutput: InputOutputParams[]
}
