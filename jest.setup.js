import '@testing-library/jest-dom'

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: false,
    status: 401,
    json: () => Promise.resolve({ authenticated: false, user: null }),
  })
)

// Mock API service
jest.mock('@/lib/api', () => ({
  ApiService: {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getSession: jest.fn(() => Promise.resolve({ authenticated: false, user: null })),
    getUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    getModels: jest.fn(),
    createModel: jest.fn(),
    updateModel: jest.fn(),
    deleteModel: jest.fn(),
    getUserModelMappers: jest.fn(),
    createUserModelMapper: jest.fn(),
    updateUserModelMapper: jest.fn(),
    deleteUserModelMapper: jest.fn(),
    triggerEmail: jest.fn(),
  },
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:4000'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock token storage
jest.mock('@/lib/tokenStorage', () => ({
  tokenStorage: {
    getAccessToken: jest.fn(() => null),
    getRefreshToken: jest.fn(() => null),
    getTokenExpiration: jest.fn(() => null),
    getUserData: jest.fn(() => null),
    isAccessTokenExpired: jest.fn(() => true),
    isRefreshTokenExpired: jest.fn(() => true),
    isAuthenticated: jest.fn(() => false),
    setTokens: jest.fn(),
    updateAccessToken: jest.fn(),
    clearTokens: jest.fn(),
    getAllData: jest.fn(() => ({ tokens: null, user: null })),
  },
}))

// Mock token refresh service
jest.mock('@/lib/tokenRefresh', () => ({
  tokenRefreshService: {
    refreshAccessToken: jest.fn(),
    retryRequest: jest.fn(),
    isTokenExpiredError: jest.fn(() => false),
    isSessionExpiredError: jest.fn(() => false),
  },
}))

// Mock token expiration handler
jest.mock('@/lib/tokenExpirationHandler', () => ({
  tokenExpirationHandler: {
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn(),
    forceLogout: jest.fn(),
    getTimeUntilAccessTokenExpires: jest.fn(() => null),
    getTimeUntilRefreshTokenExpires: jest.fn(() => null),
    willAccessTokenExpireSoon: jest.fn(() => false),
    willRefreshTokenExpireSoon: jest.fn(() => false),
  },
}))
