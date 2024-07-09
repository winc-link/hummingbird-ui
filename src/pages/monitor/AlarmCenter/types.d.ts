export interface AlertPlate {
  type: any
  count: number
  alert_level: '提示' | '次要' | '重要' | '紧急',
}

export interface AlarmCenter {
  result: AlertPlate[]
}

export interface Sub_rule {
  trigger: string
  product_name: string
  device_name: string
  product_id: string,
  device_id: string,
  code: string
  condition: string
  option: {
    status: string
    code: string
    value_type: string
    value_cycle: string
    decide_condition: string
  }
}

export interface Notify {
  name: string
  option: any
  start_effect_time: string
  end_effect_time: string
}

export interface RuleInfo {
  id: string
  name: string
  alert_type: string
  alert_level: string
  status: string
  condition: string
  silence_time: number
  description: string
  created: number
  modified: number
  sub_rule: Sub_rule[]
  notify: Notify[]
}
