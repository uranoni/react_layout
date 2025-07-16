import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Summary from './Summary';

// Mock setTimeout to avoid actual delays in tests
vi.mock('global', () => ({
  setTimeout: vi.fn((fn) => fn())
}));

describe('Summary', () => {
  it('renders all main components correctly', () => {
    render(<Summary />);
    
    // 檢查基本元素是否存在
    expect(screen.getByText('站點')).toBeInTheDocument();
    expect(screen.getByText('時間範圍')).toBeInTheDocument();
    expect(screen.getByText('查詢')).toBeInTheDocument();
    
    // 檢查站點選擇
    expect(screen.getByDisplayValue('新竹')).toBeInTheDocument();
    
    // 檢查時間範圍選項
    expect(screen.getByLabelText('年月')).toBeInTheDocument();
    expect(screen.getByLabelText('日期區間')).toBeInTheDocument();
  });

  it('renders heatmap legend correctly', () => {
    render(<Summary />);
    
    // 檢查圖例是否存在
    expect(screen.getByText('已簽到 (checkin)')).toBeInTheDocument();
    expect(screen.getByText('未簽到 (pending)')).toBeInTheDocument();
    expect(screen.getByText('請假 (leave)')).toBeInTheDocument();
  });

  it('allows site selection', () => {
    render(<Summary />);
    
    const siteSelect = screen.getByDisplayValue('新竹');
    fireEvent.change(siteSelect, { target: { value: '台中' } });
    
    expect(siteSelect).toHaveValue('台中');
  });

  it('allows time range type switching', () => {
    render(<Summary />);
    
    const monthRadio = screen.getByLabelText('年月');
    const rangeRadio = screen.getByLabelText('日期區間');
    
    // 默認應該是日期區間
    expect(rangeRadio).toBeChecked();
    expect(monthRadio).not.toBeChecked();
    
    // 切換到年月
    fireEvent.click(monthRadio);
    expect(monthRadio).toBeChecked();
    expect(rangeRadio).not.toBeChecked();
  });

  it('displays year and month inputs when month type is selected', () => {
    render(<Summary />);
    
    const monthRadio = screen.getByLabelText('年月');
    fireEvent.click(monthRadio);
    
    expect(screen.getByText('年份')).toBeInTheDocument();
    expect(screen.getByText('月份')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025')).toBeInTheDocument();
  });

  it('displays date range inputs when range type is selected', () => {
    render(<Summary />);
    
    // 默認就是日期區間類型
    expect(screen.getByText('開始日期')).toBeInTheDocument();
    expect(screen.getByText('結束日期')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025/07/01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025/07/02')).toBeInTheDocument();
  });

  it('handles search button click', () => {
    render(<Summary />);
    
    const searchButton = screen.getByText('查詢');
    expect(searchButton).toBeInTheDocument();
    expect(searchButton).not.toBeDisabled();
    
    fireEvent.click(searchButton);
    
    // 點擊後應該顯示載入狀態
    expect(screen.getByText('查詢中...')).toBeInTheDocument();
  });
}); 