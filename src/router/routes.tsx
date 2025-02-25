import { createBrowserRouter } from 'react-router';
import MainLayout from '../layout/MainLayout';
import HomePage from '../pages/HomePage';
import AttendancePage from '../pages/AttendancePage';
import AttendanceDailyPage from '../pages/AttendanceDailyPage';
import AttendanceLeavePage from '../pages/AttendanceLeavePage';
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
            element: <AttendanceDailyPage />
          },
          {
            path: 'leave',
            element: <AttendanceLeavePage />
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