import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  )
}

describe('ThemeContext', () => {
  it('provides default theme values', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
  })

  it('allows changing theme to light', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    fireEvent.click(screen.getByText('Set Light'))
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
  })

  it('allows changing theme to dark', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    fireEvent.click(screen.getByText('Set Dark'))
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
  })

  it('allows changing theme to system', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    fireEvent.click(screen.getByText('Set System'))
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
  })
})
