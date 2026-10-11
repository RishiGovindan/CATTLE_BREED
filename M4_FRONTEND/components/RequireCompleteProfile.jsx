import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
export default function RequireCompleteProfile({ children }) { const { isAuthenticated,isProfileComplete,ready }=useAuth(); const location=useLocation(); if(!ready) return null; if(!isAuthenticated) return <Navigate to="/login" replace state={{from:location}}/>; if(!isProfileComplete) return <Navigate to="/complete-profile" replace state={{from:location}}/>; return children }
