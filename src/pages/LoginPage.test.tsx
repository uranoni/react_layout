import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from './LoginPage'

// Mock hooks
const mockNavigate = vi.fn()
const mockLocation = { state: { from: { pathname: '/dashboard' } } }
const mockLogin = vi.fn()
const mockSSOLogin = vi.fn()

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  }
})

vi.mock('../store/useAuthStore', () => ({
  default: () => ({
    login: mockLogin,
  }),
}))

vi.mock('../hooks/useKeycloak', () => ({
  useKeycloak: () => ({
    login: mockSSOLogin,
  }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all login form elements', () => {
    render(<LoginPage />)
    
    // 檢查 label 文字是否存在
    expect(screen.getByText('用戶名')).toBeInTheDocument()
    expect(screen.getByText('密碼')).toBeInTheDocument()
    
    // 檢查按鈕
    expect(screen.getByRole('button', { name: '本地登入' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '使用 SSO 登入' })).toBeInTheDocument()
  })

  it('updates input values when user types', () => {
    render(<LoginPage />)
    
    // 使用 querySelector 直接找到 input 元素
    const container = screen.getByRole('button', { name: '本地登入' }).closest('form')
    const usernameInput = container?.querySelector('input[type="text"]') as HTMLInputElement
    const passwordInput = container?.querySelector('input[type="password"]') as HTMLInputElement
    
    if (usernameInput && passwordInput) {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      expect(usernameInput.value).toBe('testuser')
      expect(passwordInput.value).toBe('password123')
    }
  })

  it('calls login function when form is submitted', async () => {
    mockLogin.mockResolvedValue(undefined)
    
    render(<LoginPage />)
    
    const container = screen.getByRole('button', { name: '本地登入' }).closest('form')
    const usernameInput = container?.querySelector('input[type="text"]') as HTMLInputElement
    const passwordInput = container?.querySelector('input[type="password"]') as HTMLInputElement
    const loginButton = screen.getByRole('button', { name: '本地登入' })
    
    if (usernameInput && passwordInput) {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
    }
    fireEvent.click(loginButton)
    
    // 檢查 login 函數是否被正確調用
    expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123')
  })

  it('handles SSO login click', () => {
    mockSSOLogin.mockImplementation(() => Promise.resolve())
    
    render(<LoginPage />)
    
    const ssoButton = screen.getByRole('button', { name: '使用 SSO 登入' })
    fireEvent.click(ssoButton)
    
    expect(mockSSOLogin).toHaveBeenCalled()
  })

  it('displays error message on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Login failed'))
    
    render(<LoginPage />)
    
    const container = screen.getByRole('button', { name: '本地登入' }).closest('form')
    const usernameInput = container?.querySelector('input[type="text"]') as HTMLInputElement
    const passwordInput = container?.querySelector('input[type="password"]') as HTMLInputElement
    const loginButton = screen.getByRole('button', { name: '本地登入' })
    
    if (usernameInput && passwordInput) {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    }
    fireEvent.click(loginButton)
    
    await waitFor(() => {
      expect(screen.getByText('登入失敗，請檢查您的帳號和密碼')).toBeInTheDocument()
    })
  })

  it('renders divider with correct text', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('或')).toBeInTheDocument()
  })

  it('has correct form structure', () => {
    render(<LoginPage />)
    
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
    
    // 檢查表單是否存在
    const form = screen.getByRole('button', { name: '本地登入' }).closest('form')
    expect(form).toBeInTheDocument()
  })

  it('renders form labels', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('用戶名')).toBeInTheDocument()
    expect(screen.getByText('密碼')).toBeInTheDocument()
  })

  it('prevents form submission when fields are empty', () => {
    render(<LoginPage />)
    
    const loginButton = screen.getByRole('button', { name: '本地登入' })
    fireEvent.click(loginButton)
    
    // 因為表單有 required 屬性，應該不會調用 login 函數
    expect(mockLogin).not.toHaveBeenCalled()
  })
}) 