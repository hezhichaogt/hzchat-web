import { ref, onUnmounted, type Ref, computed } from 'vue'
import type { ConnectionStatus, OutboundMessage } from '@/types/chat'
import { toast } from 'vue-sonner'

const MAX_RETRIES = 8
const INITIAL_DELAY_MS = 2000
const MAX_DELAY_MS = 60 * 1000
const BACKOFF_FACTOR = 2
const WS_CLOSE_CODE_SESSION_KICKED = 4001
const WS_CLOSE_CODE_ROOM_EXPIRING = 4002

interface WebSocketOptions {
  wsUrl: Ref<string | null>
  onMessage: (event: MessageEvent) => void
  onConnected: () => void
}

export function useWebSocketReconnector({ wsUrl, onMessage, onConnected }: WebSocketOptions) {
  const wsRef = ref<WebSocket | null>(null)
  const connectStatus = ref<ConnectionStatus>('INIT')
  const retryCount = ref(0)
  const hasConnectedEver = ref(false)

  let reconnectTimer: number | null = null
  let isUserClose = false

  const calculateDelay = (attempt: number): number => {
    const baseDelay = INITIAL_DELAY_MS * BACKOFF_FACTOR ** attempt
    const jitter = (Math.random() * 0.4 - 0.2) * baseDelay
    return Math.min(baseDelay + jitter, MAX_DELAY_MS)
  }

  const clearReconnectTimer = () => {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  const initiateConnection = () => {
    if (connectStatus.value === 'CONNECTING') return

    if (!wsUrl.value) {
      connectStatus.value = 'FATAL_ERROR'
      return
    }

    if (wsRef.value) {
      wsRef.value.onopen = null
      wsRef.value.onmessage = null
      wsRef.value.onclose = null
      wsRef.value.onerror = null
      wsRef.value.close()
      wsRef.value = null
    }

    clearReconnectTimer()
    isUserClose = false
    connectStatus.value = 'CONNECTING'

    try {
      const ws = new WebSocket(wsUrl.value)
      wsRef.value = ws
      ws.onopen = handleWsOpen
      ws.onmessage = onMessage
      ws.onclose = handleWsClose
      ws.onerror = handleWsError
    } catch (e) {
      console.error('WebSocket Error:', e)
      connectStatus.value = 'FATAL_ERROR'
    }
  }

  const handleWsOpen = () => {
    connectStatus.value = 'CONNECTED'
    retryCount.value = 0
    hasConnectedEver.value = true
    onConnected()
  }

  const handleWsClose = (event: CloseEvent) => {
    console.warn(`WebSocket closed: Code ${event.code}`)

    if (event.code === WS_CLOSE_CODE_SESSION_KICKED) {
      toast.error("You've signed in elsewhere.")
      connectStatus.value = 'FINAL_DISCONNECT'
      return
    }

    if (event.code === WS_CLOSE_CODE_ROOM_EXPIRING) {
      toast.warning('This chat is closing and is no longer available.')
      connectStatus.value = 'FINAL_DISCONNECT'
      return
    }

    if (!hasConnectedEver.value && retryCount.value >= 3) {
      connectStatus.value = 'FATAL_ERROR'
      return
    }

    if (isUserClose) {
      connectStatus.value = 'FINAL_DISCONNECT'
      return
    }

    startReconnectLoop()
  }

  const handleWsError = (error: Event) => {
    console.error('WebSocket connection encountered an error:', error)
  }

  const startReconnectLoop = () => {
    clearReconnectTimer()

    if (retryCount.value >= MAX_RETRIES) {
      connectStatus.value = 'FINAL_DISCONNECT'
      toast.error('Connection lost. Please refresh the page.')
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
    clearReconnectTimer()
    if (wsRef.value) {
      wsRef.value.close(1000)
    }
    connectStatus.value = 'FINAL_DISCONNECT'
  }

  onUnmounted(() => {
    isUserClose = true
    clearReconnectTimer()
    if (wsRef.value) {
      wsRef.value.onclose = null
      wsRef.value.close(1000)
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
