import { Button, Drawer, Form, Input, InputNumber, message, Select, Space } from 'antd'
import { CloseOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { addResource, editResource, HttpResource } from '@/api'

const { useForm } = Form

export interface AddHttpModalProps {
  onFinish: () => void
}
export interface AddHttpModalRef {
  open: (record?: HttpResource) => void
}

const handleChange = (value: string) => {
  console.log(`selected ${value}`)
}

export const AddHttpModal = forwardRef<AddHttpModalRef, AddHttpModalProps>(({ onFinish }, ref) => {
  const [form] = useForm()
  const [record, setRecord] = useState<HttpResource>()
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
        console.log(record)
        setIsModalOpen(true)
        if (record) {
          const headers = Object.entries(record.option?.headers || {}).reduce((r, [key, value]) => {
            r.push({ key: key as string, value: value as string })
            return r
          }, [] as {key: string, value: string}[]) || []
          const fields = {
            ...record,
            option: {
              ...record.option,
              headers: headers.length > 0 ? headers : [{}],
            },
          }
          form.setFieldsValue(fields)
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
                  const headers = values.option.headers.reduce((r: { [x: string]: any }, item: { key: string | number; value: any }) => {
                    r[item.key] = item.value
                    return r
                  }, {})
                  values.option.headers = headers
                  values.type = 'HTTP推送'
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
        initialValues={{
          option: {
            headers: [
              {},
            ],
          },
        }}
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
          label="URL"
          name={['option', 'url']}
          rules={[
            {
              required: true,
              validator (rule, value, callback) {
                if (!value) {
                  callback('请输入')
                }
                callback()
              },
            },
          ]}
        >
          <Input placeholder="请输入需要推送的服务地址，以http://或https://开头"></Input>
        </Form.Item>
        <Form.Item
          label="HTTP method"
          name={['option', 'method']}
        >
          <Select
            placeholder="请选择"
            onChange={handleChange}
            options={[
              { value: 'get', label: 'GET' },
              { value: 'post', label: 'POST' },
              { value: 'put', label: 'PUT' },
              { value: 'patch', label: 'PATCH' },
              { value: 'delete', label: 'DELETE' },
              { value: 'head', label: 'HEAD' },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="Body type"
          name={['option', 'bodyType']}
        >
          <Select
            placeholder="请选择"
            onChange={handleChange}
            options={[
              { value: 'none', label: 'none' },
              { value: 'json', label: 'json' },
              { value: 'text', label: 'text' },
              { value: 'html', label: 'html' },
              { value: 'xml', label: 'xml' },
              { value: 'javascript', label: 'javascript' },
              { value: 'form', label: 'form' },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="Timeout(ms)"
          name={['option', 'timeout']}
        >
          <InputNumber placeholder="请输入" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="HTTP headers">
          <Form.List name={['option', 'headers']}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      label="Key"
                      name={[name, 'key']}
                    >
                      <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Value"
                      name={[name, 'value']}
                    >
                      <Input placeholder="请输入" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" style={{ width: '15%' }} onClick={() => add()} block icon={<PlusOutlined />}>
                    Add
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Drawer>
  )
})

export default AddHttpModal
