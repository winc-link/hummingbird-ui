import DisabledContext from 'antd/es/config-provider/DisabledContext'
import React, { useContext, useEffect, useState } from 'react'
import { Button, Col, Form, Input, InputNumber, Row, Typography } from 'antd'
import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { stringValidator } from '../helper'
import { EnumValue } from '../types'
import { v4 } from 'uuid'

const { Text } = Typography

export interface EnumProps {
  value?: EnumValue[]
  onChange?: (value: EnumValue[]) => void
}

export const Enum: React.FC<EnumProps> = (props) => {
  const disabled = useContext(DisabledContext)

  const { value = [{ id: v4(), keyName: v4(), key: undefined, valueName: v4(), value: undefined }], onChange } = props
  const [options, setOptions] = useState<EnumValue[]>(value)

  useEffect(() => {
    onChange?.(options)
  }, [options])

  return (
    <>
      <Row className="mb15">
        <Col span={9}>
          <Text>参数值</Text>
        </Col>
        <Col span={14}>
          <Text>参数描述</Text>
        </Col>
      </Row>
      {
        options.map((item) => {
          return (
            <Row gutter={10} key={item.id}>
              <Col span={disabled ? 10 : 9}>
                <Form.Item
                  name={item.keyName}
                  initialValue={item.key}
                  rules={[{ required: true, message: '请输入参数值' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="整数"
                    precision={0}
                    min={0}
                    onChange={(value) => {
                      const newOptions = options.map((i) => {
                        if (i.keyName === item.keyName) {
                          i.key = value!
                        }
                        return i
                      })

                      setOptions(newOptions)
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={14}>
                <Form.Item
                  name={item.valueName}
                  initialValue={item.value}
                  rules={[{ validator: stringValidator }]}
                >
                  <Input
                    placeholder="1-20位, 中文、英文、数字及特殊字符_-, 必须以中文、英文或数字开头"
                    onChange={(e) => {
                      const newOptions = options.map((i) => {
                        if (i.valueName === item.valueName) {
                          i.value = e.target.value
                        }
                        return i
                      })

                      setOptions(newOptions)
                    }}
                  />
                </Form.Item>
              </Col>
              {
                !disabled && (
                  <Col span={1}>
                    <Form.Item>
                      <CloseCircleOutlined
                        onClick={() => {
                          if (options.length > 1) {
                            const newOptions = [...options]
                            const deleteIndex = newOptions.findIndex(i => i.id === item.id)
                            newOptions.splice(deleteIndex, 1)
                            setOptions(newOptions)
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                )
              }
            </Row>
          )
        })
      }
      <Button
        type="link"
        icon={<PlusOutlined />}
        style={{ padding: 0, marginTop: -50 }}
        disabled={disabled}
        onClick={() => {
          setOptions([...options, { id: v4(), keyName: v4(), key: undefined, valueName: v4(), value: undefined }])
        }}
      >添加枚举项</Button>
    </>
  )
}

export default Enum
