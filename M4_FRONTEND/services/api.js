import { API_BASE_URL } from '../utils/constants'

const TOKEN_KEY = 'breeddex:access_token'
const DEFAULT_TIMEOUT_MS = 60000


export class ApiError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message)

    this.name = 'ApiError'
    this.status = status
    this.cause = cause
  }
}


export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}


async function request(
  path,
  {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    ...options
  } = {},
) {
  const controller = new AbortController()

  const timeoutId = setTimeout(
    () => controller.abort(),
    timeoutMs,
  )

  try {
    const headers = {
      ...(options.headers || {}),
    }

    const token = getToken()

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,
        headers,
        signal: controller.signal,
      },
    )

    if (!response.ok) {
      let detail = ''

      try {
        const data = await response.json()

        detail =
          typeof data?.detail === 'string'
            ? data.detail
            : data?.detail?.message || ''
      } catch {
        // Ignore JSON parsing errors.
      }

      throw new ApiError(
        detail ||
          `Request failed (${response.status})`,
        {
          status: response.status,
        },
      )
    }

    if (response.status === 204) {
      return null
    }

    return response.json()

  } catch (error) {

    if (error instanceof ApiError) {
      throw error
    }

    if (error.name === 'AbortError') {
      throw new ApiError(
        'The request took too long. Please try again.',
        {
          cause: error,
        },
      )
    }

    throw new ApiError(
      'Could not reach the server. Please check that the backend is running on port 8000.',
      {
        cause: error,
      },
    )

  } finally {

    clearTimeout(timeoutId)

  }
}


function json(path, method, body) {
  return request(
    path,
    {
      method,

      headers: {
        'Content-Type': 'application/json',
      },

      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    },
  )
}


/*
=========================================================
GENERAL API
=========================================================
*/

export const api = {

  get: (path) =>
    request(path),

  post: (path, body) =>
    json(path, 'POST', body),

  put: (path, body) =>
    json(path, 'PUT', body),

  patch: (path, body) =>
    json(path, 'PATCH', body),

  delete: (path) =>
    request(
      path,
      {
        method: 'DELETE',
      },
    ),

}


/*
=========================================================
AUTH API
=========================================================
*/

export const authApi = {

  register: (body) =>
    json('/register', 'POST', body),

  login: (body) =>
    json('/login', 'POST', body),

  me: () =>
    api.get('/me'),

  saveProfile: (body) =>
    api.put('/profiles/me', body),

  switchMode: (active_mode) =>
    api.patch(
      '/me/mode',
      {
        active_mode,
      },
    ),

}


/*
=========================================================
LISTINGS API
=========================================================
*/

export const listingsApi = {

  all: () =>
    api.get('/listings'),

  byId: (id) =>
    api.get(`/listings/${id}`),

  mine: () =>
    api.get('/listings/mine/me'),

  bySeller: (id) =>
    api.get(`/listings/seller/${id}`),

  create: (body) =>
    api.post('/listings', body),

  /*
  =======================================================
  UPDATE LISTING
  =======================================================
  */

  update: (id, body) =>
    api.put(
      `/listings/${id}`,
      body,
    ),


}


/*
=========================================================
SAVED LISTINGS API
=========================================================
*/

export const savedApi = {

  all: () =>
    api.get('/saved-listings'),

  ids: () =>
    api.get('/saved-listings/ids'),

  save: (id) =>
    api.post(
      `/saved-listings/${id}`,
      {},
    ),

  remove: (id) =>
    api.delete(
      `/saved-listings/${id}`,
    ),

}


/*
=========================================================
PROFILES API
=========================================================
*/

export const profilesApi = {

  public: (id) =>
    api.get(`/profiles/public/${id}`),

}


/*
=========================================================
RECOGNITION HISTORY API
=========================================================
*/

export const historyApi = {

  all: () =>
    api.get('/recognition-history'),

  create: (
    image_url,
    raw_response,
  ) =>
    api.post(
      '/recognition-history',
      {
        image_url,
        raw_response,
      },
    ),

  remove: (id) =>
    api.delete(
      `/recognition-history/${id}`,
    ),

  clear: () =>
    api.delete(
      '/recognition-history',
    ),

}


/*
=========================================================
NORMAL BREED RECOGNITION
=========================================================
*/

export async function recognizeBreedImage(file) {

  const formData = new FormData()

  formData.append(
    'image',
    file,
  )

  return request(
    '/recognition/analyze',
    {
      method: 'POST',
      body: formData,
    },
  )

}


/*
=========================================================
SELLER LISTING BREED VERIFICATION
=========================================================
*/

export async function verifyListingBreed(
  sellerBreed,
  file,
) {

  const formData = new FormData()

  formData.append(
    'seller_breed',
    sellerBreed,
  )

  formData.append(
    'image',
    file,
    file.name,
  )

  return request(
    '/verify-listing-breed',
    {
      method: 'POST',
      body: formData,

      // AI verification can take longer.
      timeoutMs: 90000,
    },
  )

}