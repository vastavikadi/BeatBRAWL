'use client'

import { useRouter } from 'next/navigation'
import HiveLogin from '../components/HiveLogin'

export default function LoginPage() {
  const router = useRouter()
  
  const handleLoginSuccess = (username, token) => {
    console.log('Login successful:', username)
    // Any additional logic you want to run on successful login
    // The HiveLogin component already handles setting localStorage and redirecting
  }
  
  return <HiveLogin onSuccess={handleLoginSuccess} />
}
