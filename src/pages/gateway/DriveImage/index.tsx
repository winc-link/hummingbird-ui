import React from 'react'
import { Tabs, Card } from 'antd'
import { AdvanceBreadcrumb } from '@/components/Breadcrumb'
import CustomDrive from './CustomDrive'
import DriveMarket from './DriveMarket'
import './style.less'

export interface DriveImageProps {

}

export interface ProductType {
  id: string
  product_id: string
  name: string
  node_type: string
  platform: string
  created_at: number
  category_name: string
}

// const NodeTypeMap: {[key: string]: string} = {
//   0: '未知类型',
//   1: '网关',
//   2: '直连设备',
//   3: '网管子设备',
// }

const DriveImage: React.FC<DriveImageProps> = () => {
  return (
    <>
      <AdvanceBreadcrumb
        title="驱动镜像"
        describe="驱动镜像是用户编写程序最终打包成可下载的docker镜像，它是实体设备与物联网平台通讯的桥梁，所有的设备数据由驱动上报到物联网平台，所有的设备控制指令由物联网平台下发给驱动。"
        background={require('@/assets/images/head-bg.8b029587.png')}
      />
      <Card bodyStyle={{ padding: 0 }}>
        <Tabs
          className="drive-image mt20"
          type="card"
          items={[
            {
              key: '1',
              label: '自定义',
              children: <CustomDrive></CustomDrive>,
            },
            {
              key: '2',
              label: '驱动市场',
              children: <DriveMarket></DriveMarket>,
            },
          ]}
        />
      </Card>
    </>
  )
}

export default DriveImage
