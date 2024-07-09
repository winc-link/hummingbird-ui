import React from 'react'
import { Form, Select, Typography } from 'antd'
import { Struct } from './Struct'

const { Text } = Typography

interface ActionFormItemProps {
  showView?: boolean
}

export const ActionFormItem: React.FC<ActionFormItemProps> = (props) => {
  return (
    <>
      <Form.Item
        label="调用方式"
        name="call_type"
        rules={[{ required: true, message: '请选择事件类型' }]}
      >
        <Select
          placeholder="请选择"
          options={[
            { label: '同步', value: 'SYNC' },
            { label: '异步', value: 'ASYNC' },
          ]}
        ></Select>
      </Form.Item>
      <Form.Item
        required
        name="structInput"
        rules={[
          {
            validator (rule, value, callback) {
              if (!value || (Array.isArray(value) && !value.length)) {
                callback('请至少添加一个参数')
              } else if (value.length > 50) {
                callback('最多支持50个参数')
              } else {
                callback()
              }
            },
          },
        ]}
        label={
          <>
            <Text className="mr20">输入参数</Text>
            <Text type="secondary">最多支持50个参数</Text>
          </>
        }
      >
        <Struct showView={props.showView}/>
      </Form.Item>
      <Form.Item
        required
        name="structOutput"
        rules={[
          {
            validator (rule, value, callback) {
              if (!value || (Array.isArray(value) && !value.length)) {
                callback('请至少添加一个参数')
              } else if (value.length > 50) {
                callback('最多支持50个参数')
              } else {
                callback()
              }
            },
          },
        ]}
        label={
          <>
            <Text className="mr20">输出参数</Text>
            <Text type="secondary">最多支持50个参数</Text>
          </>
        }
      >
        <Struct showView={props.showView}/>
      </Form.Item>
    </>
  )
}
