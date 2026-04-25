import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import usePose from '../hooks/usePose'
import { calculateAngle } from '../utils/angleUtils'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
const ACCESS_TOKEN_KEY = 'devcare_access_token'

const TRACKED_JOINTS = {
  left: {
    shoulder: 11,
    elbow: 13,
    wrist: 15,
    hip: 23,
    knee: 25,
  },
  right: {
    shoulder: 12,
    elbow: 14,
    wrist: 16,
    hip: 24,
    knee: 26,
  },
}

const EXTENSION_THRESHOLD = 150
const CONTRACTION_THRESHOLD = 60
const MIN_ROM_RANGE = 55
const SHOULDER_DRIFT_THRESHOLD = 0.08

function toPoint(landmark) {
  if (!landmark) {
    return null
  }

  return {
    x: landmark.x,
    y: landmark.y,
    visibility: landmark.visibility ?? 0,
  }
}

function getTrackedSide(landmarks) {
  const sideToPoints = (sideName) => {
    const side = TRACKED_JOINTS[sideName]
    return {
      shoulder: toPoint(landmarks[side.shoulder]),
      elbow: toPoint(landmarks[side.elbow]),
      wrist: toPoint(landmarks[side.wrist]),
      hip: toPoint(landmarks[side.hip]),
      knee: toPoint(landmarks[side.knee]),
    }
  }

  const left = sideToPoints('left')
  const right = sideToPoints('right')

  const score = (side) =>
    ['shoulder', 'elbow', 'wrist', 'hip', 'knee'].reduce(
      (sum, key) => sum + (side[key]?.visibility || 0),
      0
    )

  return score(right) >= score(left) ? right : left
}

function roundTo(value, precision = 2) {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

export default function StartSession() {
  const navigate = useNavigate()

  const [reps, setReps] = useState(0)
  const [angles, setAngles] = useState([])
  const [mistakes, setMistakes] = useState([])
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [movementState, setMovementState] = useState('idle')
  const [feedbackText, setFeedbackText] = useState('Press Start Session to begin your bicep curl set.')
  const [isStarting, setIsStarting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [sessionSummary, setSessionSummary] = useState(null)

  const repsRef = useRef(0)
  const stageRef = useRef(null)
  const repMinAngleRef = useRef(Number.POSITIVE_INFINITY)
  const repMaxAngleRef = useRef(Number.NEGATIVE_INFINITY)
  const shoulderBaselineRef = useRef(null)
  const shoulderMistakeCountRef = useRef(0)
  const romMistakeCountRef = useRef(0)
  const repRangesRef = useRef([])
  const anglesRef = useRef([])
  const sessionStartRef = useRef(null)
  const frameCounterRef = useRef(0)
  const durationTimerRef = useRef(null)
  const lastShoulderWarningAtRef = useRef(0)

  const addMistake = useCallback((message) => {
    setMistakes((previous) => (previous.includes(message) ? previous : [...previous, message]))
  }, [])

  const resetTrackingState = useCallback(() => {
    setReps(0)
    setAngles([])
    setMistakes([])
    setElapsedSeconds(0)
    setSessionSummary(null)
    setUploadMessage('')
    setMovementState('idle')

    repsRef.current = 0
    stageRef.current = null
    repMinAngleRef.current = Number.POSITIVE_INFINITY
    repMaxAngleRef.current = Number.NEGATIVE_INFINITY
    shoulderBaselineRef.current = null
    shoulderMistakeCountRef.current = 0
    romMistakeCountRef.current = 0
    repRangesRef.current = []
    anglesRef.current = []
    frameCounterRef.current = 0
    lastShoulderWarningAtRef.current = 0
  }, [])

  const onPoseResults = useCallback(
    (results) => {
      const landmarks = results.poseLandmarks
      if (!landmarks?.length) {
        setFeedbackText('Pose not detected. Keep your full upper body in the frame.')
        return
      }

      const trackedSide = getTrackedSide(landmarks)
      const { shoulder, elbow, wrist } = trackedSide
      if (!shoulder || !elbow || !wrist) {
        return
      }

      if (shoulder.visibility < 0.5 || elbow.visibility < 0.5 || wrist.visibility < 0.5) {
        setFeedbackText('Move slightly closer and keep your arm visible.')
        return
      }

      const angle = calculateAngle(shoulder, elbow, wrist)
      if (!Number.isFinite(angle)) {
        return
      }

      frameCounterRef.current += 1
      anglesRef.current.push(angle)
      if (anglesRef.current.length > 600) {
        anglesRef.current = anglesRef.current.slice(-600)
      }
      if (frameCounterRef.current % 4 === 0) {
        setAngles([...anglesRef.current])
      }

      repMinAngleRef.current = Math.min(repMinAngleRef.current, angle)
      repMaxAngleRef.current = Math.max(repMaxAngleRef.current, angle)

      if (shoulderBaselineRef.current === null) {
        shoulderBaselineRef.current = shoulder.y
      }

      const shoulderMovement = Math.abs(shoulder.y - shoulderBaselineRef.current)
      const now = Date.now()
      if (
        shoulderMovement > SHOULDER_DRIFT_THRESHOLD &&
        now - lastShoulderWarningAtRef.current > 1000
      ) {
        shoulderMistakeCountRef.current += 1
        addMistake('excessive shoulder movement')
        setFeedbackText('Fix posture: keep your shoulder stable during the curl.')
        lastShoulderWarningAtRef.current = now
      }

      if (stageRef.current === null) {
        stageRef.current = angle > 120 ? 'down' : 'up'
      }

      if (angle > EXTENSION_THRESHOLD && stageRef.current !== 'down') {
        stageRef.current = 'down'
      }

      if (stageRef.current === 'down' && angle < CONTRACTION_THRESHOLD) {
        stageRef.current = 'up'

        repsRef.current += 1
        setReps(repsRef.current)

        const repRange = repMaxAngleRef.current - repMinAngleRef.current
        if (Number.isFinite(repRange) && repRange > 0) {
          repRangesRef.current.push(repRange)

          if (repRange < MIN_ROM_RANGE) {
            romMistakeCountRef.current += 1
            addMistake('incomplete range of motion')
            setFeedbackText('Increase your curl range. Fully extend and contract each rep.')
          } else if (shoulderMovement <= SHOULDER_DRIFT_THRESHOLD) {
            setFeedbackText('Good form. Keep the rhythm steady.')
          }
        }

        repMinAngleRef.current = angle
        repMaxAngleRef.current = angle
      }

      setMovementState(stageRef.current)
    },
    [addMistake]
  )

  const { videoRef, canvasRef, isRunning, error: poseError, start, stop } = usePose({
    onResults: onPoseResults,
  })

  const startDurationTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current)
    }

    durationTimerRef.current = setInterval(() => {
      if (!sessionStartRef.current) {
        return
      }
      setElapsedSeconds((Date.now() - sessionStartRef.current) / 1000)
    }, 250)
  }, [])

  const stopDurationTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current)
      durationTimerRef.current = null
    }
  }, [])

  const handleStartSession = useCallback(async () => {
    setIsStarting(true)
    resetTrackingState()

    const startedAt = Date.now()
    sessionStartRef.current = startedAt
    setSessionStartTime(startedAt)
    setFeedbackText('Session running. Keep your upper arm steady and curl with control.')
    startDurationTimer()

    try {
      await start()
    } catch (error) {
      setFeedbackText(error?.message || 'Unable to start camera session.')
      stopDurationTimer()
    } finally {
      setIsStarting(false)
    }
  }, [resetTrackingState, start, startDurationTimer, stopDurationTimer])

  const handleEndSession = useCallback(async () => {
    await stop()
    stopDurationTimer()

    const duration = sessionStartRef.current
      ? (Date.now() - sessionStartRef.current) / 1000
      : elapsedSeconds
    setElapsedSeconds(duration)

    const ranges = repRangesRef.current
    const avgRange = ranges.length
      ? ranges.reduce((sum, value) => sum + value, 0) / ranges.length
      : 0

    const totalMistakeEvents = shoulderMistakeCountRef.current + romMistakeCountRef.current
    let accuracy = 100 - totalMistakeEvents * 10
    if (repsRef.current === 0) {
      accuracy -= 35
      addMistake('no complete rep detected')
    }
    accuracy = Math.max(0, Math.min(100, accuracy))

    const payload = {
      exercise: 'bicep_curl',
      reps: repsRef.current,
      avg_range: roundTo(avgRange),
      form_accuracy: roundTo(accuracy),
      duration: roundTo(duration),
    }

    setSessionSummary(payload)
    setIsSaving(true)
    setUploadMessage('')

    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY)
      const response = await fetch(API_BASE_URL + '/api/ai/upload-session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
        body: JSON.stringify(payload),
      })

      let data = {}
      try {
        data = await response.json()
      } catch {
        data = {}
      }

      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to upload session report.')
      }

      setUploadMessage(data?.status === 'saved' ? 'Session report saved.' : 'Session uploaded.')
      setFeedbackText('Session completed. Great effort.')
    } catch (error) {
      setUploadMessage(error?.message || 'Failed to upload session report.')
    } finally {
      setIsSaving(false)
    }
  }, [addMistake, elapsedSeconds, stop, stopDurationTimer])

  return (
    <div className="app-shell">
      <Navbar />

      <main className="site-container py-8">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="elevated-card rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                  Telerehab Session
                </p>
                <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Real-time Bicep Curl Coach</h1>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/dashboard/patient')}
              >
                Back to Dashboard
              </button>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-black">
              <video
                ref={videoRef}
                className="block aspect-video w-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={handleStartSession}
                disabled={isRunning || isStarting}
              >
                {isStarting ? 'Starting...' : 'Start Session'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleEndSession}
                disabled={!isRunning || isSaving}
              >
                {isSaving ? 'Saving...' : 'End Session'}
              </button>
            </div>

            <p className="mt-4 rounded-xl bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
              {feedbackText}
            </p>
            {poseError ? (
              <p className="mt-3 text-sm font-semibold text-[var(--color-danger)]">{poseError}</p>
            ) : null}
            {uploadMessage ? (
              <p className="mt-2 text-sm font-semibold text-[var(--color-primary)]">{uploadMessage}</p>
            ) : null}
          </section>

          <section className="elevated-card rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-7">
            <h2 className="text-xl font-bold">Live Metrics</h2>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Reps</p>
                <p className="mt-1 text-3xl font-bold">{reps}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">State</p>
                <p className="mt-1 text-2xl font-bold capitalize">{movementState}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Duration (s)</p>
                <p className="mt-1 text-2xl font-bold">{roundTo(elapsedSeconds)}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Latest Angle</p>
                <p className="mt-1 text-2xl font-bold">
                  {angles.length ? String(roundTo(angles[angles.length - 1])) + '°' : '--'}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold">Mistakes</p>
              {mistakes.length ? (
                <ul className="mt-2 list-inside list-disc text-sm text-[var(--color-text-muted)]">
                  {mistakes.map((mistake) => (
                    <li key={mistake}>{mistake}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">No form issues detected yet.</p>
              )}
            </div>

            <div className="mt-5 text-sm text-[var(--color-text-muted)]">
              <p>Session started: {sessionStartTime ? new Date(sessionStartTime).toLocaleTimeString() : '--'}</p>
              <p className="mt-1">Angle samples collected: {angles.length}</p>
            </div>

            {sessionSummary ? (
              <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4 text-sm">
                <p className="font-semibold">Session Summary</p>
                <p className="mt-2">Exercise: {sessionSummary.exercise}</p>
                <p>Reps: {sessionSummary.reps}</p>
                <p>Average ROM: {sessionSummary.avg_range}°</p>
                <p>Form Accuracy: {sessionSummary.form_accuracy}%</p>
                <p>Duration: {sessionSummary.duration}s</p>
              </div>
            ) : null}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
