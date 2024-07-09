import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { Button, Drawer, Form, Input, Space } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { TypeSpecMap } from '../helper'
import { PropertyFormItem } from './PropertyFormItem'
import { DeatilModalFormValue, ThingModelUnit } from '../types'
import { v4 } from 'uuid'
import { thingModelUnit } from '@/api'

const { useForm } = Form

const options = Object.entries(TypeSpecMap)
  .filter(([value]) => value !== 'array' && value !== 'struct')
  .map(([value, label]) => ({ label, value }))

export interface StructFormProps {
  onAdd: (data: any) => void
}

export interface StructFormRef {
  open: (params?: object, readonly?: boolean) => void
}

export const StructForm = forwardRef<StructFormRef, StructFormProps>(({ onAdd }, ref) => {
  const [form] = useForm<DeatilModalFormValue>()
  const [id, setId] = useState('')
  const [submitting] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [readonly, setReadonly] = useState<boolean>(false)

  useImperativeHandle(ref, () => {
    return {
      open (record: any, readonly?: boolean) {
        setReadonly(!!readonly)
        setIsModalOpen(true)
        if (record) {
          console.log('record', record)
          setId(record?.id)
          const typespec = record?.type_spec || record?.typespec
          let specs = typespec?.specs || {}
          if (typeof specs === 'string') {
            try {
              specs = JSON.parse(specs)
            } catch (error) {
              console.error(error)
              specs = {}
            }
          }
          const value = {
            ...record,
            ...specs,
          }
          if (typespec?.type === 'enum') {
            value.enumObject = Object.entries(specs).map(([key, value]) => ({ id: v4(), keyName: v4(), key, valueName: v4(), value }))
          }
          console.log('value', value)
          form.setFieldsValue(value)
          if (specs?.unitName && (typespec?.type === 'int' || typespec?.type === 'float')) {
            thingModelUnit<ThingModelUnit>({ isAll: true }).then(resp => {
              if (resp.success && Array.isArray(resp.result.list)) {
                const { id, symbol, unit_name } = resp.result.list.find((item) => item.unit_name === specs.unitName) || {}
                const unitObj = JSON.stringify({ id, symbol, unit_name })
                form.setFieldValue('unitObj', unitObj)
              }
            })
          }
        } else {
          setId('')
        }
      },
    }
  }, [])

  const handleClose = useCallback(() => {
    form.resetFields()
    setIsModalOpen(false)
  }, [form])

  return (
    <Drawer
      title={readonly ? '查看结构体参数' : '添加结构体参数'}
      placement="right"
      open={isModalOpen}
      width={500}
      closable={false}
      maskClosable={false}
      destroyOnClose={false}
      headerStyle={{ height: 51 }}
      extra={<CloseOutlined onClick={handleClose} />}
      onClose={handleClose}
      footer={
        <Space>
          <Button
            type="primary"
            loading={submitting}
            disabled={submitting}
            onClick={async () => {
              const resp = await form.validateFields()
              onAdd({ id: id || v4(), ...resp })
              handleClose()
            }}
          >确定</Button>
          <Button onClick={handleClose}>取消</Button>
        </Space>
      }
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="参数名称"
          name="name"
          rules={[{ required: true, message: '请输入参数名称' }]}
        >
          <Input placeholder="请输入参数名称"></Input>
        </Form.Item>
        <Form.Item
          label="标识符"
          name="code"
          rules={[{ required: true, message: '请输入标识符' }]}
        >
          <Input placeholder="请输入标识符"></Input>
        </Form.Item>
        <PropertyFormItem prefix="struct_" options={options} />
      </Form>
    </Drawer>
  )
})
