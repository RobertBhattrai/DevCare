export function calculateAngle(pointA, pointB, pointC) {
  if (!pointA || !pointB || !pointC) {
    return Number.NaN
  }

  const baX = pointA.x - pointB.x
  const baY = pointA.y - pointB.y
  const bcX = pointC.x - pointB.x
  const bcY = pointC.y - pointB.y

  const dot = baX * bcX + baY * bcY
  const magnitudeBA = Math.hypot(baX, baY)
  const magnitudeBC = Math.hypot(bcX, bcY)

  if (!magnitudeBA || !magnitudeBC) {
    return Number.NaN
  }

  const cosine = Math.min(1, Math.max(-1, dot / (magnitudeBA * magnitudeBC)))
  return (Math.acos(cosine) * 180) / Math.PI
}
