const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

function flattenErrorMessage(value) {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    return value.join(' ')
  }

  if (typeof value === 'object') {
    return Object.values(value)
      .map(flattenErrorMessage)
      .filter(Boolean)
      .join(' ')
  }

  return null
}

async function parseResponse(response) {
  let data = {}

  try {
    data = await response.json()
  } catch {
    data = {}
  }

  if (!response.ok) {
    const errorMessage =
      flattenErrorMessage(data) || 'Request failed. Please try again.'
    throw new Error(errorMessage)
  }

  return data
}

export async function registerUser(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}