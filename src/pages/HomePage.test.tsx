import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('renders main title correctly', () => {
    render(<HomePage />)
    expect(screen.getByText('歡迎使用管理系統')).toBeInTheDocument()
  })

  it('renders all dashboard cards', () => {
    render(<HomePage />)
    
    // 檢查所有卡片標題
    expect(screen.getByText('今日出勤')).toBeInTheDocument()
    expect(screen.getByText('請假人數')).toBeInTheDocument()
    expect(screen.getByText('遲到人數')).toBeInTheDocument()
  })

  it('displays correct statistics values', () => {
    render(<HomePage />)
    
    // 檢查統計數據
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('3 人')).toBeInTheDocument()
    expect(screen.getByText('1 人')).toBeInTheDocument()
  })

  it('has correct structure with dashboard container', () => {
    render(<HomePage />)
    
    const title = screen.getByText('歡迎使用管理系統')
    expect(title.tagName).toBe('H1')
    
    // 檢查卡片標題是 H3
    const cardTitles = screen.getAllByRole('heading', { level: 3 })
    expect(cardTitles).toHaveLength(3)
  })

  it('renders all required elements', () => {
    render(<HomePage />)
    
    // 檢查所有必要元素都存在
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3)
  })
}) 