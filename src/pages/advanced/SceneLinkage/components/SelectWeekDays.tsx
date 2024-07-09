import React, { useEffect, useState } from 'react'
import { Button, Space, TimePicker } from 'antd'
import { CompoundedComponent } from 'antd/es/float-button/interface'
import dayjs from 'dayjs'

interface ICronObj {
  mm: string;
  hh: string;
  dd: string;
  MM: string;
  weekdays: string[];
}

interface IWeekDay { value: string; label: string }
type TWeekDayList = IWeekDay[]
const weekDayList: TWeekDayList = [
  { value: '0', label: '周一' },
  { value: '1', label: '周二' },
  { value: '2', label: '周三' },
  { value: '3', label: '周四' },
  { value: '4', label: '周五' },
  { value: '5', label: '周六' },
  { value: '6', label: '周日' },
]

interface ISelectWeekDays {
  value?: string
  onChange?: (value:string) => void
  buttonProps?: CompoundedComponent
  style?: React.CSSProperties | undefined
}
export default function SelectWeekDays ({
  value = '',
  onChange,
  buttonProps,
  style,
}: ISelectWeekDays) {
  // 01 02  * * 0,1,2,3,4,5,6
  const [cronObj, setCronObj] = useState(decodeCron(value))
  // const isFirstRef = useRef(true)

  useEffect(() => {
    console.log(value, decodeCron(value))
    setCronObj(decodeCron(value))
  }, [value])

  useEffect(() => {
    const newValue = encodeCron(cronObj)
    console.log('cronObj update', cronObj, value, newValue)
    if (value !== newValue) {
      onChange?.(newValue)
      console.log(newValue, cronObj, dayjs().minute(Number(cronObj.mm)).hour(Number(cronObj.hh)))
    }
  }, [cronObj, value])

  return (<Space style={style}>
    <TimePicker
      format="HH:mm"
      style={{ width: '150px' }}
      value={dayjs().minute(Number(cronObj.mm)).hour(Number(cronObj.hh))}
      onChange={(day) => {
        setCronObj({
          ...cronObj,
          mm: String(day?.minute()),
          hh: String(day?.hour()),
        })
      }}
    />
    <Space.Compact block>
      {weekDayList.map(({ value, label }) => (
        <Button
          {...buttonProps}
          key={value}
          type={cronObj.weekdays.includes(value) ? 'primary' : 'default'}
          onClick={() => {
            const index = cronObj.weekdays.indexOf(value)
            if (index >= 0) {
              // 取消选择
              cronObj.weekdays.splice(index, 1)
              setCronObj({
                ...cronObj,
                weekdays: [...cronObj.weekdays],
              })
            } else {
              // 选择
              const weekdays = [...cronObj.weekdays, value].sort((a, b) => Number(a) - Number(b))
              setCronObj({
                ...cronObj,
                weekdays,
              })
            }
          }}
        >{label}</Button>
      ))}
    </Space.Compact>
  </Space>
  )
}

function decodeCron (cron = ''):ICronObj {
  const [mm, hh, dd, MM, ww = ''] = cron.replace('  ', ' ').split(' ')
  const weekdays = ww.split(',').filter(Boolean)
  return {
    mm: mm || '00',
    hh: hh || '00',
    dd: dd || '*',
    MM: MM || '*',
    weekdays,
  }
}

function encodeCron (cronObj: ICronObj) {
  const ww = cronObj.weekdays.join(',')
  const mm = !cronObj.mm ? '00' : cronObj.mm.length === 1 ? `0${cronObj.mm}` : cronObj.mm
  const hh = !cronObj.hh ? '00' : cronObj.hh.length === 1 ? `0${cronObj.hh}` : cronObj.hh
  return [mm, hh, cronObj.dd || '*', cronObj.MM || '*', ww].join(' ')
}
