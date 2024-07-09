import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Form, Popconfirm, Typography, Select, message } from 'antd'
import { WebSocketContext } from '@/components/WebSocket'
import { DeviceLibraries } from '@/api/device-libraries'

const { useForm } = Form

export interface UpdateModalProps {
  record: DeviceLibraries
  selectedRowKeys?: string[]
  onFinish: () => void
  onChange?: (id: string) => void
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ record, selectedRowKeys, onFinish, onChange }) => {
  const [form] = useForm()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const { ws } = useContext(WebSocketContext)

  useEffect(() => {
    if (!selectedRowKeys?.includes(record.id)) {
      handleClose()
    }
  }, [selectedRowKeys, record])

  const handleClose = useCallback(() => {
    form.resetFields()
    setOpen(false)
  }, [form])

  return (
    <Popconfirm
      icon={null}
      open={open}
      okButtonProps={{ disabled: submitting, loading: submitting }}
      title={(
        <Form form={form} layout="vertical">
          <Form.Item
            label="镜像版本"
            name="version"
            rules={[{ required: true, message: '请输入镜像版本' }]}
          >
            <Select
              style={{ width: 200 }}
              placeholder="请输入镜像版本"
              mode="tags"
              options={
                record.support_versions.map(item => ({
                  label: item.version,
                  value: item.version,
                }))
              }
              onChange={(value: string[]) => {
                const newValue = value[value.length - 1]
                form.setFieldValue('version', newValue ? [newValue] : [])
              }}
            ></Select>
          </Form.Item>
        </Form>
      )}
      onConfirm={() => {
        form.validateFields()
          .then(values => {
            console.log(values)
            setSubmitting(true)

            ws?.send({
              code: 10001,
              data: { id: record.id, version: values.version[0] },
            }).then((result) => {
              console.log(result)
              if (result.data.success) {
                message.success(result.data.successMsg)
                handleClose()
                onFinish()
              } else {
                message.error(result.data.errorMsg)
              }
            }).catch((err) => {
              console.log(err)
            }).finally(() => {
              setSubmitting(false)
            })
          })
      }}
      onCancel={handleClose}
      okText="确定"
      cancelText="取消"
    >
      <Typography.Link
        onClick={() => {
          onChange?.(record.id)
          setOpen(true)
        }}
      >
        { record.operate_status === 'installed' ? '更新' : '下载' }
      </Typography.Link>
    </Popconfirm>

  )
}

export default UpdateModal
