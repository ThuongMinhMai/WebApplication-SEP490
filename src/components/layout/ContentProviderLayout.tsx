import { useAuth } from '@/contexts/AuthContext'
import {
  BellOutlined,
  CustomerServiceOutlined,
  DeploymentUnitOutlined,
  ExclamationCircleOutlined,
  LogoutOutlined,
  PieChartOutlined,
  ReadOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Avatar, Badge, Dropdown, Layout, Menu, Modal } from 'antd'
import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../../assets/Logo.png'

const { Header, Content, Footer, Sider } = Layout

export default function ContentProviderLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Hàm ánh xạ route sang menu key
  const getSelectedKeyFromPath = (pathname: string): string => {
    const pathSegments = pathname.split('/')
    const lastSegment = pathSegments.pop() || 'dashboard'
    const secondLastSegment = pathSegments.pop() || ''
    if (secondLastSegment === 'books') {
      return '3' // key của menu Doctors
    }
    if (secondLastSegment === 'musics') {
      return '4' // key của menu Doctors
    }
    if (secondLastSegment === 'exercises') {
      return '2' // key của menu Doctors
    }

    const path = pathname.split('/').pop() || 'dashboard'

    const routeToKeyMap: Record<string, string> = {
      dashboard: '1',
      exercises: '2',
      books: '3',
      musics: '4'
    }

    return routeToKeyMap[path] || '0'
  }

  const [selectedKeys, setSelectedKeys] = useState([getSelectedKeyFromPath(location.pathname)])

  // Theo dõi thay đổi route
  useEffect(() => {
    setSelectedKeys([getSelectedKeyFromPath(location.pathname)])
  }, [location.pathname])

  const handleMenuClick = (key: string) => {
    setSelectedKeys([key])
    switch (key) {
      case '1':
        navigate('/content-provider/dashboard')
        break
      case '2':
        navigate('/content-provider/exercises')
        break
      case '3':
        navigate('/content-provider/books')
        break
      case '4':
        navigate('/content-provider/musics')
        break
      default:
        navigate('/content-provider/dashboard')
    }
  }

  const handleLogout = () => {
    Modal.confirm({
      title: 'Xác nhận đăng xuất',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn đăng xuất?',
      okText: 'Đăng xuất',
      cancelText: 'Hủy',
      onOk() {
        logout()
        navigate('/login')
      },
      okButtonProps: { danger: true }
    })
  }

  return (
    <div className='flex min-h-screen bg-white'>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className='bg-white shadow-md custom-sider z-30'
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          overflow: 'auto'
        }}
      >
        <div className='flex flex-col items-center p-4 whitespace-nowrap overflow-hidden'>
          <img src={Logo} alt='Logo' className='w-10 h-10 mr-2' />
          {!collapsed && <span className='text-[#FF1356] font-medium text-lg'>Tiện ích tuổi già</span>}
        </div>

        <Menu
          theme='light'
          mode='inline'
          selectedKeys={selectedKeys}
          onSelect={({ key }) => handleMenuClick(key as string)}
        >
          <Menu.Item key='1' icon={<PieChartOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key='2' icon={<DeploymentUnitOutlined />}>
            Bài tập
          </Menu.Item>
          <Menu.Item key='3' icon={<ReadOutlined />}>
            Sách
          </Menu.Item>
          <Menu.Item key='4' icon={<CustomerServiceOutlined />}>
            Âm Nhạc
          </Menu.Item>
        </Menu>
      </Sider>

      <div
        className='flex-1 flex flex-col'
        style={{
          marginLeft: collapsed ? '80px' : '200px',
          transition: 'margin-left 0.2s'
        }}
      >
        <Header
          className='px-5 flex justify-end items-center bg-white shadow-md'
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}
        >
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key='user-info' disabled style={{ cursor: 'default' }}>
                  <p style={{ color: '#666' }}>Xin chào!</p>
                  <p className='text-[#FF1356] font-bold'>{user?.fullName || 'User'}</p>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key='profile' onClick={() => navigate('/content-provider/profile')}>
                  <span>
                    <UserOutlined />
                    <span> Hồ sơ người dùng</span>
                  </span>
                </Menu.Item>
                <Menu.Item key='logout' style={{ color: '#ec4849' }} onClick={handleLogout}>
                  <span>
                    <LogoutOutlined />
                    <span> Đăng xuất</span>
                  </span>
                </Menu.Item>
              </Menu>
            }
          >
            <Avatar
              style={{
                background: user?.avatar ? 'transparent' : 'linear-gradient(135deg, #ec4899, ##FF1356)',
                cursor: 'pointer',
                color: 'white'
              }}
              src={user?.avatar}
              icon={!user?.avatar && <UserOutlined />}
            >
              {!user?.avatar && user?.fullName?.charAt(0).toUpperCase()}
            </Avatar>
          </Dropdown>
        </Header>

        <Content className='p-5 bg-white flex-1'>
          <Outlet />
        </Content>

        <Footer style={{ color: '#FF1356' }} className='text-center bg-white py-4 '>
          Senior Essentials Design ©2025 Created by LUXDEN
        </Footer>
      </div>
    </div>
  )
}
