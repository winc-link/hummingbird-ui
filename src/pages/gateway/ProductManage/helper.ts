import { v4 } from 'uuid'
import { TypeSpec, PropertyThingModelType, EventThingModelType, ActionThingModelType, EnumValue, DeatilModalFormValue } from './types'
import { isUndefined } from 'lodash'

export const intValidator = (rule: any, value: any, callback: any) => {
  if ([undefined, null, ''].includes(value)) {
    callback('请输入 ')
  } else if (!/^\d+$/.test(value)) {
    callback('请输入整数')
  } else {
    callback()
  }
}

export const stringValidator = (rule: any, value: any, callback: any) => {
  if ([undefined, null, ''].includes(value)) {
    callback('请输入 ')
  } else if (!/^(?![-_])[\u4e00-\u9fa5_\-a-zA-Z0-9]{1,20}$/.test(value)) {
    callback('1-20位, 中文、英文、数字及特殊字符_-, 必须以中文、英文或数字开头')
  } else {
    callback()
  }
}

export const TypeSpecMap: {
  [key in TypeSpec]: string
} = {
  int: 'int(整数型)',
  float: 'float(浮点型)',
  enum: 'enum(枚举)',
  bool: 'bool(布尔)',
  struct: 'struct(结构体)',
  date: 'date(时间)',
  array: 'array(数组)',
  text: 'text(字符串)',
}

function getStructTableData (arr: any[]) {
  return arr.map(item => {
    return {
      code: item?.code,
      name: item?.name,
      type: item?.struct_type,
      specs: getPropertyFormValue({ formValue: item, typeKey: 'struct_type' })?.property?.specs,
    }
  })
}

export const getPropertyFormValue = ({ typeKey = 'type', formValue }: {
  typeKey: 'type' | 'struct_type' | 'array_type'
  formValue: DeatilModalFormValue & {
    [key: string]: any
  }
}) => {
  const type: TypeSpec = formValue[typeKey]

  const result: PropertyThingModelType = {
    property: {
      access_model: formValue?.access_model,
      require: false,
      type,
      specs: {},
    },
  }

  if (type === 'int' || type === 'float') {
    result.property.specs = {
      min: isUndefined(formValue?.min) ? undefined : String(formValue?.min),
      max: isUndefined(formValue?.max) ? undefined : String(formValue?.max),
      step: isUndefined(formValue?.step) ? undefined : String(formValue?.step),
      unit: JSON.parse(formValue?.unitObj || '{}')?.symbol,
      unitName: JSON.parse(formValue?.unitObj || '{}')?.unit_name,
    }
  } else if (type === 'enum') {
    result.property.specs = formValue.enumObject.reduce<{ [key: string]: string }>((iter, { key, value }) => {
      iter[key!] = value!
      return iter
    }, {})
  } else if (type === 'bool') {
    result.property.specs = {
      0: formValue[0],
      1: formValue[1],
    }
  } else if (type === 'text') {
    result.property.specs = {
      length: formValue.length,
    }
  } else if (type === 'date') {
    result.property.specs = {

    }
  } else if (type === 'struct') {
    result.property.specs = formValue?.structObj.map((item: any) => {
      return {
        name: item?.name,
        code: item?.code,
        typespec: {
          type: item?.struct_type,
          specs: getPropertyFormValue({ formValue: item, typeKey: 'struct_type' })?.property?.specs,
        },
      }
    })
  } else if (type === 'array') {
    result.property.specs = {
      size: formValue?.size,
      type: formValue?.array_type,
      specs: getPropertyFormValue({ formValue, typeKey: 'array_type' })?.property?.specs,
    }
  }

  return result
}

export const getEventFormvalue = ({ formValue }: { formValue: DeatilModalFormValue }) => {
  const result: EventThingModelType = {
    event: {
      event_type: formValue?.event_type,
      output_param: getStructTableData(formValue.structObj),
    },
  }

  return result
}

export const getActionFormvalue = ({ formValue }: { formValue: DeatilModalFormValue }) => {
  const result: ActionThingModelType = {
    action: {
      call_type: formValue?.call_type,
      input_param: getStructTableData(formValue.structInput),
      output_param: getStructTableData(formValue.structOutput),
    },
  }

  return result
}

export function getFillFormValue (specs: any, specType: TypeSpec): any {
  if (specType === 'int' || specType === 'float') {
    return {
      min: specs?.min,
      max: specs?.max,
      step: specs?.step,
      unitObj: specs?.unitName && specs?.unit ? `${specs?.unitName} (${specs?.unit})` : undefined,
    }
  } else if (specType === 'bool') {
    return {
      0: specs['0'],
      1: specs['1'],
    }
  } else if (specType === 'text') {
    return {
      length: specs?.length,
    }
  } else if (specType === 'enum') {
    return {
      enumObject: Object.entries<any>(specs).map<EnumValue>(([key, value]) => {
        return {
          id: v4(),
          keyName: v4(),
          valueName: v4(),
          key: Number(key),
          value,
        }
      }),
    }
  } else if (specType === 'struct') {
    return {
      structObj: specs.map((item: any) => {
        return {
          ...item,
          id: v4(),
          struct_type: item?.typespec?.type,
        }
      }),
    }
  } else if (specType === 'array') {
    return {
      ...getFillFormValue(specs?.specs, specs?.type),
      size: specs?.size,
      array_type: specs?.type,
    }
  } else {
    return {}
  }
}
