export interface Network {
  ncId: string
}

export interface NetworkList {
  list: Network[]
}

export interface Metrics {
  timestamp: number
  cpu_used_percent: number,
  memory_used: number,
  disk_used_percent: number,
  net_sent_bytes: number,
  net_recv_bytes: number,
  openfiles: number
}

export interface MetricsList {
  metrics: Metrics[]
}
