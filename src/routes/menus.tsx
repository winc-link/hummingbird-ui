import React from 'react'
// import { MenuProps } from 'antd'
import { DashboardOutlined, GlobalOutlined, FieldTimeOutlined, FunctionOutlined, BookOutlined } from '@ant-design/icons'

import type { MenuItemType, SubMenuType } from 'antd/es/menu/hooks/useItems'

// interface IMenuPropsItems extends Pick<MenuProps, 'items'> {
//   children?: MenuProps['items']
// }

const menus = [
  {
    label: '首页',
    key: '/home/dashboard',
    icon: <DashboardOutlined />,
  },
  {
    label: '设备接入',
    key: '/gateway',
    icon: <GlobalOutlined />,
    children: [
      { label: '产品管理', key: '/gateway/product/manage' },
      { label: '设备管理', key: '/gateway/device/manage' },
      { label: '驱动镜像', key: '/gateway/drive/image' },
      { label: '我的驱动', key: '/gateway/my/drive' },
    ],
  },
  // {
  //   label: '云插件',
  //   key: '/cloud',
  //   icon: <ApiOutlined />,
  //   children: [
  //     { label: '插件市场', key: '/cloud/service' },
  //     { label: '我的插件', key: '/cloud/my/service' },
  //   ],
  // },
  {
    label: '运维监控',
    key: '/monitor',
    icon: <FieldTimeOutlined />,
    children: [
      { label: '系统监控', key: '/monitor/systemMonitor' },
      { label: '告警中心', key: '/monitor/alarmCenter/list' },
    ],
  },
  {
    label: '高级能力',
    key: '/advanced',
    icon: <FunctionOutlined />,
    children: [
      { label: '资源管理', key: '/advanced/resource/manage' },
      { label: '规则引擎', key: '/advanced/rule/engine' },
      { label: '场景联动', key: '/advanced/scene/linkage' },
    ],
  },
  {
    label: '工具与文档',
    key: '/documents/documents',
    icon: <BookOutlined />,
  },
]

const breadcrumbNameMap: Record<string, string> = {}

function loop (arr: SubMenuType[]) {
  arr?.forEach(item => {
    const { key, label, children } = item
    breadcrumbNameMap[key] = label as string
    if (Array.isArray(children)) {
      loop(children as SubMenuType[])
    }
  })
}

loop(menus as SubMenuType[])

export type { MenuItemType, SubMenuType }

export {
  menus,
  breadcrumbNameMap,
}
