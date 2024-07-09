import React, { useEffect, useState } from 'react'
import { Form, Input, InputNumber, Select, SelectProps, Space, Typography } from 'antd'
import { thingModelUnit } from '@/api'
import { intValidator, stringValidator, TypeSpecMap } from '../helper'
import { ThingModelUnit, TypeSpec } from '../types'
import { Struct } from './Struct'
import { Enum } from './Enum'

const { Text } = Typography

interface PropertyFormItemProps {
  showView?: boolean
  type?: TypeSpec
  options: SelectProps['options']
  prefix?: 'array_' | 'struct_'
}

export const PropertyFormItem: React.FC<PropertyFormItemProps> = (props) => {
  const { prefix = '', type, options = [] } = props
  const typeName = `${prefix}type`

  const [unitOptions, setUnitOptions] = useState<ThingModelUnit[]>([])

  useEffect(() => {
    thingModelUnit<ThingModelUnit>({ isAll: true }).then(resp => {
      if (resp.success && Array.isArray(resp.result.list)) {
        setUnitOptions(resp.result.list)
      }
    })
  }, [])

  return (
    <>
      <Form.Item
        label={type === 'array' ? '元素类型' : '数据类型'}
        name={typeName}
        rules={[{ required: true, message: type === 'array' ? '请选择元素类型' : '请选择数据类型' }]}
      >
        <Select placeholder="请选择" options={options}></Select>
      </Form.Item>
      {
        type === 'array' && (
          <Form.Item
            label="元素个数"
            name="size"
            required
            rules={[{ validator: intValidator }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入元素个数" precision={0} min={0} />
          </Form.Item>
        )
      }
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, nextValues) => prevValues[typeName] !== nextValues[typeName]}
      >
        {({ getFieldValue }) => {
          const typeNameValue: TypeSpec = getFieldValue(typeName)

          if (typeNameValue === 'int' || typeNameValue === 'float') {
            return (
              <>
                <Form.Item label="定义取值范围">
                  <Space.Compact block>
                    <Form.Item
                      name="min"
                      className="mb0"
                      style={{ flex: 1 }}
                      rules={[
                        { required: true, message: '请输入最小值' },
                        typeNameValue === 'int'
                          ? { pattern: /^-?\d+$/, message: '输入整数' }
                          : { pattern: /^-?\d+(\.\d{1,2})?$/, message: '输入数字，最多两位小数' },
                      ]}
                    >
                      {/* <InputNumber style={{ width: '100%' }} placeholder="最小值" precision={typeNameValue === 'int' ? 0 : 1}/> */}
                      <Input placeholder="最小值" />
                    </Form.Item>
                    <Input
                      className="site-input-split"
                      placeholder="~"
                      disabled
                    />
                    <Form.Item
                      name="max"
                      className="mb0"
                      style={{ flex: 1 }}
                      rules={[
                        { required: true, message: '请输入最大值' },
                        typeNameValue === 'int'
                          ? { pattern: /^-?\d+$/, message: '输入整数' }
                          : { pattern: /^-?\d+(\.\d{1,2})?$/, message: '输入数字，最多两位小数' },
                      ]}
                    >
                      {/* <InputNumber style={{ width: '100%' }} placeholder="最大值" precision={typeNameValue === 'int' ? 0 : 1} /> */}
                      <Input placeholder="最大值" />
                    </Form.Item>
                  </Space.Compact>
                </Form.Item>
                <Form.Item
                  label="步长"
                  name="step"
                  // rules={[{ required: true, message: '请输入步长' }]}
                  rules={[
                    { required: true, message: '请输入步长' },
                    typeNameValue === 'int'
                      ? { pattern: /^-?\d+$/, message: '输入整数' }
                      : { pattern: /^-?\d+(\.\d{1,2})?$/, message: '输入数字，最多两位小数' },
                  ]}
                >
                  {/* <InputNumber
                    style={{ width: '100%' }}
                    placeholder="请输入步长"
                    min={typeNameValue === 'int' ? 1 : 0}
                    precision={typeNameValue === 'int' ? 0 : 1}
                  /> */}
                  <Input placeholder="请输入步长" />
                </Form.Item>
                <Form.Item
                  label="单位"
                  name="unitObj"
                  // rules={[{ required: true, message: '请选择标准品类' }]}
                >
                  <Select
                    placeholder="请选择"
                    showSearch
                    options={unitOptions.map(({ id, unit_name, symbol }) => {
                      return {
                        value: JSON.stringify({ id, symbol, unit_name }),
                        label: `${unit_name} (${symbol})`,
                      }
                    })}
                  ></Select>
                </Form.Item>
              </>
            )
          }

          if (typeNameValue === 'bool') {
            return (
              <Form.Item label="布尔值" className="m0">
                <Form.Item
                  label="true"
                  name="1"
                  required
                  rules={[{ validator: stringValidator }]}
                >
                  <Input placeholder="1-20位, 中文、英文、数字及特殊字符_-, 必须以中文、英文或数字开头" />
                </Form.Item>
                <Form.Item
                  label="false"
                  name="0"
                  required
                  rules={[{ validator: stringValidator }]}
                >
                  <Input placeholder="1-20位, 中文、英文、数字及特殊字符_-, 必须以中文、英文或数字开头" />
                </Form.Item>
              </Form.Item>
            )
          }

          if (typeNameValue === 'text') {
            return (
              <Form.Item
                label="数据长度"
                name="length"
                rules={[{ required: true, message: '请输入数据长度' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  addonAfter="字符"
                  placeholder="整数, 单位: 字符"
                  precision={0}
                  min={0}
                  // max={256}
                />
              </Form.Item>
            )
          }

          if (typeNameValue === 'date') {
            return (
              <Form.Item label="时间格式">
                <Input placeholder="整数类型Int64的UTC时间戳(毫秒)" disabled />
              </Form.Item>
            )
          }

          if (typeNameValue === 'enum') {
            return (
              <Form.Item
                required
                name="enumObject"
                label={
                  <>
                    <Text className="mr20">枚举项</Text>
                    <Text type="secondary">最多100项</Text>
                  </>
                }
              >
                <Enum />
              </Form.Item>
            )
          }

          if (typeNameValue === 'struct') {
            return (
              <Form.Item
                required
                name="structObj"
                rules={[
                  {
                    validator (rule, value, callback) {
                      if (!value || (Array.isArray(value) && !value.length)) {
                        callback('请至少添加一个参数')
                      } else if (value.length > 20) {
                        callback('最多支持50个参数')
                      } else {
                        callback()
                      }
                    },
                  },
                ]}
                label={
                  <>
                    <Text className="mr20">{type === 'array' ? '元素结构' : 'JSON对象'}</Text>
                    <Text type="secondary">最多20项</Text>
                  </>
                }
              >
                <Struct showView={props.showView} />
              </Form.Item>
            )
          }

          if (typeNameValue === 'array') {
            const options = Object.entries(TypeSpecMap).filter(([value]) => value !== 'array').map(([value, label]) => ({ label, value }))
            return <PropertyFormItem type="array" prefix="array_" options={options} />
          }

          return null
        }}
      </Form.Item>
    </>
  )
}
