import React, { useImperativeHandle, forwardRef, useState, useMemo, useCallback } from 'react'
import { Form, Modal, Input, Switch, Select, message } from 'antd'
import { cloudInstanceAuthorization } from '@/api'
import { useStateCallback } from '@/hooks'
import { CloudInstance } from '@/api/cloud-instance'

const { useForm } = Form

type FormItemLists = {
  filed_name: string
  input_name: string
  input_type: string
  input_placeholder: string
  is_required: boolean
}

export interface AuthorizationModalProps {
  onFinish: () => void
}

export interface AuthorizationModalRef {
  open: (record: CloudInstance) => void
}

export const AuthorizationModal = forwardRef<AuthorizationModalRef, AuthorizationModalProps>(({ onFinish }, ref) => {
  const [record, setRecord] = useState<Partial<CloudInstance>>({})
  const [isModalOpen, setIsModalOpen] = useStateCallback<boolean>(false)

  console.log(isModalOpen)
  const [form] = useForm()

  const template = useMemo<FormItemLists[]>(() => {
    try {
      return JSON.parse(record?.extend_template || '') || []
    } catch (error) {
      return []
    }
  }, [record])
  console.log('record', record)

  useImperativeHandle(ref, () => {
    return {
      open (row) {
        setRecord(row)
        setIsModalOpen(true, () => {
          form.setFieldsValue({
            instance_authorization_config: { ...row?.authorization_config },
            instance_log_config: {
              log_switch: typeof row?.log_switch === 'boolean' ? row?.log_switch : false,
              log_filter: row?.log_filter || [],
            },
          })
        })
      },
    }
  }, [form])

  const handleClose = useCallback(() => {
    form.resetFields()
    setIsModalOpen(false)
  }, [form])

  return (
    <Modal
      title="服务授权"
      open={isModalOpen}
      maskClosable={false}
      destroyOnClose
      cancelText="取消"
      okText="确定"
      onCancel={handleClose}
      onOk={() => {
        form.validateFields()
          .then(resp => {
            if (record?.id) {
              cloudInstanceAuthorization<any>(record?.id, resp)
                .then((result) => {
                  if (result.success) {
                    message.success('操作成功')
                    handleClose()
                    onFinish()
                  } else {
                    message.error(result.errorMsg)
                  }
                }).catch((err) => {
                  message.error('操作失败')
                  console.log(err)
                })
            }
          })
      }}
    >
      <Form form={form} layout="vertical">
        {
          template.map(item => {
            return (
              <Form.Item
                key={item.input_name}
                name={['instance_authorization_config', item.input_name]}
                label={item.filed_name}
                rules={[{ required: item.is_required, message: item.input_placeholder }]}
              >
                {item.filed_name === 'SecretKey'
                  ? <Input.Password placeholder={item.input_placeholder} />
                  : <Input placeholder={item.input_placeholder}/>
                }
              </Form.Item>
            )
          })
        }
        <Form.Item
          label="开启日志"
          name={['instance_log_config', 'log_switch']}
          valuePropName="checked"
          required
        >
          <Switch></Switch>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, nextValues) => {
            return prevValues.instance_log_config?.log_switch !== nextValues.instance_log_config?.log_switch
          }}
        >
          {({ getFieldValue }) => {
            return getFieldValue('instance_log_config')?.log_switch
              ? (
                <Form.Item
                  label="日志输出类型"
                  name={['instance_log_config', 'log_filter']}
                  rules={[{ required: true, message: '请选择日志输出类型' }]}
                >
                  <Select allowClear mode="multiple" placeholder="请选择日志输出类型">
                    <Select.Option key={'property_report'}>设备属性上报</Select.Option>
                    <Select.Option key={'event_report'}>设备事件上报</Select.Option>
                    <Select.Option key={'action_reveice'}>云端命令下发</Select.Option>
                  </Select>
                </Form.Item>
              )
              : null
          }}
        </Form.Item>
      </Form>
    </Modal>
  )
})

export default AuthorizationModal
