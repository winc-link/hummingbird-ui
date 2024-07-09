import React, { useImperativeHandle, forwardRef, useState, useRef, useCallback } from 'react'
import { Form, Drawer, Input, Button, Space, message } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { addDeviceLibraries, editDeviceLibraries } from '@/api'
import { DockerConfigModal, DockerConfigModalRef } from './DockerConfigModal'
import { DeviceLibraries } from '@/api/device-libraries'

const { useForm } = Form
const { TextArea } = Input

export interface AddModalProps {
  onFinish: () => void
}

export interface AddModalRef {
  open: (record?: DeviceLibraries) => void
}

export const AddModal = forwardRef<AddModalRef, AddModalProps>(({ onFinish }, ref) => {
  const [form] = useForm()
  const [record, setRecord] = useState<DeviceLibraries>()
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const dockerConfigModalRef = useRef<DockerConfigModalRef>(null)

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
      title={record ? '编辑镜像' : '新增镜像'}
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

                  if (record?.id) {
                    editDeviceLibraries(record.id, {
                      name: values.name,
                      description: values.description,
                      protocol: values.protocol,
                      docker_config_id: values.docker_config_id,
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
                  } else {
                    addDeviceLibraries(values)
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
      <Form form={form} layout="vertical">
        <Form.Item
          label="驱动名称"
          name="name"
          rules={[{ required: true, message: '请输入驱动名称' }]}
        >
          <Input placeholder="请输入驱动名称"></Input>
        </Form.Item>
        <Form.Item
          label="容器名称"
          name="container_name"
          validateFirst
          rules={[
            { required: true, message: '请输入容器名称' },
            {
              validator (rule, value, callback) {
                if (/^[a-z]{1,23}$/.test(value)) {
                  callback()
                } else {
                  callback('必须为⼩写字⺟，⻓度⼩于12')
                }
              },
            },
          ]}
        >
          <Input placeholder="请输入容器名称" disabled={!!record}></Input>
        </Form.Item>
        <Form.Item
          label="协议"
          name="protocol"
          rules={[{ required: true, message: '请输入协议' }]}
        >
          <Input placeholder="请输入协议"></Input>
        </Form.Item>
        <Form.Item
          label="镜像仓库地址"
          name="docker_config_id"
          rules={[{ required: true, message: '请选择仓库镜像' }]}
        >
          <DockerConfigModal ref={dockerConfigModalRef} />
        </Form.Item>
        <Form.Item
          label="驱动标识"
          name="docker_repo_name"
          rules={[{ required: true, message: '请输入驱动标识' }]}
        >
          <Input placeholder="请输入驱动标识" disabled={!!record}></Input>
        </Form.Item>
        <Form.Item
          label="版本"
          name="version"
          rules={[{ required: true, message: '请输入版本' }]}
        >
          <Input placeholder="请输入版本" disabled={!!record}></Input>
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

export default AddModal
