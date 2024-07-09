import React, { useMemo } from 'react'
import { Tabs, Card } from 'antd'
import { AdvanceBreadcrumb } from '@/components/Breadcrumb'
import AlarmList from './AlarmList'
import AlarmRules from './AlarmRules'
import './style.less'
// import { ReloadOutlined } from '@ant-design/icons'

export interface AlarmCenterProps {

}

const AlarmCenterList: React.FC<AlarmCenterProps> = () => {
  const activeKey = useMemo(() => {
    const hash = window.location.hash
    if (hash) {
      return hash.slice(1, 2)
    }
    return '1'
  }, [])

  return (
    <>
      <AdvanceBreadcrumb
        title="告警中心"
        describe="平台提供监控告警功能，用户可以针对自己关心的业务指标设置告警规则，当监控指标满足条件触发后，支持以告警列表、钉钉机器人、微信机器人等方式通知用户，帮助用户快速处理故障，避免业务损失。"
        background={require('@/assets/images/head-bg.8b029587.png')}
      />
      <Card bodyStyle={{ padding: 0 }}>
        <Tabs
          className="drive-image mt20"
          type="card"
          defaultActiveKey={activeKey}
          // tabBarExtraContent={<Button className="ml10"
          //   onClick={() => {
          //     window.location.reload()
          //   }}
          // ><ReloadOutlined />刷新</Button>}
          items={[
            {
              key: '1',
              label: '告警列表',
              children: <AlarmList></AlarmList>,
            },
            {
              key: '2',
              label: '告警规则',
              children: <AlarmRules></AlarmRules>,
            },
          ]}
          onTabClick={(key) => {
            window.location.hash = key
          }}
        />
      </Card>
    </>
  )
}

export default AlarmCenterList
