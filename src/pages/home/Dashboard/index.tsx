import React, { useCallback, useEffect, useState } from 'react'
import Overview from './components/Overview'
// import GatewayInformation from './components/GatewayInformation'
// import NetworkInfo from './components/NetworkInfo'
import DeviceMessages from './components/DeviceMessages'
import QuickNavigation from './components/QuickNavigation'
import AlertPlateCard from './components/AlertPlate'
// import RelatedDocsCard from './components/RelatedDocs'
import { HomePageInfo } from './types'
import { getHomePageInfo } from '@/api'
import './index.less'
import { Row, Col } from 'antd'

interface DashboardProps {
}

const Dashboard: React.FC<DashboardProps> = () => {
  const [homePageInfo, setHomePageInfo] = useState<HomePageInfo>()

  const loadHomePageInfo = useCallback(() => {
    getHomePageInfo<HomePageInfo>()
      .then((resp) => {
        if (resp.success) {
          setHomePageInfo({
            ...resp.result,
            msg_gather: resp.result.msg_gather.reverse(),
          })
        }
      }).catch((err: any) => {
        console.log(err)
      })
  }, [])

  useEffect(() => {
    loadHomePageInfo()
  }, [])

  return (<div className="dashboard">
    <Row gutter={[20, 20]}>
      <Col span={24} xl={{
        span: 18,
        // order: 0,
      }} xxl={18}>
        <Overview pageInfo={homePageInfo?.pageInfo} />
        {/* <div className="mt20">
          <Row gutter={[20, 20]}>
            <Col span={24} lg={12}>
              <GatewayInformation
                gatewayInfo={homePageInfo?.gatewayInfo}
              />
            </Col>
            <Col span={24} lg={12}>
              <NetworkInfo
                netWorkInfo={homePageInfo?.netWorkInfo}
              />
            </Col>
          </Row>
        </div> */}
        <div className="mt20">
          {homePageInfo?.msg_gather
            && <DeviceMessages msgGatherList={homePageInfo?.msg_gather} />
          }
        </div>
      </Col>
      <Col span={24} xl={{
        span: 6,
        // order: 0,
      }} xxl={6}>
        <QuickNavigation quickNavigationList={homePageInfo?.quickNavigation} />
        <div className="mt20">
          {homePageInfo?.alertPlate
            && <AlertPlateCard alertPlateList={homePageInfo?.alertPlate} />
          }
        </div>
        {/* <div className="mt20">
          <RelatedDocsCard relatedDocs={homePageInfo?.docs} />
        </div> */}
      </Col>
    </Row>
  </div>)
}

export default Dashboard
