//
// WebSocket connection management Hook that implements an automatic reconnection
// mechanism with an exponential backoff strategy for stability and fault tolerance.
//

import { ref, onUnmounted, type Ref, computed } from 'vue'
import type { ConnectionStatus, OutboundMessage } from '@/types/chat'
import { useMessage } from 'naive-ui'

const MAX_RETRIES = 8
const INITIAL_DELAY_MS = 1000
const MAX_DELAY_MS = 30000
const BACKOFF_FACTOR = 2
const NORMAL_CLOSE_CODES = [1000, 1001]
const ABNORMAL_CLOSE_CODE = 1006
const MAX_ABNORMAL_CLOSES = 3
const RATE_LIMIT_DELAY_MS = 3 * 60 * 1000
const WS_CLOSE_CODE_SESSION_KICKED = 4001

interface WebSocketOptions {
  wsUrl: Ref<string | null>
  onMessage: (event: MessageEvent) => void
  onConnected: () => void
}

export function useWebSocketReconnector({ wsUrl, onMessage, onConnected }: WebSocketOptions) {
  const message = useMessage()

  const wsRef = ref<WebSocket | null>(null)
  const connectStatus = ref<ConnectionStatus>('INIT')

  const retryCount = ref(0)
  let reconnectTimer: number | null = null
  let isUserClose = false

  const abnormalCloseCount = ref(0)

  const hasConnectedEver = ref(false)

  const calculateDelay = (attempt: number): number => {
    const delay = INITIAL_DELAY_MS * BACKOFF_FACTOR ** attempt
    return Math.min(delay, MAX_DELAY_MS)
  }

  const initiateConnection = () => {
    if (!wsUrl.value) {
      connectStatus.value = 'FATAL_ERROR'
      return
    }

    if (wsRef.value) {
      wsRef.value.onclose = null
      wsRef.value.close()
      wsRef.value = null
    }
    clearReconnectTimer()

    connectStatus.value = 'CONNECTING'

    try {
      const ws = new WebSocket(wsUrl.value)
      wsRef.value = ws

      ws.onopen = handleWsOpen
      ws.onmessage = onMessage
      ws.onclose = handleWsClose
      ws.onerror = handleWsError
    } catch (e) {
      console.error('Error creating WebSocket instance:', e)
      connectStatus.value = 'FATAL_ERROR'
      wsRef.value = null
    }
  }

  const handleWsOpen = () => {
    connectStatus.value = 'CONNECTED'
    retryCount.value = 0
    abnormalCloseCount.value = 0
    hasConnectedEver.value = true
    onConnected()
  }

  const handleWsClose = (event: CloseEvent) => {
    console.warn(`WebSocket closed: Code ${event.code}, Reason: ${event.reason}`)

    if (event.code === WS_CLOSE_CODE_SESSION_KICKED) {
      message.error("You've been signed in on another device/tab. This connection has been closed.")
      connectStatus.value = 'FINAL_DISCONNECT'
      return
    }

    if (
      isUserClose ||
      connectStatus.value === 'FINAL_DISCONNECT' ||
      NORMAL_CLOSE_CODES.includes(event.code)
    ) {
      connectStatus.value = 'FINAL_DISCONNECT'
      return
    }

    if (event.code === ABNORMAL_CLOSE_CODE) {
      abnormalCloseCount.value++

      if (abnormalCloseCount.value >= MAX_ABNORMAL_CLOSES) {
        startLongDelayLoop()
        return
      }
    } else {
      abnormalCloseCount.value = 0
    }

    startReconnectLoop()
  }

  const handleWsError = (error: Event) => {
    console.error('WebSocket error:', error)
    wsRef.value?.close(4000, 'Error occurred, attempting reconnect.')
  }

  const clearReconnectTimer = () => {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  const startLongDelayLoop = () => {
    clearReconnectTimer()
    abnormalCloseCount.value = 0
    retryCount.value = 0

    connectStatus.value = 'RECONNECT_DELAY'

    reconnectTimer = setTimeout(() => {
      initiateConnection()
    }, RATE_LIMIT_DELAY_MS) as unknown as number
  }

  const startReconnectLoop = () => {
    clearReconnectTimer()

    if (retryCount.value >= MAX_RETRIES) {
      connectStatus.value = 'FINAL_DISCONNECT'
      return
    }

    const delay = calculateDelay(retryCount.value)

    connectStatus.value = 'RECONNECT_DELAY'

    reconnectTimer = setTimeout(() => {
      retryCount.value++
      initiateConnection()
    }, delay) as unknown as number
  }

  const sendData = (data: OutboundMessage) => {
    if (wsRef.value && wsRef.value.readyState === WebSocket.OPEN) {
      try {
        wsRef.value.send(JSON.stringify(data))
        return true
      } catch (e) {
        console.error('Failed to send data:', e)
        return false
      }
    }
    return false
  }

  const closeConnectionByUser = () => {
    isUserClose = true

    if (wsRef.value) {
      wsRef.value.close(1000, 'User actively left the chat.')
    }

    clearReconnectTimer()
    connectStatus.value = 'FINAL_DISCONNECT'
    wsRef.value = null
  }

  onUnmounted(() => {
    clearReconnectTimer()
    if (wsRef.value) {
      wsRef.value.onclose = null
      wsRef.value.close(1000, 'Component unmounted.')
    }
  })

  return {
    wsRef,
    connectStatus,
    retryCount,
    initiateConnection,
    sendData,
    closeConnectionByUser,
    isReady: computed(() => connectStatus.value === 'CONNECTED'),
    hasConnectedEver,
  }
}
