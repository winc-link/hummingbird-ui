import { Button, Drawer, Form, Input, message, Space } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { addScene } from '@/api'
import { DeviceLibraries } from '@/api/device-libraries'

const { useForm } = Form
const { TextArea } = Input

export interface AddSceneProps {
  onFinish: () => void
}
export interface AddSceneRef {
  open: (record?: DeviceLibraries) => void
}

export const AddScene = forwardRef<AddSceneRef, AddSceneProps>(({ onFinish }, ref) => {
  const [form] = useForm()
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const handleClose = useCallback(() => {
    form.resetFields()
    setIsModalOpen(false)
  }, [form])

  useImperativeHandle(ref, () => {
    return {
      open (record) {
        setIsModalOpen(true)
        if (record) {
          form.setFieldsValue(record)
        }
      },
    }
  }, [form])

  return (
    <Drawer
      title="新建场景"
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
                  setSubmitting(true)
                  addScene(values)
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
                })
            }}
          >确定</Button>
          <Button onClick={handleClose}>取消</Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="场景名称"
          name="name"
          rules={[
            {
              required: true,
              validator (rule, value, callback) {
                if (!value) {
                  callback('请输入场景名称')
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
          label="场景描述"
          name="description"
        >
          <TextArea
            showCount
            maxLength={100}
            placeholder="请输入"
            rows={4}></TextArea>
        </Form.Item>
      </Form>
    </Drawer>
  )
})

export default AddScene
