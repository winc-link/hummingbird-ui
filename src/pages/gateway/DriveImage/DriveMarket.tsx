import React from 'react'
import { Avatar, Card, Empty, Form, Pagination, Typography } from 'antd'
import { AntDesignOutlined } from '@ant-design/icons'
import { getDeviceLibraries } from '@/api'
import { DeviceLibraries } from '@/api/device-libraries'
import { useTableRequest } from '@/hooks'
import WebSocketProvider from '@/components/WebSocket'
// import UpdateModal from './UpdateModal'

const { Meta } = Card
const { Text } = Typography

export interface DriveMarketProps {

}

const DriveMarket: React.FC<DriveMarketProps> = () => {
  // const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])

  const { dataSource, pagination, form } = useTableRequest<DeviceLibraries>({
    onRequest: (params) => getDeviceLibraries({ ...params, is_internal: true }),
  })

  return (
    <div className="drive-market p20 pt0">
      <Form form={form}></Form>
      {
        dataSource.length
          ? (
            <div className="responsive-layout">
              {
                dataSource.map(item => {
                  return (
                    <Card
                      key={item.id}
                      className="card-item"
                      actions={[
                        <Text
                          onClick={() => {
                            window.open(item.manual)
                          }}
                        >详情</Text>,
                        // <Text>下载</Text>,
                        // <UpdateModal
                        //   record={item}
                        //   selectedRowKeys={selectedRowKeys}
                        //   onFinish={reload}
                        //   onChange={(id) => {
                        //     setSelectedRowKeys([id])
                        //   }}
                        // ></UpdateModal>,
                      ]}
                    >
                      <Meta
                        avatar={<Avatar icon={<AntDesignOutlined />}/>}
                        title={item.name}
                        description={item.description || '暂无描述'}
                      />
                    </Card>
                  )
                })
              }
            </div>
          )
          : <Empty description="暂无数据" />
      }

      <div className="justify-flex-end mt20">
        <Pagination {...pagination}></Pagination>
      </div>
    </div>
  )
}

export default () => (
  <WebSocketProvider>
    <DriveMarket></DriveMarket>
  </WebSocketProvider>
)
