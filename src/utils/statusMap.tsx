import React from 'react'
import { BadgeProps, TagProps } from 'antd'
import { SyncOutlined, ClockCircleOutlined, CheckCircleOutlined, CheckCircleTwoTone, MinusCircleFilled } from '@ant-design/icons'
import { ServiceItemType } from '@/pages/cloud/Service'

export const OperateStatusMap: {
  [key in ServiceItemType['operate_status']]: {
    text: string
    status: BadgeProps['status']
    icon: TagProps['icon']
    color: TagProps['color']
  }
} = {
  installing: { text: '下载中', status: 'processing', color: 'processing', icon: <SyncOutlined spin /> },
  default: { text: '未下载', status: 'default', color: 'default', icon: <ClockCircleOutlined /> },
  installed: { text: '已下载', status: 'success', color: 'processing', icon: <CheckCircleOutlined /> },
  uninstall: { text: '已卸载', status: 'warning', color: 'default', icon: <ClockCircleOutlined /> },
}

export const RunStatusMap: {
  [key: string]: {
    text: string
    status: BadgeProps['status']
  }
} = {
  1: { text: '运行中', status: 'success' },
  2: { text: '停止', status: 'default' },
  3: { text: '启动中', status: 'processing' },
  4: { text: '停止中', status: 'default' },
  5: { text: '异常', status: 'error' },
}

export const RuleStatusMap: {
  [key: string]: {
    text: string
    status: BadgeProps['status']
    icon: TagProps['icon']
  }
} = {
  running: { text: '启用', status: 'success', icon: <CheckCircleTwoTone /> },
  stopped: { text: '禁用', status: 'default', icon: <MinusCircleFilled /> },
}
