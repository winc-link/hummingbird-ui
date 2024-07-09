// import MonacoEditor from 'react-monaco-editor'
import React, { useState, useImperativeHandle, useContext, forwardRef, useCallback, useMemo, useRef, useEffect } from 'react'
import { Button, Modal } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
import { WebSocketContext } from '@/components/WebSocket'
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'
// import { WebSocketClass } from '@/utils/web-socket'

export interface LogModalProps {
  // ws?: WebSocketClass
}

export interface LogModalRef {
  open: (id: string) => void
}

export const LogModal = forwardRef<LogModalRef, LogModalProps>((props, ref) => {
  const [id, setId] = useState('')
  const [data, setData] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { ws } = useContext(WebSocketContext)

  const handleStart = useCallback((id: string) => {
    ws?.sendSync({
      code: 20004,
      data: { id, operate: 1 },
      success (resp) {
        if (resp.data.success) {
          setLoading(true)
          setData((prevValues) => {
            return [...prevValues, resp.data.result]
          })
          if (TerminalRef.current) {
            TerminalRef.current.write(resp.data.result + '\r\n\x1b[33m$\x1b[0m ')
            // "\r\n\x1b[33m$\x1b[0m "
          }
        }
      },
    })
  }, [ws])

  const xtermRef = useRef(null)
  const TerminalRef = useRef<Terminal | null>(null)
  // const term = new Terminal()
  useEffect(() => {
    if (!isModalOpen) {
      TerminalRef.current = null
      return
    }
    setTimeout(() => {
      console.log('Terminal', xtermRef.current, Terminal)
      if (!isModalOpen || !xtermRef.current) return
      TerminalRef.current = new Terminal({
        cols: 150,
        rows: 35,
        fontSize: 13,
      })
      TerminalRef.current.open(xtermRef.current)
      // term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
    }, 0)
  }, [isModalOpen])

  const logs = useMemo(() => {
    return data.map(i => i + '\n')
  }, [data])

  const handleStop = useCallback(() => {
    ws?.send({
      code: 20004,
      data: { id, operate: 2 },
    }).then((resp) => {
      if (resp.data.success) {
        console.log('日志已停止')
        setLoading(false)
      }
    })
  }, [id])

  useImperativeHandle(ref, () => {
    return {
      open (id: string) {
        setId(id)
        setIsModalOpen(true)
        handleStart(id)
      },
    }
  }, [handleStart])

  return (
    <Modal
      title="云服务日志"
      width={1250}
      maskClosable={false}
      open={isModalOpen}
      destroyOnClose
      footer={
        <>
          <Button
            type="default"
            onClick={() => {
              const content = logs.reduce((result, item) => {
                result += `${item}`
                return result
              })
              const a = document.createElement('a')
              a.href = 'data:text/plain;charset=utf-8,' + content
              a.download = 'txt'
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
            }}
          >下载日志</Button>
          <Button
            type="primary"
            icon={loading ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => {
              loading ? handleStop() : handleStart(id)
            }}
          >{ loading ? '停止' : '开始' }</Button>
        </>
      }
      onCancel={() => {
        handleStop()
        setData(() => [])
        setIsModalOpen(false)
      }}
    >
      {/* <MonacoEditor
        height="500"
        language="javascript"
        theme="vs-dark"
        value={logs.join('')}
      ></MonacoEditor> */}
      <div ref={xtermRef}></div>
    </Modal>
  )
})

export default LogModal
