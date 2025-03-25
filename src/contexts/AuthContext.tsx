// // // src/context/AuthContext.tsx
// // import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
// // import axios from 'axios'

// // interface User {
// //   accountId: number
// //   roleId: number
// //   roleName: string | null
// //   email: string
// //   fullName: string
// //   avatar: string
// //   gender: string
// //   phoneNumber: string
// //   dateOfBirth: string
// //   status: string
// //   isVerified: boolean
// // }

// // interface AuthContextType {
// //   user: User | null
// //   token: string | null
// //   login: (email: string, password: string) => Promise<void>
// //   logout: () => void
// //   isAuthenticated: boolean
// //   isAdmin: boolean
// //   isContentProvider: boolean
// //   loading: boolean
// //   error: string | null
// // }

// // const AuthContext = createContext<AuthContextType | undefined>(undefined)

// // export function AuthProvider({ children }: { children: React.ReactNode }) {
// //   const [user, setUser] = useState<User | null>(() => {
// //     // Khôi phục user từ localStorage nếu có
// //     const storedUser = localStorage.getItem('user')
// //     return storedUser ? JSON.parse(storedUser) : null
// //   })
// //   const [token, setToken] = useState<string | null>(() => {
// //     // Khôi phục token từ localStorage
// //     return localStorage.getItem('token')
// //   })
// //   const [loading, setLoading] = useState(false)
// //   const [error, setError] = useState<string | null>(null)

// //   const fetchUser = useCallback(async (authToken: string) => {
// //     try {
// //       setLoading(true)
// //       const response = await axios.get('https://api.diavan-valuation.asia/auth-management', {
// //         headers: {
// //           Authorization: `Bearer ${authToken}`
// //         }
// //       })

// //       if (response.data.user) {
// //         const userData = response.data.user
// //         setUser(userData)
// //         // Lưu user vào localStorage
// //         localStorage.setItem('user', JSON.stringify(userData))
// //       }
// //     } catch (err) {
// //       console.error('Failed to fetch user data', err)
// //       // Nếu token không hợp lệ, xóa tất cả dữ liệu đăng nhập
// //       localStorage.removeItem('token')
// //       localStorage.removeItem('user')
// //       setToken(null)
// //       setUser(null)
// //       throw err
// //     } finally {
// //       setLoading(false)
// //     }
// //   }, [])

// //   useEffect(() => {
// //     // Chỉ fetch user khi có token nhưng chưa có user
// //     if (token && !user) {
// //       fetchUser(token).catch(() => {
// //         // Xử lý lỗi nếu cần
// //       })
// //     }
// //   }, [token, user, fetchUser])

// //   const login = async (email: string, password: string) => {
// //     setLoading(true)
// //     setError(null)

// //     try {
// //       // 1. Đăng nhập để lấy token
// //       const loginResponse = await axios.post(
// //         'https://api.diavan-valuation.asia/auth-management/managed-auths/sign-ins',
// //         { email, password, deviceToken: 'string' }
// //       )

// //       if (loginResponse.data.isSuccess && loginResponse.data.data) {
// //         const newToken = loginResponse.data.data

// //         // 2. Lưu token
// //         localStorage.setItem('token', newToken)
// //         setToken(newToken)

// //         // 3. Lấy thông tin user bằng token mới
// //         await fetchUser(newToken)
// //       } else {
// //         throw new Error('Login failed')
// //       }
// //     } catch (err) {
// //       setError(err instanceof Error ? err.message : 'Login failed')
// //       throw err
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const logout = () => {
// //     // Xóa tất cả dữ liệu đăng nhập
// //     localStorage.removeItem('token')
// //     localStorage.removeItem('user')
// //     setUser(null)
// //     setToken(null)
// //   }

// //   const value = {
// //     user,
// //     token,
// //     login,
// //     logout,
// //     isAuthenticated: !!user && !!token,
// //     isAdmin: user?.roleId === 1,
// //     isContentProvider: user?.roleId === 5,
// //     loading,
// //     error
// //   }

// //   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// // }

// // export function useAuth(): AuthContextType {
// //   const context = useContext(AuthContext)
// //   if (context === undefined) {
// //     throw new Error('useAuth must be used within an AuthProvider')
// //   }
// //   return context
// // }

// // src/context/AuthContext.tsx
// import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
// import axios from 'axios'

// interface User {
//   accountId: number
//   roleId: number
//   roleName: string | null
//   email: string
//   fullName: string
//   avatar: string
//   gender: string
//   phoneNumber: string
//   dateOfBirth: string
//   status: string
//   isVerified: boolean
// }

// interface AuthContextType {
//   user: User | null
//   token: string | null
//   login: (email: string, password: string) => Promise<void>
//   logout: () => void
//   isAuthenticated: boolean
//   isAdmin: boolean
//   isContentProvider: boolean
//   loading: boolean
//   error: string | null
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null) // Không khôi phục user từ localStorage
//   const [token, setToken] = useState<string | null>(() => {
//     // Chỉ khôi phục token từ localStorage
//     return localStorage.getItem('token')
//   })
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const fetchUser = useCallback(async (authToken: string) => {
//     try {
//       setLoading(true)
//       const response = await axios.get('https://api.diavan-valuation.asia/auth-management', {
//         headers: {
//           Authorization: `Bearer ${authToken}`
//         }
//       })

//       if (response.data.user) {
//         const userData = response.data.user
//         setUser(userData)
//         // KHÔNG lưu user vào localStorage nữa
//       }
//     } catch (err) {
//       console.error('Failed to fetch user data', err)
//       // Nếu token không hợp lệ, xóa token
//       localStorage.removeItem('token')
//       setToken(null)
//       setUser(null)
//       throw err
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     // Tự động fetch user khi có token (kể cả khi refresh trang)
//     if (token) {
//       fetchUser(token).catch(() => {
//         // Xử lý lỗi nếu cần
//       })
//     }
//   }, [token, fetchUser]) // Đã bỏ dependency 'user'

//   const login = async (email: string, password: string) => {
//     setLoading(true)
//     setError(null)

//     try {
//       const loginResponse = await axios.post(
//         'https://api.diavan-valuation.asia/auth-management/managed-auths/sign-ins',
//         { email, password, deviceToken: 'string' }
//       )

//       if (loginResponse.data.isSuccess && loginResponse.data.data) {
//         const newToken = loginResponse.data.data
//         localStorage.setItem('token', newToken)
//         setToken(newToken)
//         // Đợi fetch user hoàn thành trước khi kết thúc login
//         await fetchUser(newToken)
//       } else {
//         throw new Error('Login failed')
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Login failed')
//       throw err
//     } finally {
//       setLoading(false)
//     }
//   }

//   const logout = () => {
//     localStorage.removeItem('token')
//     setToken(null)
//     setUser(null)
//   }

//   const value = {
//     user,
//     token,
//     login,
//     logout,
//     isAuthenticated: !!user && !!token,
//     isAdmin: user?.roleId === 1,
//     isContentProvider: user?.roleId === 5,
//     loading,
//     error
//   }

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// }

// export function useAuth(): AuthContextType {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider')
//   }
//   return context
// }
// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import axios from 'axios'
import { message } from 'antd'

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

  // Effect để khởi tạo khi component mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          await fetchUser(storedToken)
          setToken(storedToken)
        } catch (err) {
          console.error('Failed to initialize auth', err)
        }
      }
      setInitialized(true) // Đánh dấu đã khởi tạo xong
    }

    initializeAuth()
  }, [fetchUser])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const loginResponse = await axios.post(
        'https://api.diavan-valuation.asia/auth-management/managed-auths/sign-ins',
        { email, password, deviceToken: 'string' }
      )

      if (loginResponse.data.isSuccess && loginResponse.data.data) {
        const newToken = loginResponse.data.data
        localStorage.setItem('token', newToken)
        setToken(newToken)
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
    setToken(null)
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
