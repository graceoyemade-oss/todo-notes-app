import { useState, useEffect, useRef } from 'react'

// Google Sign-In component using Google Identity Services
export default function GoogleAuth({ onLogin, onLogout }) {
  const [user, setUser] = useState(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    // Load the Google Identity Services script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      })

      // Render the Google Sign-In button
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'filled_blue',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 280,
        })
      }
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  async function handleCredentialResponse(response) {
    try {
      // Send the credential to your backend for verification
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      })

      if (!res.ok) throw new Error('Authentication failed')

      const data = await res.json()
      setUser(data.user)
      onLogin?.(data.user)
    } catch (err) {
      console.error('Google sign-in failed:', err)
    }
  }

  function handleSignOut() {
    window.google.accounts.id.disableAutoSelect()
    setUser(null)
    onLogout?.()
  }

  if (user) {
    return (
      <div className="google-user">
        <img src={user.picture} alt={user.name} className="google-avatar" />
        <span className="google-user-name">{user.name}</span>
        <button className="google-signout-btn" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    )
  }

  return <div ref={buttonRef} className="google-auth-container" />
}
