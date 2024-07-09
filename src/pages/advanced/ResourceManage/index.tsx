import React from 'react'
import { Tabs, Card } from 'antd'
import { AdvanceBreadcrumb } from '@/components/Breadcrumb'
import HttpPush from './HttpPush1'
import MessageMQTT from './MessageMQTT'
import MessageKafka from './MessageKafka'
import InfluxDB from './InfluxDB'
import TDengine from './TDengine'
import { getTypeResource } from '@/api'
import useRequest from '@/hooks/useRequest'
// import Redis from './Redis'

export interface ResourceManageProps {

}

enum typeEnum {
  HTTP推送 = 'HTTP推送',
  消息对队列MQTT = '消息对队列MQTT',
  消息队列Kafka = '消息队列Kafka',
  InfluxDB = 'InfluxDB',
  TDengine = 'TDengine',
}

const typeComponent = {
  [typeEnum.HTTP推送]: <HttpPush/>,
  [typeEnum.消息对队列MQTT]: <MessageMQTT/>,
  [typeEnum.消息队列Kafka]: <MessageKafka/>,
  [typeEnum.InfluxDB]: <InfluxDB/>,
  [typeEnum.TDengine]: <TDengine/>,
}

const ResourceManage: React.FC<ResourceManageProps> = () => {
  const typeResource = useRequest(getTypeResource)
  // console.log('typeResource', typeResource)
  return (
    <>
      <AdvanceBreadcrumb
        title="资源管理"
        describe="平台提供多种消息通信中间件资源，资源可作为规则引擎的消息目的地，通过创建资源快速将数据推送至应用平台。"
        background={require('@/assets/images/head-bg.8b029587.png')}
      />
      <Card bodyStyle={{ padding: 0 }}>
        <Tabs
          className="drive-image mt20"
          type="card"
          items={(typeResource.data || []).map((label: typeEnum, key: number) => ({
            key,
            label,
            children: typeComponent[label],
          }))}
        />
      </Card>
    </>
  )
}

export default ResourceManage
