import React, { useImperativeHandle, forwardRef, useState, useMemo, useRef } from 'react'
import { Drawer, Button, Space, Typography, Popconfirm, Table, message } from 'antd'
import { CloseOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons'
import { deleteDockerConfigs, getDockerConfigs } from '@/api'
import { useTableRequest } from '@/hooks'
import { AddImageModal, AddImageModalRef } from './AddImageModal'

const { Text, Link } = Typography

export interface DockerConfigs {
  id: string
  address: string
  account: string
}

export interface DockerConfigModalProps {
  disabled?: boolean
  value?: React.Key
  onChange?: (value?: React.Key) => void
}

export interface DockerConfigModalRef {
  open: () => void
}

export const DockerConfigModal = forwardRef<DockerConfigModalRef, DockerConfigModalProps>(({ value, disabled, onChange }, ref) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([value!])
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const addImageModalRef = useRef<AddImageModalRef>(null)

  const { loading, dataSource, pagination, reload } = useTableRequest<DockerConfigs>({
    onRequest: getDockerConfigs,
  })

  const selectText = useMemo(() => {
    return dataSource.find(i => i.id === selectedRowKeys[0])?.address
  }, [dataSource, selectedRowKeys])

  useImperativeHandle(ref, () => {
    return {
      open () {
        setIsModalOpen(true)
      },
    }
  }, [])

  return (
    <>
      <Drawer
        title="镜像仓库管理"
        placement="right"
        open={isModalOpen}
        width={600}
        closable={false}
        maskClosable={false}
        headerStyle={{ height: 51 }}
        destroyOnClose
        extra={<CloseOutlined onClick={() => { setIsModalOpen(false) }} />}
        footer={
          <Space>
            <Button
              type="primary"
              onClick={() => {
                onChange?.(selectedRowKeys[0])
                setIsModalOpen(false)
              }}
            >确定</Button>
            <Button
              onClick={() => {
                setIsModalOpen(false)
              }}
            >取消</Button>
          </Space>
        }
        onClose={() => {
          setIsModalOpen(false)
        }}
      >
        <AddImageModal ref={addImageModalRef} onFinish={reload}></AddImageModal>
        <Button
          className="mb15"
          type="primary"
          onClick={() => {
            addImageModalRef.current?.open()
          }}
        ><PlusOutlined />新增</Button>
        <Table
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          bordered
          rowKey="id"
          size="small"
          scroll={{ x: 'max-content' }}
          rowSelection={{
            type: 'radio',
            fixed: true,
            selectedRowKeys,
            onChange (value) {
              setSelectedRowKeys(value)
            },
          }}
          columns={[
            { title: '编号', key: 'id', dataIndex: 'id' },
            { title: '镜像地址', key: 'address', dataIndex: 'address' },
            { title: '账号', key: 'account', dataIndex: 'account' },
            {
              title: '操作',
              key: 'action',
              dataIndex: 'action',
              width: 100,
              fixed: 'right',
              render (value, record) {
                return (
                  <Space split={<Text type="secondary">/</Text>}>
                    <Typography.Link
                      onClick={() => {
                        addImageModalRef.current?.open(record)
                      }}
                    >编辑</Typography.Link>
                    <Popconfirm
                      title="此操作将永久删除该条记录, 是否继续?"
                      okText="确定"
                      cancelText="取消"
                      placement="topRight"
                      onConfirm={() => {
                        deleteDockerConfigs(record?.id)
                          .then(resp => {
                            if (resp.success) {
                              message.success('删除成功')
                              reload()
                            } else {
                              message.error(resp.errorMsg)
                            }
                          })
                      }}
                    >
                      <Typography.Link>删除</Typography.Link>
                    </Popconfirm>
                  </Space>
                )
              },
            },
          ]}
        />
      </Drawer>
      {
        disabled
          ? <Text disabled>{selectText}</Text>
          : <Link
            onClick={() => {
              setIsModalOpen(true)
            }}
          >
            { selectText ? <>{selectText}<EditOutlined className="ml10" /></> : '请选择仓库镜像' }
          </Link>
      }

    </>
  )
})

export default DockerConfigModal
