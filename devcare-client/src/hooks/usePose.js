import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_WIDTH = 960
const DEFAULT_HEIGHT = 540
const CAMERA_UTILS_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'
const POSE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js'
const SCRIPT_ATTR = 'data-devcare-mediapipe-src'

function resolveModule(rawModule) {
  return rawModule?.default || rawModule?.['module.exports'] || rawModule
}

function extractMediaPipeApis(cameraUtilsRaw, poseRaw) {
  const Camera =
    cameraUtilsRaw?.Camera ||
    cameraUtilsRaw?.default?.Camera ||
    cameraUtilsRaw?.['module.exports']?.Camera ||
    resolveModule(cameraUtilsRaw)?.Camera

  const Pose =
    poseRaw?.Pose ||
    poseRaw?.default?.Pose ||
    poseRaw?.['module.exports']?.Pose ||
    resolveModule(poseRaw)?.Pose

  const POSE_CONNECTIONS =
    poseRaw?.POSE_CONNECTIONS ||
    poseRaw?.default?.POSE_CONNECTIONS ||
    poseRaw?.['module.exports']?.POSE_CONNECTIONS ||
    resolveModule(poseRaw)?.POSE_CONNECTIONS ||
    []

  return { Camera, Pose, POSE_CONNECTIONS }
}

function ensureScript(url) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[' + SCRIPT_ATTR + '="' + url + '"]')
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve()
        return
      }

      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load script: ' + url)),
        { once: true }
      )
      return
    }

    const script = document.createElement('script')
    script.src = url
    script.async = true
    script.defer = true
    script.setAttribute(SCRIPT_ATTR, url)

    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true'
        resolve()
      },
      { once: true }
    )

    script.addEventListener(
      'error',
      () => reject(new Error('Failed to load script: ' + url)),
      { once: true }
    )

    document.head.appendChild(script)
  })
}

async function loadMediaPipeApis() {
  let cameraUtilsRaw = null
  let poseRaw = null

  try {
    ;[cameraUtilsRaw, poseRaw] = await Promise.all([
      import('@mediapipe/camera_utils'),
      import('@mediapipe/pose'),
    ])
  } catch {
    cameraUtilsRaw = null
    poseRaw = null
  }

  let { Camera, Pose, POSE_CONNECTIONS } = extractMediaPipeApis(cameraUtilsRaw, poseRaw)

  if (Camera && Pose) {
    return { Camera, Pose, POSE_CONNECTIONS }
  }

  // Fallback for environments where Vite wraps MediaPipe packages in an incompatible shape.
  await Promise.all([ensureScript(CAMERA_UTILS_CDN), ensureScript(POSE_CDN)])

  ;({ Camera, Pose, POSE_CONNECTIONS } = {
    Camera: globalThis.Camera,
    Pose: globalThis.Pose,
    POSE_CONNECTIONS: globalThis.POSE_CONNECTIONS || [],
  })

  if (!Camera || !Pose) {
    throw new Error(
      'Unable to initialize MediaPipe. Clear dev cache and restart the app.'
    )
  }

  return { Camera, Pose, POSE_CONNECTIONS }
}

function drawOverlay(canvas, poseLandmarks, poseConnections) {
  const context = canvas.getContext('2d')
  if (!context) {
    return
  }

  context.clearRect(0, 0, canvas.width, canvas.height)

  if (!poseLandmarks?.length) {
    return
  }

  context.save()

  context.lineWidth = 2
  context.strokeStyle = 'rgba(15, 118, 110, 0.9)'
  for (const [startIndex, endIndex] of poseConnections) {
    const start = poseLandmarks[startIndex]
    const end = poseLandmarks[endIndex]
    if (!start || !end || start.visibility < 0.4 || end.visibility < 0.4) {
      continue
    }

    context.beginPath()
    context.moveTo(start.x * canvas.width, start.y * canvas.height)
    context.lineTo(end.x * canvas.width, end.y * canvas.height)
    context.stroke()
  }

  context.fillStyle = 'rgba(5, 150, 105, 0.85)'
  for (const landmark of poseLandmarks) {
    if (!landmark || landmark.visibility < 0.4) {
      continue
    }

    context.beginPath()
    context.arc(landmark.x * canvas.width, landmark.y * canvas.height, 3, 0, Math.PI * 2)
    context.fill()
  }

  context.restore()
}

export default function usePose({ onResults, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT } = {}) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const poseRef = useRef(null)
  const cameraRef = useRef(null)
  const poseConnectionsRef = useRef([])
  const onResultsRef = useRef(onResults)

  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    onResultsRef.current = onResults
  }, [onResults])

  const stop = useCallback(async () => {
    try {
      if (cameraRef.current && typeof cameraRef.current.stop === 'function') {
        cameraRef.current.stop()
      }

      if (poseRef.current && typeof poseRef.current.close === 'function') {
        await poseRef.current.close()
      }
    } finally {
      cameraRef.current = null
      poseRef.current = null
      setIsRunning(false)

      const canvas = canvasRef.current
      if (canvas) {
        const context = canvas.getContext('2d')
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height)
        }
      }
    }
  }, [])

  const start = useCallback(async () => {
    if (isRunning) {
      return
    }

    const videoElement = videoRef.current
    const canvasElement = canvasRef.current
    if (!videoElement || !canvasElement) {
      throw new Error('Pose elements are not mounted yet.')
    }

    setError('')

    const { Camera, Pose, POSE_CONNECTIONS } = await loadMediaPipeApis()
    poseConnectionsRef.current = POSE_CONNECTIONS

    const pose = new Pose({
      locateFile: (file) => 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/' + file,
    })

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    })

    pose.onResults((results) => {
      const renderWidth = videoElement.videoWidth || width
      const renderHeight = videoElement.videoHeight || height

      if (canvasElement.width !== renderWidth || canvasElement.height !== renderHeight) {
        canvasElement.width = renderWidth
        canvasElement.height = renderHeight
      }

      drawOverlay(canvasElement, results.poseLandmarks, poseConnectionsRef.current)
      onResultsRef.current?.(results)
    })

    const camera = new Camera(videoElement, {
      width,
      height,
      onFrame: async () => {
        await pose.send({ image: videoElement })
      },
    })

    try {
      await camera.start()
      poseRef.current = pose
      cameraRef.current = camera
      setIsRunning(true)
    } catch (cameraError) {
      await pose.close()
      setError(cameraError?.message || 'Unable to access camera.')
      throw cameraError
    }
  }, [height, isRunning, width])

  useEffect(() => {
    return () => {
      void stop()
    }
  }, [stop])

  return {
    videoRef,
    canvasRef,
    isRunning,
    error,
    start,
    stop,
  }
}
