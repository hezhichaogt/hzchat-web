//
// WebSocket connection management Hook that implements an automatic reconnection
// mechanism with an exponential backoff strategy for stability and fault tolerance.
// This hook handles connection state, retries, and specific close codes.
//

import { ref, onUnmounted, type Ref, computed } from 'vue'
import type { ConnectionStatus, OutboundMessage } from '@/types/chat'
import { useMessage } from 'naive-ui'

// Maximum number of standard reconnection attempts before giving up.
const MAX_RETRIES = 8

// Initial delay (in ms) before the first reconnection attempt.
const INITIAL_DELAY_MS = 1000

// Maximum delay (in ms) allowed between any two reconnection attempts.
const MAX_DELAY_MS = 30000

// Factor used to increase the delay time.
const BACKOFF_FACTOR = 2

// Standard WebSocket close codes indicating a normal or expected closure.
const NORMAL_CLOSE_CODES = [1000, 1001]

// Standard WebSocket close code for abnormal closure.
const ABNORMAL_CLOSE_CODE = 1006

// Maximum number of consecutive abnormal closures (1006) allowed before triggering a long delay.
const MAX_ABNORMAL_CLOSES = 3

// The delay (in ms) applied after multiple abnormal closures.
const RATE_LIMIT_DELAY_MS = 3 * 60 * 1000

// Custom close code used by the server to indicate the user session was kicked.
const WS_CLOSE_CODE_SESSION_KICKED = 4001

interface WebSocketOptions {
  // Reactive reference to the WebSocket URL. If null, connection will not start.
  wsUrl: Ref<string | null>
  // Callback function executed when a message is received from the server.
  onMessage: (event: MessageEvent) => void
  // Callback function executed upon successful connection establishment.
  onConnected: () => void
}

// Manages WebSocket connection, automatic reconnection, and state.
export function useWebSocketReconnector({ wsUrl, onMessage, onConnected }: WebSocketOptions) {
  const message = useMessage()

  const wsRef = ref<WebSocket | null>(null)
  const connectStatus = ref<ConnectionStatus>('INIT')

  const retryCount = ref(0)
  let reconnectTimer: number | null = null
  let isUserClose = false

  const abnormalCloseCount = ref(0)

  // Flag to track if the WebSocket has ever successfully connected.
  const hasConnectedEver = ref(false)

  // Calculates the exponential backoff delay time for the given attempt number.
  const calculateDelay = (attempt: number): number => {
    const delay = INITIAL_DELAY_MS * BACKOFF_FACTOR ** attempt
    return Math.min(delay, MAX_DELAY_MS)
  }

  // Attempts to establish a new WebSocket connection.
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

  // Handler for WebSocket 'open' event.
  const handleWsOpen = () => {
    connectStatus.value = 'CONNECTED'
    retryCount.value = 0
    abnormalCloseCount.value = 0
    hasConnectedEver.value = true
    onConnected()
  }

  // Handler for WebSocket 'close' event.
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

  // Handler for WebSocket 'error' event.
  const handleWsError = (error: Event) => {
    console.error('WebSocket error:', error)
    wsRef.value?.close(4000, 'Error occurred, attempting reconnect.')
  }

  // Clears any pending reconnection timeout timer.
  const clearReconnectTimer = () => {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  // Starts a long, fixed delay loop, typically triggered after persistent abnormal failures.
  const startLongDelayLoop = () => {
    clearReconnectTimer()
    abnormalCloseCount.value = 0
    retryCount.value = 0

    connectStatus.value = 'RECONNECT_DELAY'

    reconnectTimer = setTimeout(() => {
      initiateConnection()
    }, RATE_LIMIT_DELAY_MS) as unknown as number
  }

  // Starts the exponential backoff reconnection loop.
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

  // Sends data over the WebSocket connection.
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

  // Manually closes the WebSocket connection and prevents automatic reconnection.
  const closeConnectionByUser = () => {
    isUserClose = true

    if (wsRef.value) {
      wsRef.value.close(1000, 'User actively left the chat.')
    }

    clearReconnectTimer()
    connectStatus.value = 'FINAL_DISCONNECT'
    wsRef.value = null
  }

  // Lifecycle hook: Ensure cleanup when the component using the hook is unmounted.
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
