import React, { useImperativeHandle, forwardRef, useState, useCallback, useRef } from 'react'
import { Button, Drawer, Form, Input, Space, Table, Typography } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { categoryTemplate } from '@/api'
import { useTableRequest } from '@/hooks'
import { CategoryTemplate } from './types'
import { StandardFuncModal, StandardFuncModalRef } from './StandardFuncModal'

const { Text } = Typography

export interface CategoryModalRef {
  open: () => void
}

export interface CategoryModalProps {
  onChange?: (record: CategoryTemplate) => void
}

export const CategoryModal = forwardRef<CategoryModalRef, CategoryModalProps>(({ onChange }, ref) => {
  const standardFuncModalRef = useRef<StandardFuncModalRef>(null)

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const { loading, dataSource, pagination, form, reset, search } = useTableRequest<CategoryTemplate>({
    onRequest: categoryTemplate,
  })

  useImperativeHandle(ref, () => {
    return {
      open () {
        setIsModalOpen(true)
      },
    }
  }, [])

  const handleClose = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  return (
    <Drawer
      title={'选择品类'}
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
          <Button onClick={handleClose}>取消</Button>
        </Space>
      }
    >
      <StandardFuncModal
        ref={standardFuncModalRef}
      />
      <Form layout="inline" form={form} className="mb20">
        <Form.Item key="category_name" name="category_name">
          <Input placeholder="输入品类名称"></Input>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={search}>查询</Button>
        </Form.Item>
        <Form.Item>
          <Button type="default" onClick={reset}>重置</Button>
        </Form.Item>
      </Form>
      <Table
        loading={loading}
        dataSource={dataSource}
        pagination={{ ...pagination, showSizeChanger: false, showQuickJumper: false }}
        bordered
        rowKey="id"
        size="small"
        columns={[
          { title: '品类名称', key: 'category_name', dataIndex: 'category_name' },
          { title: '所属场景', key: 'scene', dataIndex: 'scene' },
          {
            title: '操作',
            key: 'action',
            dataIndex: 'action',
            render (value, record) {
              return (
                <Space split={<Text type="secondary">/</Text>}>
                  <Typography.Link
                    onClick={() => {
                      onChange?.(record)
                      handleClose()
                    }}
                  >选择</Typography.Link>
                  <Typography.Link
                    onClick={() => {
                      standardFuncModalRef.current?.open(record.category_key)
                    }}
                  >查看标准物模型</Typography.Link>
                </Space>
              )
            },
          },
        ]}
      />
    </Drawer>
  )
})
