import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex')
  })

  it('renders with primary variant by default', () => {
    render(<Button>Primary Button</Button>)
    const button = screen.getByRole('button', { name: /primary button/i })
    expect(button).toHaveClass('hover:bg-white/10')
  })

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost Button</Button>)
    const button = screen.getByRole('button', { name: /ghost button/i })
    expect(button).toHaveClass('bg-transparent')
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50')
  })

  it('accepts custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)
    const button = screen.getByRole('button', { name: /custom button/i })
    expect(button).toHaveClass('custom-class')
  })
})
