
import qs from 'qs'

interface WebSocketOptions {
  url?: string
  path?: string
  query?: object
  timeout?: number,
  reconnection?: boolean,
  reconnectionDelay?: number,
  reconnectionDelayMax?: number,
  reconnectionAttempts?: number,
}

interface BackPackage {
  code: number
  data: {
    errorCode: number
    errorMsg?: string
    successMsg?: string
    result: any
    success: boolean
  }
}

interface SendMessage {
  code: number
  data: any
}

interface CallbackMap {
  resolveMap?: ((value: BackPackage) => void)[]
  successCallback?: (value: BackPackage) => void
}

export class WebSocketClass {
  private websocket: WebSocket
  private lockReconnect: boolean = false
  private reconnectionAttempts: number = 0
  private callbackMap: Map<number, CallbackMap> = new Map()
  private timer: ReturnType<typeof setInterval> | undefined = undefined

  private defaults: WebSocketOptions = {
    // url: `wss://${location.host}`,
    url: location.protocol === 'https:' ? `wss://${location.host}` : `ws://${location.host}`,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
  }

  private get wsurl () {
    const { url, path, query } = this.options
    return `${url}${path}?${qs.stringify(query)}`
  }

  constructor (
    private options: WebSocketOptions,
  ) {
    this.options = Object.assign({}, this.defaults, this.options)
    this.websocket = new WebSocket(this.wsurl)
    this.bindEvents()
  }

  private bindEvents () {
    this.websocket.addEventListener('open', this.onopen.bind(this))
    this.websocket.addEventListener('error', this.onerror.bind(this))
    this.websocket.addEventListener('close', this.onclose.bind(this))
    this.websocket.addEventListener('message', this.onmessage.bind(this))
  }

  private unbindEvents () {
    this.websocket.removeEventListener('open', this.onopen.bind(this))
    this.websocket.removeEventListener('error', this.onerror.bind(this))
    this.websocket.removeEventListener('close', this.onclose.bind(this))
    this.websocket.removeEventListener('message', this.onmessage.bind(this))
  }

  private reconnect () {
    console.log('reconnect', this.lockReconnect)
    if (this.lockReconnect) return

    setTimeout(() => {
      this.lockReconnect = false
      this.reconnectionAttempts++
      this.unbindEvents()
      this.websocket = new WebSocket(this.wsurl)
      this.bindEvents()
    }, this.options.reconnectionDelay)
  }

  private onopen () {
    console.log('[ws] onopen')
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  private onerror () {
    console.log('[ws] onerror', this)
    const { reconnection, reconnectionAttempts, reconnectionDelay } = this.options

    if (reconnection && reconnectionAttempts && this.reconnectionAttempts < reconnectionAttempts) {
      setTimeout(() => {
        this.reconnect()
      }, reconnectionDelay)
    }
  }

  private onclose () {
    console.log('[ws] onclose')
  }

  private onmessage (event: MessageEvent<any>) {
    console.log('[ws] onmessage')
    this.lockReconnect = true
    try {
      const data = JSON.parse(event.data)
      const { resolveMap = [], successCallback } = this.callbackMap.get(data?.code) || {}
      resolveMap.pop()?.(data)

      if (typeof successCallback === 'function') {
        successCallback?.(data)
      }
    } catch (error) {
      console.log('[ws] onmessage error', error)
    }
  }

  public send (message: SendMessage): Promise<BackPackage> {
    return new Promise((resolve) => {
      const postMessage = typeof message === 'string' ? message : JSON.stringify(message)
      const callbackMapCopy = this.callbackMap.get(message?.code) || {}
      const oldResolveMap = callbackMapCopy.resolveMap || []
      callbackMapCopy.resolveMap = [...oldResolveMap, resolve]
      this.callbackMap.set(message?.code, callbackMapCopy)
      this.websocket.send(postMessage)
    })
  }

  public sendSync (message: SendMessage & {
    success: (result: BackPackage) => void
  }): void {
    const postMessage = typeof message === 'string' ? message : JSON.stringify(message)
    const callbackMapCopy = this.callbackMap.get(message?.code) || {}
    callbackMapCopy.successCallback = message.success
    this.callbackMap.set(message?.code, callbackMapCopy)
    this.websocket.send(postMessage)
  }

  public close () {
    this.unbindEvents()
    this.websocket.close(1000, 'CLOSE_NORMAL')
  }
}

export default WebSocketClass
