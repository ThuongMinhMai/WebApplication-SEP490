// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

interface User {
  accountId: number
  roleId: number
  roleName: string | null
  email: string
  fullName: string
  avatar: string
  gender: string
  phoneNumber: string
  dateOfBirth: string
  status: string
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isContentProvider: boolean
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async (authToken: string) => {
    try {
      setLoading(true)
      const response = await axios.get('https://api.diavan-valuation.asia/auth-management', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })

      if (response.data.user) {
        setUser(response.data.user)
      }
    } catch (err) {
      console.error('Failed to fetch user data', err)
      logout()
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      fetchUser(storedToken).catch(() => {
        // Xử lý lỗi nếu cần
      })
    }
  }, [token])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      // 1. Đăng nhập để lấy token
      const loginResponse = await axios.post(
        'https://api.diavan-valuation.asia/auth-management/managed-auths/sign-ins',
        { email, password, deviceToken: 'string' }
      )
      console.log(loginResponse)
      if (loginResponse.data.isSuccess && loginResponse.data.data) {
        const newToken = loginResponse.data.data

        // 2. Lưu token
        localStorage.setItem('token', newToken)
        setToken(newToken)

        // 3. Lấy thông tin user bằng token mới
        await fetchUser(newToken)
      } else {
        throw new Error('Login failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setToken(null)
  }

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.roleId === 1,
    isContentProvider: user?.roleId === 5,
    loading,
    error
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
