import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/forms/Button'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn()
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    )
    
    const button = screen.getByText('Click me')
    fireEvent.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Click me</Button>)
    const button = screen.getByText('Click me')
    expect(button).toHaveClass('custom-class')
  })

  it('should render with different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByText('Primary')).toBeInTheDocument()

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByText('Secondary')).toBeInTheDocument()
  })
})

