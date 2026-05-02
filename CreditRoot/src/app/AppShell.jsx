import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'
import { AppFooter } from '../components/layout/AppFooter'
import { LandingScreen } from '../screens/LandingScreen'
import { AuthScreen } from '../screens/AuthScreen'
import { HomeScreen } from '../screens/HomeScreen'
import { PlannerScreen } from '../screens/PlannerScreen'
import { DashboardScreen } from '../screens/DashboardScreen'
import { WithdrawalScreen } from '../screens/WithdrawalScreen'

function AppLayout({ usuario }) {
  return (
    <div className="bg-surface min-h-screen">
      <AppHeader usuario={usuario} />
      <main>
        <Routes>
          <Route path="/home" element={<HomeScreen usuario={usuario} />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/planner" element={<PlannerScreen />} />
          <Route path="/withdrawal" element={<WithdrawalScreen />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
      <AppFooter />
    </div>
  )
}

export function AppShell() {
  const [usuario, setUsuario] = useState(null)
  const navigate = useNavigate()

  function handleAuth(datos) {
    setUsuario(datos)
    navigate('/home')
  }

  return (
    <Routes>
      <Route path="/" element={<LandingScreen onLogin={() => navigate('/login')} onRegister={() => navigate('/register')} />} />
      <Route path="/login" element={<AuthScreen modo="login" onAuth={handleAuth} onVolver={() => navigate('/')} />} />
      <Route path="/register" element={<AuthScreen modo="register" onAuth={handleAuth} onVolver={() => navigate('/')} />} />
      <Route path="/*" element={usuario ? <AppLayout usuario={usuario} /> : <Navigate to="/" replace />} />
    </Routes>
  )
}