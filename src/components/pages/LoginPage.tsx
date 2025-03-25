import logoImage from '@/assets/Logo.png' // Thay bằng đường dẫn ảnh của bạn
import happyImage from '@/assets/happy.jpg' // Thay bằng đường dẫn ảnh của bạn
import { useAuth } from '@/contexts/AuthContext'
import { Button, Form, Input, message } from 'antd'
import React, { useState } from 'react'
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
      message.success('Đăng nhập thành công')
      navigate('/')
    } catch (err) {
      // message.error(error || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex h-screen bg-white'>
      {/* Cột ảnh bên trái */}
      <div className='hidden md:flex md:w-1/2 h-full overflow-hidden'>
        <img src={happyImage} alt='Login Illustration' className='object-cover w-full h-full' />
      </div>

      {/* Cột form bên phải */}
      <div className='w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 mx-auto'>
        <div className='w-full max-w-md '>
          <div className='text-center mb-8'>
            <img
              src={logoImage} // Thay bằng logo của bạn
              alt='Logo'
              className='h-16 mx-auto mb-4'
            />
            <h1 className='text-3xl font-bold text-gray-800'>Chào mừng bạn đến với</h1>
            <h2 className='text-3xl font-bold text-[#ec4899] mt-1 mb-5'>Tiện ích người già</h2>
            <p className='text-gray-600'>Vui lòng nhập thông tin để đăng nhập</p>
          </div>

          <Form<LoginFormValues>
            name='login'
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout='vertical'
            className='w-full'
          >
            <Form.Item
              label='Địa chỉ Email'
              name='email'
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Vui lòng nhập địa chỉ email hợp lệ!' }
              ]}
            >
              <Input placeholder='Vui lòng nhập email' size='large' className='py-2' />
            </Form.Item>

            <Form.Item
              className='mt-10'
              label='Mật khẩu'
              name='password'
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu của bạn!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password placeholder='Nhập mật khẩu của bạn' size='large' className='py-2' />
            </Form.Item>

            <Form.Item className='mt-16'>
              <Button
                type='primary'
                htmlType='submit'
                loading={loading}
                className='w-full h-12 text-lg font-medium'
                style={{ background: 'linear-gradient(135deg, #ec4899, #ff7d47)' }}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
