
import React, { useState, useImperativeHandle, forwardRef, useCallback } from 'react'
import { Badge, Form, message, Modal, Select } from 'antd'
import { DeviceServers } from '@/api/device-servers'
import { deviceSync, useGetCloudInstance } from '@/api'
import { RunStatusMap } from '@/utils/statusMap'

const { useForm } = Form

export interface DeviceSyncModalRef {
  open: () => void
}

export interface DeviceSyncModalProps {
  options: DeviceServers[]
  onFinish?: () => void
}

export const DeviceSyncModal = forwardRef<DeviceSyncModalRef, DeviceSyncModalProps>(({ options, onFinish }, ref) => {
  const [form] = useForm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { data: cloudInstanceOptions } = useGetCloudInstance()

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
      title="设备同步"
      maskClosable={false}
      open={isModalOpen}
      destroyOnClose
      cancelText="取消"
      okText="确定"
      okButtonProps={{ disabled: submitting, loading: submitting }}
      onOk={() => {
        form.validateFields().then(values => {
          setSubmitting(true)
          deviceSync({
            cloud_instance_id: values.cloud_instance_id,
            driver_instance_id: values.driver_instance_id,
          }).then(resp => {
            if (resp.success) {
              message.success('设备同步成功')
              handleClose()
              onFinish?.()
            } else {
              message.error(resp.errorMsg)
            }
          }).finally(() => {
            setSubmitting(false)
          })
        })
      }}
      onCancel={() => {
        handleClose()
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="关联平台"
          name="cloud_instance_id"
          rules={[{ required: true, message: '请选择关联平台' }]}
        >
          <Select
            placeholder="请选择关联平台"
            options={cloudInstanceOptions.map(item => ({
              value: item.id,
              label:
              (
                <>
                  <span className="mr10">{item.name}</span>
                [ <Badge status={RunStatusMap[item.run_status].status} text={RunStatusMap[item.run_status].text} /> ]
                </>
              ),
            }))}
          ></Select>
        </Form.Item>
        <Form.Item
          label="关联驱动"
          name="driver_instance_id"
        >
          <Select
            placeholder="请选择关联驱动"
            options={options.map(i => ({ label: i.name, value: i.id }))}
          ></Select>
        </Form.Item>
      </Form>
    </Modal>
  )
})

export default DeviceSyncModal
