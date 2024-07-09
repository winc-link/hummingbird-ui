import MonacoEditor from 'react-monaco-editor'
import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { Badge, Button, Drawer, Form, Input, message, Space, Switch } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { RunStatusMap } from '@/utils/statusMap'
import { editDeviceServers } from '@/api'
import { DeviceServers } from '@/api/device-servers'

const { useForm } = Form
const { TextArea } = Input

interface FormType {
  instance_name: string
  image_name: string
  id: string
  protocol: string
  version: string
  operate_status: string
  docker_params_switch: boolean
  docker_params: string
  expertMode: boolean
  expertModeContent: string
}

export interface EditModalProps {
  onSuccess?: () => void
}

export interface EditModalRef {
  open: (record: DeviceServers) => void
}

export const EditModal = forwardRef<EditModalRef, EditModalProps>(({ onSuccess }, ref) => {
  const [form] = useForm<FormType>()
  const [record, setRecord] = useState<DeviceServers>()
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useImperativeHandle(ref, () => {
    return {
      open (record) {
        setRecord(record)
        setIsModalOpen(true)
        form.setFieldsValue({
          instance_name: record.name,
          id: record.deviceLibrary.id,
          image_name: record.deviceLibrary.name,
          protocol: record.deviceLibrary.protocol,
          version: record.deviceLibrary.version,
          operate_status: record.deviceLibrary.operate_status,
          docker_params_switch: record.dockerParamsSwitch,
          docker_params: record.dockerParams,
          expertMode: record.expertMode,
          expertModeContent: record.expertModeContent,
        })
      },
    }
  }, [])

  const handleClose = useCallback(() => {
    form.resetFields()
    setIsModalOpen(false)
  }, [form])

  return (
    <Drawer
      title={'编辑实例'}
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
              if (form.getFieldError('expertModeContent').length) return
              form.validateFields().then(values => {
                const { docker_params, docker_params_switch, expertMode, expertModeContent } = values
                setSubmitting(true)
                if (record?.id) {
                  editDeviceServers({
                    id: record.id,
                    docker_params: docker_params || '',
                    docker_params_switch,
                    expertMode,
                    expertModeContent: expertModeContent || '',
                  }).then(resp => {
                    if (resp?.success) {
                      handleClose()
                      onSuccess?.()
                      message.success({ content: '编辑成功' })
                    }
                  }).finally(() => {
                    setSubmitting(false)
                  })
                }

                console.log(values)
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
          name="instance_name"
          rules={[{ required: true, message: '请输入实例名称' }]}
        >
          <Input placeholder="请输入实例名称" disabled></Input>
        </Form.Item>
        <Form.Item
          label="镜像名称"
          name="image_name"
          validateFirst
          rules={[{ required: true, message: '请输入镜像名称' }]}
        >
          <Input placeholder="请输入镜像名称" disabled></Input>
        </Form.Item>
        <Form.Item
          label="镜像编号"
          name="id"
        >
          <Input placeholder="请输入镜像编号" disabled></Input>
        </Form.Item>
        <Form.Item
          label="协议"
          name="protocol"
        >
          <Input placeholder="请输入协议" disabled></Input>
        </Form.Item>
        <Form.Item
          label="版本"
          name="version"
          rules={[{ required: true, message: '请选择版本' }]}
        >
          <Input placeholder="请选择版本" disabled></Input>
        </Form.Item>
        <Form.Item
          label="状态"
          name="operate_status"
        >
          <Badge
            status={RunStatusMap[record?.runStatus!]?.status}
            text={RunStatusMap[record?.runStatus!]?.text}
          />
        </Form.Item>
        <Form.Item
          label="Docker启动参数"
          name="docker_params_switch"
          valuePropName="checked"
        >
          <Switch></Switch>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, nextValues) => {
            return prevValues.docker_params_switch !== nextValues.docker_params_switch
          }}
        >
          {({ getFieldValue }) => {
            return getFieldValue('docker_params_switch')
              ? (
                <Form.Item
                  name="docker_params"
                  rules={[{ required: true, message: '请输入Docker启动参数' }]}
                >
                  <TextArea placeholder="请输入Docker启动参数"></TextArea>
                </Form.Item>
              )
              : null
          }}
        </Form.Item>
        <Form.Item
          label="自定义参数"
          name="expertMode"
          valuePropName="checked"
        >
          <Switch></Switch>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, nextValues) => {
            return prevValues.expertMode !== nextValues.expertMode
          }}
        >
          {({ getFieldValue }) => {
            return getFieldValue('expertMode')
              ? (
                <Form.Item
                  name="expertModeContent"
                  rules={[{ required: true, message: '请输入参数' }]}
                >
                  <MonacoEditor
                    height="500"
                    language="json"
                    theme="vs-dark"
                    editorWillMount={(monaco) => {
                      monaco.editor.onDidChangeMarkers(([uri]) => {
                        const markers = monaco.editor.getModelMarkers({ resource: uri })
                        if (markers.length) {
                          form.setFields([{ name: 'expertModeContent', errors: ['请输入正确的 json 格式'], validating: true }])
                        }
                      })
                      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                        validate: true,
                        allowComments: true,
                      })
                    }}
                    // editorDidMount={(editor, monaco) => {
                    //   editor.onDidChangeModelDecorations(() => {
                    //     const model = editor.getModel()
                    //     const markers = monaco.editor.getModelMarkers(model)

                    //     console.log({ markers })
                    //   })
                    // }}
                  ></MonacoEditor>
                </Form.Item>
              )
              : null
          }}
        </Form.Item>
      </Form>
    </Drawer>
  )
})

export default EditModal
