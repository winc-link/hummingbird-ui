export interface PageInfo {
  product: {
    total: number
    self: number
    other: number
  },
  device: {
    total: number
    self: number
    other: number
  },
  cloudInstance: {
    count: number
    instanceName: string
    status: string
    run_count: string
    stop_count: string
  },
  alert: {
    total: number
  }
}

export interface GatewayInfo {
  gatewayStatus: boolean
  gatewayId: string
  activeTime: string
  versionNumber: string
  maxDevice: number
  deviceCount: number
}

export interface NetWorkInfo {
  newWork: {
    ncId: string
    localIp: string
    gwIp: string
    smIp: string
    netlink: boolean
  }[]
  dns: string
}

export interface MsgGather {
  count: number
  date: string
}

export interface QuickNavigation {
  name: string
  icon: string
}

export interface AlertPlate {
  count: number
  alert_level: string
}

export interface RelatedDocs {
  more: string
  info: {
    name: string
    jumpLink: string
  }[]
}

export interface HomePageInfo {
  pageInfo: PageInfo
  gatewayInfo: GatewayInfo
  netWorkInfo: NetWorkInfo
  msg_gather: MsgGather[]
  quickNavigation: QuickNavigation[]
  alertPlate: AlertPlate[]
  docs: RelatedDocs
}
