import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AuthSection from '../components/AuthSection'
import FeaturesSection from '../components/FeaturesSection'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import HowItWorksSection from '../components/HowItWorksSection'
import Navbar from '../components/Navbar'

const ACCESS_TOKEN_KEY = 'devcare_access_token'
const REFRESH_TOKEN_KEY = 'devcare_refresh_token'
const USERNAME_KEY = 'devcare_username'

function getStoredAuth() {
  return {
    access: localStorage.getItem(ACCESS_TOKEN_KEY),
    refresh: localStorage.getItem(REFRESH_TOKEN_KEY),
    username: localStorage.getItem(USERNAME_KEY),
  }
}

function LandingPage() {
  const [auth, setAuth] = useState(getStoredAuth)
  const isAuthenticated = Boolean(auth.access)
  const navigate = useNavigate()

  function storeAuth(access, refresh, username) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
    localStorage.setItem(USERNAME_KEY, username)
    setAuth({ access, refresh, username })
  }

  const handleAuthSuccess = (access, refresh, username) => {
    storeAuth(access, refresh, username)
    setTimeout(() => navigate('/dashboard'), 600)
  }

  return (
    <div className="app-shell">
      <Navbar />

      <main>
        {!isAuthenticated ? (
          <>
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />

            <section className="site-container pb-20" id="auth">
              <AuthSection onAuthSuccess={handleAuthSuccess} />
            </section>
          </>
        ) : (
          <section className="site-container pb-20 pt-20">
            <div className="elevated-card rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center sm:px-10">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                Welcome back
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Welcome, {auth.username}!
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-text-muted)] sm:text-lg">
                You are logged in. Go to the dashboard to start using DevCare.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default LandingPage