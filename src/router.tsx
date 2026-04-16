import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MePage from './pages/MePage'
import RegisterPage from './pages/RegisterPage'
import PoliciesPage from './pages/PoliciesPage'
import PolicyDetailPage from './pages/PolicyDetailPage'
import PolicyFormPage from './pages/PolicyFormPage'
import ClaimsPage from './pages/ClaimsPage'
import ClaimDetailPage from './pages/ClaimDetailPage'
import ClaimFormPage from './pages/ClaimFormPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'me', element: <MePage /> },
          { path: 'policies', element: <PoliciesPage /> },
          { path: 'policies/new', element: <PolicyFormPage /> },
          { path: 'policies/:id', element: <PolicyDetailPage /> },
          { path: 'policies/:id/edit', element: <PolicyFormPage /> },
          { path: 'claims', element: <ClaimsPage /> },
          { path: 'claims/new', element: <ClaimFormPage /> },
          { path: 'claims/:id', element: <ClaimDetailPage /> },
        ],
      },
    ],
  },
])
