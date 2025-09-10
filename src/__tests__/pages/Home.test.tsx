import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import Home from '../../app/page'
import { AuthProvider } from '../../contexts/AuthContext'
import { AlertProvider } from '../../contexts/AlertContext'
import { ThemeProvider } from '../../contexts/ThemeContext'

// Mock the router
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}))

// Mock the API service
jest.mock('../../lib/api', () => ({
  ApiService: {
    login: jest.fn(),
  },
}))

const MockProviders = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <AuthProvider>
      <AlertProvider>
        {children}
      </AlertProvider>
    </AuthProvider>
  </ThemeProvider>
)

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form', async () => {
    render(
      <MockProviders>
        <Home />
      </MockProviders>
    )
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
    })
    
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders theme toggle', () => {
    render(
      <MockProviders>
        <Home />
      </MockProviders>
    )
    
    expect(screen.getByTitle(/current theme/i)).toBeInTheDocument()
  })

  it('shows registration link', () => {
    render(
      <MockProviders>
        <Home />
      </MockProviders>
    )
    
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
    expect(screen.getByText('Create one')).toBeInTheDocument()
  })

  it('validates email input', async () => {
    render(
      <MockProviders>
        <Home />
      </MockProviders>
    )
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
    })
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Try to submit with invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email is invalid')).toBeInTheDocument()
    })
  })

  it('validates password input', async () => {
    render(
      <MockProviders>
        <Home />
      </MockProviders>
    )
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument()
    })
    
    const passwordInput = screen.getByPlaceholderText(/enter your password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Try to submit with empty password
    fireEvent.change(passwordInput, { target: { value: '' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })
})
