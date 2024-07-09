import React, { useImperativeHandle, forwardRef, useState, useCallback } from 'react'
import { Form, Drawer, Input, Button, Space, message } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { editDevices } from '@/api'
import { DevicesType } from '@/api/devices'

const { useForm } = Form
const { TextArea } = Input

export interface EditModalProps {
  onFinish: () => void
}

export interface EditModalRef {
  open: (record?: DevicesType) => void
}

export const EditModal = forwardRef<EditModalRef, EditModalProps>(({ onFinish }, ref) => {
  const [form] = useForm()
  const [record, setRecord] = useState<DevicesType>()
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
      title={'编辑设备'}
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
                  editDevices({
                    id: record?.id!,
                    description: values?.description,
                  }).then(resp => {
                    if (resp.success) {
                      message.success('编辑成功')
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
          label="设备名称"
          name="name"
        >
          <Input placeholder="请输入驱动名称" disabled></Input>
        </Form.Item>
        <Form.Item
          label="设备状态"
          name="status"
        >
          <Input placeholder="请输入容器名称" disabled></Input>
        </Form.Item>
        <Form.Item
          label="平台"
          name="platform"
        >
          <Input placeholder="请输入协议" disabled></Input>
        </Form.Item>
        <Form.Item
          label="关联驱动"
          name="driver_service_name"
        >
          <Input placeholder="请输入驱动标识" disabled></Input>
        </Form.Item>
        <Form.Item
          label="描述"
          name="description"
        >
          <TextArea placeholder="请输入描述" rows={4}></TextArea>
        </Form.Item>
      </Form>
    </Drawer>
  )
})

export default EditModal
