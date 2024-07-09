import React, { useCallback, useEffect, useState } from 'react'
import { Form, message, Input, Popconfirm, Typography } from 'antd'
// import { WebSocketContext } from '@/components/WebSocket'
import { AlertList, alertTreated } from '@/api/alarmList'

const { useForm } = Form

export interface MessageModalProps {
  record: AlertList
  // selectedRowKeys?: string[]
  onFinish: () => void
}

export const MessageModal: React.FC<MessageModalProps> = ({ record, onFinish }) => {
  const [form] = useForm()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  // const { ws } = useContext(WebSocketContext)

  useEffect(() => {
    // if (!selectedRowKeys?.includes(record.id)) {
    handleClose()
    // }
  }, [])
  console.log('record', record)

  const handleClose = useCallback(() => {
    form.resetFields()
    setOpen(false)
  }, [form])

  return (<>
    <Popconfirm
      icon={null}
      open={open}
      okButtonProps={{ disabled: submitting, loading: submitting }}
      title={(
        <Form form={form} layout="vertical">
          <Form.Item
            label="处理意见"
            name="message"
            rules={[{ required: true, message: '请输入处理意见' }]}
          >
            <Input allowClear placeholder="请输入处理意见"></Input>
          </Form.Item>
        </Form>
      )}
      onConfirm={() => {
        form.validateFields()
          .then(values => {
            values.id = record.id
            console.log(values)
            setSubmitting(true)

            alertTreated(values)
              .then(resp => {
                if (resp.success) {
                  message.success('处理成功')
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
      onCancel={handleClose}
      okText="确定"
      cancelText="取消"
    >
      <Typography.Link
        onClick={() => {
          // onChange?.(record.id)
          setOpen(true)
        }}
        disabled={record.status === '已处理'}
      >
        处理
      </Typography.Link>
    </Popconfirm>
  </>
  )
}

export default MessageModal
