import { message } from 'antd'
import axios from 'axios'
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

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
  initialized: boolean // Thêm trạng thái initialized
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token')
  })
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('refreshToken'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false) // Thêm state để theo dõi khởi tạo

  const fetchUser = useCallback(async (authToken: string) => {
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
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return logout() // Không có refreshToken thì logout

    try {
      const response = await axios.post('https://api.diavan-valuation.asia/auth-management/refresh-token', {
        token: refreshToken
      })

      if (response.data.accessToken) {
        // const newToken = response.data.accessToken
        // localStorage.setItem('token', newToken)
        // setToken(newToken)
        // await fetchUser(newToken)
        const newToken = response.data.accessToken
        const newRefreshToken = response.data.refreshToken
        localStorage.setItem('token', newToken)
        localStorage.setItem('refreshToken', newRefreshToken)
        setToken(newToken)
        setRefreshToken(newRefreshToken)
        await fetchUser(newToken)
      }
    } catch (err) {
      console.error('Failed to refresh access token', err)
      logout() // Refresh thất bại thì logout
    }
  }, [refreshToken, fetchUser])
  // Effect để khởi tạo khi component mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token')
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (storedToken) {
        try {
          await fetchUser(storedToken)
          setToken(storedToken)
        } catch (err) {
          await refreshAccessToken()
          // console.error('Failed to initialize auth', err)
        }
      }
      setInitialized(true) // Đánh dấu đã khởi tạo xong
    }
    initializeAuth()
  }, [fetchUser, refreshAccessToken, token])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const loginResponse = await axios.post(
        'https://api.diavan-valuation.asia/auth-management/managed-auths/sign-ins',
        { email, password, deviceToken: 'string' }
      )

      if (loginResponse.data.isSuccess && loginResponse.data.data.accessToken) {
        const newToken = loginResponse.data.data.accessToken
        const newRefreshToken = loginResponse.data.data.refreshToken
        localStorage.setItem('token', newToken)
        localStorage.setItem('refreshToken', newRefreshToken)
        setToken(newToken)
        setRefreshToken(newRefreshToken)

        await fetchUser(newToken)
      } else {
        message.error(loginResponse.data.data)

        throw new Error('Đăng nhập thất bại' + loginResponse.data.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setToken(null)
    setRefreshToken(null)
    setUser(null)
    message.success('Đăng xuất thành công!')
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
    error,
    initialized // Thêm vào context value
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
