import { useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Landing from './components/Landing'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import TeacherSignIn from './components/TeacherSignIn'
import TeacherSignUp from './components/TeacherSignUp'
import TeacherDashboard from './components/TeacherDashboard'
import Dashboard from './components/Dashboard'
import Journey from './components/Journey'
import Support from './components/Support'
import Profile from './components/Profile'
import Settings from './components/Settings'
import Notifications from './components/Notifications'
import Header from './components/Header'
import NavBar from './components/NavBar'

type Screen = 'landing' | 'signin' | 'signup' | 'teacher-signin' | 'teacher-signup' | 'app' | 'teacher-app'
export type Tab = 'dashboard' | 'journey' | 'support' | 'profile' | 'settings'

function AppInner() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)

  const navigateToSupport = (concern: string) => {
    setSelectedConcern(concern)
    setActiveTab('support')
  }

  if (screen === 'landing') {
    return (
      <Landing
        onSignIn={() => setScreen('signin')}
        onSignUp={() => setScreen('signup')}
        onTeacherSignIn={() => setScreen('teacher-signin')}
        onTeacherSignUp={() => setScreen('teacher-signup')}
      />
    )
  }
  if (screen === 'signin')
    return <SignIn onBack={() => setScreen('landing')} onSignIn={() => setScreen('app')} onGoSignUp={() => setScreen('signup')} />
  if (screen === 'signup')
    return <SignUp onBack={() => setScreen('landing')} onSignUp={() => setScreen('app')} onGoSignIn={() => setScreen('signin')} />
  if (screen === 'teacher-signin')
    return <TeacherSignIn onBack={() => setScreen('landing')} onSignIn={() => setScreen('teacher-app')} onGoSignUp={() => setScreen('teacher-signup')} />
  if (screen === 'teacher-signup')
    return <TeacherSignUp onBack={() => setScreen('landing')} onSignUp={() => setScreen('teacher-app')} onGoSignIn={() => setScreen('teacher-signin')} />
  if (screen === 'teacher-app')
    return <TeacherDashboard onSignOut={() => setScreen('landing')} />

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header onSignOut={() => setScreen('landing')} onBellClick={() => setShowNotifications(v => !v)} notifCount={3} />
      <main className="flex-1 pb-24 overflow-y-auto">
        {showNotifications ? (
          <Notifications onClose={() => setShowNotifications(false)} />
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard onNavigateToSupport={navigateToSupport} />}
            {activeTab === 'journey' && <Journey />}
            {activeTab === 'support' && <Support selectedConcern={selectedConcern} onClearConcern={() => setSelectedConcern(null)} />}
            {activeTab === 'profile' && <Profile onSignOut={() => setScreen('landing')} />}
            {activeTab === 'settings' && <Settings onSignOut={() => setScreen('landing')} />}
          </>
        )}
      </main>
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}
