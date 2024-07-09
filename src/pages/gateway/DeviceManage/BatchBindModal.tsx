
import React, { useState, useImperativeHandle, forwardRef, useCallback } from 'react'
import { Form, message, Modal, Select } from 'antd'
import { bindDriver, useGetDeviceServers } from '@/api'
// import { DeviceServers } from '@/api/device-servers'

const { useForm } = Form

export interface BatchBindModalRef {
  open: () => void
}

export interface BatchBindModalProps {
  device_ids: string[]
  // options: DeviceServers[]
  onFinish?: () => void
}

export const BatchBindModal = forwardRef<BatchBindModalRef, BatchBindModalProps>(({ device_ids, onFinish }, ref) => {
  const [form] = useForm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: deviceServersOptions } = useGetDeviceServers({})

  const handleClose = useCallback(() => {
    form.resetFields()
    setIsModalOpen(false)
  }, [form])

  useImperativeHandle(ref, () => {
    return {
      open () {
        setIsModalOpen(true)
      },
    }
  }, [])

  return (
    <Modal
      title="批量绑定"
      maskClosable={false}
      open={isModalOpen}
      destroyOnClose
      cancelText="取消"
      okText="确定"
      onOk={() => {
        form.validateFields().then(values => {
          bindDriver({
            device_ids,
            driver_instance_id: values.driver_instance_id,
          }).then(resp => {
            if (resp.success) {
              message.success('批量绑定成功')
              handleClose()
              onFinish?.()
            } else {
              message.error(resp.errorMsg)
            }
          })
        })
      }}
      onCancel={() => {
        handleClose()
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="关联驱动"
          name="driver_instance_id"
          rules={[{ required: true, message: '请选择关联驱动' }]}
        >
          <Select
            placeholder="请选择关联驱动"
            options={deviceServersOptions.map(i => ({ label: i.name, value: i.id }))}
          ></Select>
        </Form.Item>
      </Form>
    </Modal>
  )
})

export default BatchBindModal
