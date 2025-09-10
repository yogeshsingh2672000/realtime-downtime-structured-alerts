import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Mock the theme context
const mockSetTheme = jest.fn()

const MockThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
)

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders theme toggle button', () => {
    render(
      <MockThemeProvider>
        <ThemeToggle />
      </MockThemeProvider>
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('displays dark theme icon by default', () => {
    render(
      <MockThemeProvider>
        <ThemeToggle />
      </MockThemeProvider>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('🌙')
  })

  it('cycles through themes when clicked', () => {
    render(
      <MockThemeProvider>
        <ThemeToggle />
      </MockThemeProvider>
    )
    
    const button = screen.getByRole('button')
    
    // Click to cycle to system theme
    fireEvent.click(button)
    expect(button).toHaveTextContent('🖥️')
    
    // Click to cycle to light theme
    fireEvent.click(button)
    expect(button).toHaveTextContent('☀️')
    
    // Click to cycle back to dark theme
    fireEvent.click(button)
    expect(button).toHaveTextContent('🌙')
  })

  it('has proper accessibility attributes', () => {
    render(
      <MockThemeProvider>
        <ThemeToggle />
      </MockThemeProvider>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title')
  })
})
