import { createBrowserRouter } from 'react-router';
import MainLayout from '../layout/MainLayout';
import HomePage from '../pages/HomePage';
import AttendancePage from '../pages/attendance/AttendancePage';
import Daily from '../pages/attendance/Daily';
import Leave from '../pages/attendance/Leave';
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
        children: [
          {
            path: 'daily',
            element: <Daily />
          },
          {
            path: 'leave',
            element: <Leave />
          }
        ]
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