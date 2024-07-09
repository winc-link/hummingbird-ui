import React from 'react'
import { createBrowserRouter } from 'react-router-dom'

import App from '@/App'
import ServiceMarket from '@/pages/cloud/Service'
import MyService from '@/pages/cloud/MyService'
import ProductManage from '@/pages/gateway/ProductManage'
import ProductDetail from '@/pages/gateway/ProductManage/Detail'
import DeviceManage from '@/pages/gateway/DeviceManage'
import DeviceDetail from '@/pages/gateway/DeviceManage/Detail'
import MyDrive from '@/pages/gateway/MyDrive'
import DriveImage from '@/pages/gateway/DriveImage'
import Dashboard from '@/pages/home/Dashboard'
import AlarmCenter from '@/pages/monitor/AlarmCenter'
import SystemMonitor from '@/pages/monitor/SystemMonitor'
import RuleDetail from '@/pages/monitor/AlarmCenter/Detail'
import Login from '@/pages/auth/login/index'
import ResourceManage from '@/pages/advanced/ResourceManage'
import RuleEngine from '@/pages/advanced/RuleEngine'
import SceneLinkage from '@/pages/advanced/SceneLinkage'
import LinkageLog from '@/pages/advanced/SceneLinkage/LinkageLog'
import Documents from '@/pages/documents/Documents'
import { Empty } from 'antd'

const router = createBrowserRouter([
  {
    path: '/auth/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/cloud/service',
        element: <ServiceMarket />,
      },
      {
        path: '/cloud/my/service',
        element: <MyService />,
      },
      {
        path: '/gateway/product/manage',
        element: <ProductManage />,
      },
      {
        path: '/gateway/product/detail/:id',
        element: <ProductDetail />,
      },
      {
        path: '/gateway/device/manage',
        element: <DeviceManage />,
      },
      {
        path: '/gateway/device/manage/:id',
        element: <DeviceManage />,
      },
      {
        path: '/gateway/device/detail/:id',
        element: <DeviceDetail />,
      },
      {
        path: '/gateway/drive/image',
        element: <DriveImage />,
      },
      {
        path: '/gateway/my/drive',
        element: <MyDrive />,
      },
      {
        path: '/home/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/monitor/alarmCenter/list',
        element: <AlarmCenter />,
      },
      {
        path: '/monitor/systemMonitor',
        element: <SystemMonitor />,
      },
      {
        path: '/monitor/alarmCenter/detail/:id',
        element: <RuleDetail />,
      },
      {
        path: '/advanced/resource/manage',
        element: <ResourceManage />,
      },
      {
        path: '/advanced/rule/engine',
        element: <RuleEngine />,
      },
      {
        path: '/advanced/scene/linkage',
        element: <SceneLinkage />,
      },
      {
        path: '/advanced/scene/log/:id',
        element: <LinkageLog />,
      },
      {
        path: '/documents/documents',
        element: <Documents />,
      },
    ],
  },
  {
    path: '*',
    element: <Empty description={'404 Not Found'} style={{ marginTop: '300px' }}/>,
  },
])

export default router
