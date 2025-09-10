import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card'

describe('Card Components', () => {
  it('renders Card with children', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    )
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders CardHeader with children', () => {
    render(
      <CardHeader>
        <h2>Card Title</h2>
      </CardHeader>
    )
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(screen.getByText('Card Title')).toBeInTheDocument()
  })

  it('renders CardContent with children', () => {
    render(
      <CardContent>
        <p>Card content text</p>
      </CardContent>
    )
    expect(screen.getByText('Card content text')).toBeInTheDocument()
  })

  it('renders CardFooter with children', () => {
    render(
      <CardFooter>
        <button>Footer action</button>
      </CardFooter>
    )
    expect(screen.getByRole('button', { name: /footer action/i })).toBeInTheDocument()
  })

  it('accepts custom className', () => {
    render(
      <Card className="custom-card">
        <div>Custom card</div>
      </Card>
    )
    const card = screen.getByText('Custom card').parentElement
    expect(card).toHaveClass('custom-card')
  })
})
