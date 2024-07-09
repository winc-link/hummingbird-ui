import React, { useImperativeHandle, forwardRef, useState, useCallback } from 'react'
import { Form, Drawer, Input, Select, Button, Space, message } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { addThingModel } from '@/api'
import { getPropertyFormValue, getEventFormvalue, getActionFormvalue, getFillFormValue, TypeSpecMap } from './helper'
import { PropertyFormItem, EventFormItem, ActionFormItem } from './components'
import { ThingModelType, BaseThingModelType, ProductInfo, ProductThingModelType, DeatilModalFormValue } from './types'
// import { debounce } from 'lodash'
import { v4 } from 'uuid'
import './style.less'

const { useForm } = Form
const { TextArea } = Input
// const { Text } = Typography

export interface DetailModalProps {
  productInfo?: ProductInfo
  onSuccess?: () => void
}

export interface DetailModalRef {
  open: (record?: ProductThingModelType) => void
}

export const DetailModal = forwardRef<DetailModalRef, DetailModalProps>(({ productInfo, onSuccess }, ref) => {
  const [form] = useForm<DeatilModalFormValue>()
  const [record, setRecord] = useState<ProductThingModelType>()
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  // const [nameOptions, setNameOptions] = useState<Array<ProductThingModelType>>([])

  useImperativeHandle(ref, () => {
    return {
      open (row) {
        setIsModalOpen(true)
        form.setFieldValue('thing_model_type', 'property')
        fillForm(row)
        setRecord(row)
      },
    }
  }, [form])

  const fillForm = useCallback((record?: ProductThingModelType) => {
    if (!record) return

    form.setFieldsValue({
      thing_model_type: record?.type,
      name: record?.name,
      code: record?.code,
      description: record?.description,
    })

    console.log('record,', record)

    if (record.type === 'property') {
      form.setFieldsValue({
        access_model: record?.access_mode,
        type: record?.type_spec?.type,
      })

      const specType = record?.type_spec?.type
      const specs = JSON.parse(record?.type_spec?.specs || '{}')

      form.setFieldsValue(getFillFormValue(specs, specType))
    } else if (record.type === 'event') {
      form.setFieldsValue({
        event_type: record?.event_type,
        structObj: record?.output_params?.map(item => {
          return {
            ...item,
            id: v4(),
            struct_type: item?.type_spec?.type,
          }
        }),
      })
    } else {
      form.setFieldsValue({
        call_type: record?.call_type,
        structInput: record?.input_params?.map(item => {
          return {
            ...item,
            id: v4(),
            struct_type: item?.type_spec?.type,
          }
        }),
        structOutput: record?.output_params?.map(item => {
          return {
            ...item,
            id: v4(),
            struct_type: item?.type_spec?.type,
          }
        }),
      })
    }
  }, [])

  const handleClose = useCallback(() => {
    setIsModalOpen(false)
    // setNameOptions([])
    form.resetFields()
  }, [])

  return (
    <Drawer
      title={record ? '查看' : '添加自定义功能点'}
      placement="right"
      open={isModalOpen}
      width={550}
      closable={false}
      maskClosable={false}
      destroyOnClose={false}
      headerStyle={{ height: 51 }}
      onClose={handleClose}
      extra={<CloseOutlined onClick={handleClose} />}
      footer={
        <Space>
          {
            record
              ? <Button onClick={handleClose}>关闭</Button>
              : (
                <>
                  <Button
                    type="primary"
                    loading={submitting}
                    disabled={submitting}
                    onClick={async () => {
                      const formValue = await form.validateFields()
                      const thing_model_type: ThingModelType = formValue?.thing_model_type

                      console.log(formValue)

                      const result: BaseThingModelType = {
                        thing_model_type,
                        product_id: productInfo?.id,
                        name: formValue?.name,
                        code: formValue?.code,
                        description: formValue?.description,
                        tag: '自定义',
                      }

                      if (thing_model_type === 'property') {
                        result.property = getPropertyFormValue({ formValue, typeKey: 'type' }).property
                      } else if (thing_model_type === 'event') {
                        result.event = getEventFormvalue({ formValue }).event
                      } else if (thing_model_type === 'action') {
                        result.action = getActionFormvalue({ formValue }).action
                      }

                      console.log(result)
                      setSubmitting(true)
                      addThingModel(result)
                        .then(resp => {
                          if (resp.success) {
                            message.success('物模型添加成功')
                            handleClose()
                            if (typeof onSuccess === 'function') {
                              onSuccess()
                            }
                          } else {
                            message.error(resp?.errorMsg)
                          }
                        }).finally(() => {
                          setSubmitting(false)
                        })
                    }}
                  >确定</Button>
                  <Button onClick={handleClose}>取消</Button>
                </>
              )
          }
        </Space>
      }
    >
      <Form form={form} layout="vertical" disabled={!!record}>
        <Form.Item
          label="功能类型"
          name="thing_model_type"
          rules={[{ required: true, message: '请选择功能类型' }]}
        >
          <Select
            placeholder="请选择功能类型"
            options={[
              { value: 'property', label: '属性类型' },
              { value: 'event', label: '事件类型' },
              { value: 'action', label: '服务类型' },
            ]}
            onChange={() => {
              // setNameOptions([])
              form.setFieldValue('name', undefined)
            }}
          />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, nextValues) => prevValues.thing_model_type !== nextValues.thing_model_type}
        >
          {() => {
            return (
              <Form.Item
                label="功能名称"
                name="name"
                rules={[{ required: true, message: '请输入功能名称' }]}
                shouldUpdate={(prevValues, nextValues) => prevValues.thing_model_type !== nextValues.thing_model_type}
                // getValueFromEvent={(value) => {
                //   console.log(value)
                //   const lastInput = value[value.length - 1]
                //   try {
                //     return JSON.parse(lastInput).name || String(lastInput)
                //   } catch (error) {
                //     return lastInput
                //   }
                // }}
              >
                <Input placeholder="请输入功能名称"></Input>
                {/* <Select
                  showSearch
                  allowClear
                  mode="tags"
                  placeholder="请输入功能名称"
                  popupClassName="thingmodel-name-select"
                  style={{ width: '100%' }}
                  maxTagCount={10}
                  showArrow={false}
                  filterOption={false}
                  notFoundContent={null}
                  onSearch={debounce(async (value: string) => {
                    if (value) {
                      const { success, result } = await thingModelSystem<Array<ProductThingModelType>>({
                        modelName: value,
                        thingModelType: getFieldValue('thing_model_type'),
                      })
                      if (success) {
                        setNameOptions(result)
                      }
                    } else {
                      setNameOptions([])
                    }
                  }, 500)}
                  options={(nameOptions || []).map(({ id, name, tag, code }) => ({
                    value: JSON.stringify({ id, name }),
                    label: (
                      <>
                        <div className="mb10">
                          <Text type="secondary">{name}</Text>
                          <Tag className="ml10">{tag}</Tag>
                        </div>
                        <div>
                          <Text type="secondary">标识符: {code}</Text>
                        </div>
                      </>
                    ),
                  }))}
                /> */}
              </Form.Item>
            )
          }}
        </Form.Item>
        <Form.Item
          label="标识符"
          name="code"
          rules={[{ required: true, message: '请输入标识符' }]}
        >
          <Input placeholder="请输入标识符"></Input>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, nextValues) => prevValues.thing_model_type !== nextValues.thing_model_type}
        >
          {({ getFieldValue }) => {
            const thing_model_type: ThingModelType = getFieldValue('thing_model_type')

            if (thing_model_type === 'property') {
              return (
                <>
                  <PropertyFormItem
                    options={Object.entries(TypeSpecMap)?.map(([value, label]) => ({ label, value }))}
                    showView={!!record}
                  />
                  <Form.Item
                    label="读写类型"
                    name="access_model"
                    rules={[{ required: true, message: '请选择读写类型' }]}
                  >
                    <Select
                      placeholder="请选择读写类型"
                      options={[
                        { label: '读', value: 'R' },
                        { label: '读写', value: 'RW' },
                      ]}
                    ></Select>
                  </Form.Item>
                </>
              )
            }

            if (thing_model_type === 'event') {
              return <EventFormItem showView={!!record}/>
            }

            if (thing_model_type === 'action') {
              return <ActionFormItem showView={!!record}/>
            }

            return null
          }}
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

export default DetailModal
