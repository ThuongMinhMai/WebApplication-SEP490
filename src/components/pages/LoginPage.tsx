import React, { useState } from 'react'
import { Button, Form, Input, message } from 'antd'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface LoginFormValues {
  email: string
  password: string
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const { login, error } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true)
    try {
      await login(values.email, values.password)
      message.success('Login successful')
      navigate('/') // Chuyển hướng sau khi đăng nhập thành công
    } catch (err) {
      message.error(error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 bg-white rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold text-center mb-6'>Login</h1>
        <Form<LoginFormValues> name='login' initialValues={{ remember: true }} onFinish={onFinish} layout='vertical'>
          <Form.Item
            label='Email'
            name='email'
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' }
            ]}
          >
            <Input placeholder='Enter your email' />
          </Form.Item>

          <Form.Item
            label='Password'
            name='password'
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password placeholder='Enter your password' />
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit' loading={loading} className='w-full' size='large'>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default LoginPage
