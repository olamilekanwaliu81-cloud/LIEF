import { useNavigate } from 'react-router'
import { Compass } from 'lucide-react'
import { Button, Logo, display } from './ui'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-5 gap-5" style={{ background: 'var(--background)' }}>
      <Logo size="lg" />
      <Compass size={44} style={{ color: 'var(--border)' }} />
      <div>
        <h1 className="text-2xl font-black" style={{ ...display, color: 'var(--primary)' }}>Page not found</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>The page you’re looking for doesn’t exist or has moved.</p>
      </div>
      <Button variant="accent" onClick={() => navigate('/')}>Back to home</Button>
    </div>
  )
}
