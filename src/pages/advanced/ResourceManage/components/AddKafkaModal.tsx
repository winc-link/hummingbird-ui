import { Button, Drawer, Form, Input, message, Select, Space } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { addResource, editResource, KafkaResource } from '@/api'

const { useForm } = Form

export interface AddKafkaModalProps {
  onFinish: () => void
}
export interface AddKafkaModalRef {
  open: (record?: KafkaResource) => void
}

export const AddKafkaModal = forwardRef<AddKafkaModalRef, AddKafkaModalProps>(({ onFinish }, ref) => {
  const [form] = useForm()
  const [record, setRecord] = useState<KafkaResource>()
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

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
                  console.log('values', values)
                  values.type = '消息队列Kafka'
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
          label="Kafka brokers"
          name={['option', 'brokers']}
          rules={[{ required: true, message: '不能为空' }]}
        >
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item
          label="Topic"
          name={['option', 'topic']}
          rules={[{ required: true, message: '不能为空' }]}
        >
          <Input placeholder="请输入"></Input>
        </Form.Item>
        <Form.Item
          label="SaslAuthType"
          name={['option', 'saslAuthType']}
        >
          <Select
            placeholder="请选择"
            // onChange={handleChange}
            options={[
              { value: 'none', label: 'none' },
              { value: 'plain', label: 'plain' },
              { value: 'scram', label: 'scram' },
            ]}
          />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, nextValues) => {
            return prevValues?.option?.saslAuthType !== nextValues?.option?.saslAuthType
          }}
        >
          {({ getFieldValue }) => {
            // console.log('shouldUpdate123', getFieldValue(['sub_rule', 'option', 'value_type']))
            return getFieldValue(['option', 'saslAuthType']) !== 'none' && (<><Form.Item
              label="SaslUserName"
              name={['option', 'saslUserName']}
            >
              <Input placeholder="请输入"></Input>
            </Form.Item><Form.Item
              label="SaslPassword"
              name={['option', 'saslPassword']}
            >
              <Input.Password placeholder="请输入" />
            </Form.Item>
            </>)
          }}
        </Form.Item>
      </Form>
    </Drawer>
  )
})

export default AddKafkaModal
