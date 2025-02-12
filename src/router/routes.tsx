import { createBrowserRouter } from 'react-router';
import MainLayout from '../layout/MainLayout';
import HomePage from '../pages/HomePage';
import AttendancePage from '../pages/AttendancePage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'attendance',
        element: <AttendancePage />,
        name: '出勤系統',
        icon: 'clock'
      }
    ]
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]); 