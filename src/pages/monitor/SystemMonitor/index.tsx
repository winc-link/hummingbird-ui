import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { NormalBreadcrumb } from '@/components/Breadcrumb'
import { Card, Form, Select } from 'antd'
import { getMetrics } from '@/api'
import { MetricsList } from './types'
import { Area } from '@ant-design/plots'
import './style.less'
import { useForm } from 'antd/es/form/Form'

interface SystemMonitorProps {}

const config = {
  xField: 'time',
  yField: 'value',
  smooth: true,
  xAxis: {
    range: [0, 1],
  },
}

// const config1 = {
//   xField: 'time',
//   yField: 'value',
//   seriesField: 'type',
//   smooth: true,
//   xAxis: {
//     range: [0, 1],
//   },
//   // label: {
//   //   offsetY: -6,
//   //   style: {
//   //     fill: 'rgb(3, 104, 219)',
//   //   },
//   //   formatter: (v: any) => {
//   //     return v.value + 'MB'
//   //   },
//   // },
//   // point: {
//   //   size: 3,
//   //   shape: 'circle',
//   //   style: {
//   //     fill: 'white',
//   //     stroke: '#5B8FF9',
//   //     lineWidth: 2,
//   //   },
//   // },
// }

const SystemMonitor: React.FC<SystemMonitorProps> = () => {
  // const [networkData, setNetworkData] = useState<NetworkList>()
  const [metricsData, setMetricsData] = useState<MetricsList>()
  const [selectedTime, setSelectedTime] = useState<string>('hour')
  // const [selectedIface, setSelectedIface] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [formRef] = useForm()

  // 时间戳转换
  function timestampToTimeString (timestamp: number): string {
    const date = new Date(timestamp)
    const timeString = date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    return timeString
  }

  // 选择时间
  const handleChangeTime = (selectedTime: any) => {
    setSelectedTime(selectedTime)
    formRef.setFieldValue('metrics_type', selectedTime)
    loadMetrics({ metrics_type: selectedTime })
  }

  // 选择网卡
  // const handleChangeIface = (selectedIface: any) => {
  //   setSelectedIface(selectedIface)
  //   loadMetrics({ iface: selectedIface, metrics_type: selectedTime })
  // }

  // 获取所有网卡接口
  // const loadNetwork = useCallback(() => {
  //   setLoading(true)
  //   getNetwork<NetworkList>()
  //     .then((resp) => {
  //       if (resp.success) {
  //         setNetworkData(resp.result)
  //         setSelectedIface(resp.result?.list[0].ncId)
  //         loadMetrics({
  //           metrics_type: 'hour',
  //           iface: resp.result?.list[0].ncId,
  //         })
  //       }
  //     }).catch((err: any) => {
  //       console.log(err)
  //     }).finally(() => setLoading(false))
  // }, [])

  // 获取数据接口
  const loadMetrics = useCallback(
    ({ metrics_type }: { metrics_type: string }) => {
      setLoading(true)
      getMetrics<MetricsList>({ metrics_type })
        .then((resp) => {
          if (resp.success) {
            // eslint-disable-next-line no-lone-blocks
            {
              setMetricsData(resp.result)
            }
          }
        })
        .catch((err: any) => {
          console.log(err)
        })
        .finally(() => setLoading(false))
    },
    [],
  )

  const MemoryUsed = useMemo(
    () =>
      metricsData?.metrics.map((item) => ({
        time: timestampToTimeString(item.timestamp),
        value: Number((item.memory_used / (1024 * 1024)).toFixed(2)),
      })),
    [metricsData],
  )
  const CpuUsed = useMemo(
    () =>
      metricsData?.metrics.map((item) => ({
        time: timestampToTimeString(item.timestamp),
        value: Number(item.cpu_used_percent.toFixed(2)),
      })),
    [metricsData],
  )
  const DiskUsed = useMemo(
    () =>
      metricsData?.metrics.map((item) => ({
        time: timestampToTimeString(item.timestamp),
        value: Number(item.disk_used_percent.toFixed(2)),
      })),
    [metricsData],
  )
  const Openfiles = useMemo(
    () =>
      metricsData?.metrics.map((item) => ({
        time: timestampToTimeString(item.timestamp),
        value: item.openfiles,
      })),
    [metricsData],
  )
  // const networkTran = useMemo(() => {
  //   const netSend = metricsData?.metrics.map(item => ({
  //     time: timestampToTimeString(item.timestamp),
  //     value: Number((item.net_sent_bytes / 1024).toFixed(2)),
  //     type: '网络发送',
  //   })) || []
  //   const netRecv = metricsData?.metrics.map(item => ({
  //     time: timestampToTimeString(item.timestamp),
  //     value: Number((item.net_recv_bytes / 1024).toFixed(2)),
  //     type: '网络接收',
  //   })) || []
  //   return [...netSend, ...netRecv]
  // }, [metricsData])

  useEffect(() => {
    // loadNetwork()
    loadMetrics({
      metrics_type: 'hour',
    })
  }, [])

  return (
    <>
      <NormalBreadcrumb></NormalBreadcrumb>
      <Card className="m20" size="small" loading={loading}>
        <Form
          layout="inline"
          initialValues={{
            metrics_type: selectedTime,
            // iface: networkData?.list[0].ncId,
          }}
          form={formRef}
        >
          <Form.Item key="metrics_type" name="metrics_type" label="查看最近：">
            <Select
              style={{ width: 120 }}
              // value={selectedTime}
              onChange={handleChangeTime}
              options={[
                { value: 'hour', label: '一小时' },
                { value: 'halfday', label: '十二小时' },
                { value: 'day', label: '二十四小时' },
              ]}
            />
          </Form.Item>
          {/* <Form.Item key="iface" name="iface" label="网卡名称：">
          <Select
            style={{ width: 120 }}
            options={networkData?.list.map(({ ncId }) => ({ value: ncId, label: ncId }))}
            onChange={handleChangeIface}
          />
        </Form.Item> */}
        </Form>
      </Card>
      <Card className="m20" size="small">
        <div className="systemMonitor-card__title">内存使用</div>
        <Area
          height={500}
          data={(MemoryUsed || []) as Record<string, any>[]}
          yAxis={{
            label: {
              formatter: (v) => v + 'MB',
            },
          }}
          {...config}
        />
      </Card>
      <Card className="m20" size="small">
        <div className="systemMonitor-card__title">CPU使用率</div>
        <Area
          height={500}
          data={(CpuUsed || []) as Record<string, any>[]}
          yAxis={{
            label: {
              formatter: (v) => v + '%',
            },
          }}
          {...config}
        />
      </Card>
      <Card className="m20" size="small">
        <div className="systemMonitor-card__title">磁盘使用率</div>
        <Area
          height={500}
          data={(DiskUsed || []) as Record<string, any>[]}
          yAxis={{
            label: {
              formatter: (v) => v + '%',
            },
          }}
          {...config}
        />
      </Card>
      <Card className="m20" size="small">
        <div className="systemMonitor-card__title">文件打开数</div>
        <Area
          height={500}
          data={(Openfiles || []) as Record<string, any>[]}
          {...config}
        />
      </Card>
      {/* <Card className="m20" size="small">
      <div className="systemMonitor-card__title">网络收发 ({selectedIface})</div>
      <Area
        height={500}
        data={(networkTran || []) as Record<string, any>[]}
        yAxis={{
          label: {
            formatter: (v) => v + 'KB',
          },
        }}
        {...config1} />
    </Card> */}
    </>
  )
}

export default SystemMonitor
