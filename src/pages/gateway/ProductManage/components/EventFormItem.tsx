import React from 'react'
import { Form, Select, Typography } from 'antd'
import { Struct } from './Struct'

const { Text } = Typography

interface EventFormItemProps {
  showView?: boolean
}

export const EventFormItem: React.FC<EventFormItemProps> = (props) => {
  return (
    <>
      <Form.Item
        label="事件类型"
        name="event_type"
        rules={[{ required: true, message: '请选择事件类型' }]}
      >
        <Select
          placeholder="请选择"
          options={[
            { label: '信息', value: 'info' },
            { label: '告警', value: 'alert' },
            { label: '故障', value: 'error' },
          ]}
        ></Select>
      </Form.Item>
      <Form.Item
        required
        name="structObj"
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
