import { useEffect } from 'react'
import useAuthStore from './store/useAuthStore'

// Auth screens
import WelcomeScreen from './components/auth/WelcomeScreen'
import PhoneLoginScreen from './components/auth/PhoneLoginScreen'
import TermsScreen from './components/auth/TermsScreen'
import OtpVerificationScreen from './components/auth/OtpVerificationScreen'
import PhoneVerifiedScreen from './components/auth/PhoneVerifiedScreen'
import RegisterScreen from './components/auth/RegisterScreen'
import KtpDocumentScreen from './components/auth/KtpDocumentScreen'
import SimDocumentScreen from './components/auth/SimDocumentScreen'
import VerificationSuccessModal from './components/auth/VerificationSuccessModal'

// Home Page (Web Version)
import HomeScreen from './pages/home/HomeScreen'

// Phase 3: Vehicle Detail Screen
import VehicleDetailScreen from './pages/vehicle/VehicleDetailScreen'
import ErrorBoundary from './components/common/ErrorBoundary'

// Auth layout
import AuthLayout from './components/auth/AuthLayout'

function App() {
  const { step, setStep } = useAuthStore()

  useEffect(() => {
    // Sinkronisasi navigasi langsung via URL query (?step=...) atau path /auth
    const params = new URLSearchParams(window.location.search)
    const stepParam = params.get('step')
    if (stepParam) {
      setStep(stepParam)
    } else if (window.location.pathname.includes('auth') || window.location.hash.includes('auth')) {
      setStep('welcome')
    }
  }, [setStep])

  // 1. TAMPILAN DETAIL KENDARAAN (Phase 3: Scheduling & Logistics)
  if (step === 'vehicle-detail') {
    return (
      <ErrorBoundary>
        <VehicleDetailScreen />
      </ErrorBoundary>
    )
  }

  // 2. TAMPILAN BERANDA VERSI WEB
  if (step === 'home') {
    return <HomeScreen />
  }

  // 3. TAMPILAN AUTHENTICATION (Login, Register & Seluruh Sub-Halaman)
  const renderAuthScreen = () => {
    switch (step) {
      case 'welcome':        return <WelcomeScreen />
      case 'phone':          return <PhoneLoginScreen />
      case 'otp':            return <OtpVerificationScreen />
      case 'phone-verified': return <PhoneVerifiedScreen />
      case 'register':       return <RegisterScreen />
      case 'ktp':            return <KtpDocumentScreen />
      case 'sim':            return <SimDocumentScreen />
      case 'terms':          return <TermsScreen />
      case 'done':           return <VerificationSuccessModal />
      default:               return <WelcomeScreen />
    }
  }

  return (
    <AuthLayout step={step}>
      {renderAuthScreen()}
    </AuthLayout>
  )
}

export default App
