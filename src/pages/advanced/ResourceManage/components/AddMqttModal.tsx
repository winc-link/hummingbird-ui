import { Button, Drawer, Form, Input, message, Select, Space } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { addResource, editResource, MqttResource } from '@/api'

const { useForm } = Form

export interface AddMqttModalProps {
  onFinish: () => void
}
export interface AddMqttModalRef {
  open: (record?: MqttResource) => void
}

const handleChange = (value: string) => {
  console.log(`selected ${value}`)
}

export const AddMqttModal = forwardRef<AddMqttModalRef, AddMqttModalProps>(({ onFinish }, ref) => {
  const [form] = useForm()
  const [record, setRecord] = useState<MqttResource>()
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  console.log('record', record)

  const handleClose = useCallback(() => {
    form.resetFields()
    setIsModalOpen(false)
  }, [form])

  useImperativeHandle(ref, () => {
    return {
      open (record) {
        setRecord(record)
        setIsModalOpen(true)
        if (record) {
          form.setFieldsValue(record)
        }
      },
    }
  }, [form])

  return (
    <Drawer
      title={record ? '修改实例' : '添加实例'}
      placement="right"
      open={isModalOpen}
      width={550}
      closable={false}
      maskClosable={false}
      headerStyle={{ height: 51 }}
      destroyOnClose
      extra={<CloseOutlined onClick={handleClose} />}
      onClose={handleClose}
      footer={
        <Space>
          <Button
            type="primary"
            loading={submitting}
            disabled={submitting}
            onClick={() => {
              form.validateFields()
                .then(values => {
                  values.type = '消息对队列MQTT'
                  console.log('values', values)
                  setSubmitting(true)
                  if (record?.id) {
                    values.id = record.id
                    editResource(values)
                      .then(resp => {
                        if (resp.success) {
                          message.success('修改成功')
                          handleClose()
                          onFinish()
                        } else {
                          message.error(resp.errorMsg)
                        }
                      }).finally(() => {
                        setSubmitting(false)
                      })
                  } else {
                    addResource(values)
                      .then(resp => {
                        if (resp.success) {
                          message.success('添加成功')
                          handleClose()
                          onFinish()
                        } else {
                          message.error(resp.errorMsg)
                        }
                      }).finally(() => {
                        setSubmitting(false)
                      })
                  }
                })
            }}
          >确定</Button>
          <Button onClick={handleClose}>取消</Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          label="实例名称"
          name="name"
          rules={[
            {
              required: true,
              validator (rule, value, callback) {
                if (!value) {
                  callback('请输入实例名称')
                } else if (/^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5_-]{0,31}$/.test(value)) {
                  callback()
                } else {
                  callback('1-32位字符，支持中文、英文、数字及特殊字符_-，必须以英文或中文字符开头')
                }
              },
            },
          ]}
        >
          <Input placeholder="1-32位字符，支持中文、英文、数字及特殊字符_-，必须以英文或中文字符开头"></Input>
        </Form.Item>
        <Form.Item
          label="MQTT broker address"
          name={['option', 'server']}
          rules={[{ required: true, message: '不能为空' }]}
        >
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item
          label="MQTT topic"
          name={['option', 'topic']}
          rules={[{ required: true, message: '不能为空' }]}
        >
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item
          label="MQTT client"
          name={['option', 'clientId']}
        >
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item
          label="MQTT protocol version"
          name={['option', 'protocolVersion']}
        >
          <Select
            placeholder="请选择"
            onChange={handleChange}
            options={[
              { value: '3.1', label: '3.1' },
              { value: '3.1.1', label: '3.1.1' },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="QoS"
          name={['option', 'qos']}
        >
          <Select
            placeholder="请选择"
            onChange={handleChange}
            options={[
              { value: 0, label: '0' },
              { value: 1, label: '1' },
              { value: 2, label: '2' },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="Username"
          name={['option', 'username']}
        >
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item
          label="Password"
          name={['option', 'password']}
        >
          <Input placeholder="请输入"></Input>
        </Form.Item>
      </Form>
    </Drawer>
  )
})

export default AddMqttModal
