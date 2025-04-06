import { useAuth } from '@/contexts/AuthContext'
import {
  AlertOutlined,
  BellOutlined,
  DesktopOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  LogoutOutlined,
  PieChartOutlined,
  SettingOutlined,
  SnippetsOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Avatar, Badge, Dropdown, Layout, Menu, Modal } from 'antd'
import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../../assets/Logo.png'

const { Header, Content, Footer, Sider } = Layout
const { SubMenu } = Menu

const AdminLayout = () => {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  // const [selectedKeys, setSelectedKeys] = useState(['1'])
  // Hàm ánh xạ route sang menu key
  const getSelectedKeyFromPath = (pathname: string): string => {
    const pathSegments = pathname.split('/')
    const lastSegment = pathSegments.pop() || 'dashboard'
    const secondLastSegment = pathSegments.pop() || ''

    // Xử lý các route có dạng /admin/doctors/:id
    if (secondLastSegment === 'doctors') {
      return '3' // key của menu Doctors
    }
    if (secondLastSegment === 'musics') {
      return '9' // key của menu Doctors
    }
    if (secondLastSegment === 'exercises') {
      return '7' // key của menu Doctors
    }
    const path = pathname.split('/').pop() || 'dashboard'

    const routeToKeyMap: Record<string, string> = {
      dashboard: '1',
      'transaction-history': '2',
      doctors: '3',
      'content-providers': '4',
      'family-members': '5',
      users: '6',
      exercises: '7',
      books: '8',
      musics: '9',
      'subscription-packages': '10',
      'history-emergency': '11'
    }

    return routeToKeyMap[path] || '1'
  }

  const [selectedKeys, setSelectedKeys] = useState([getSelectedKeyFromPath(location.pathname)])

  // Theo dõi thay đổi route
  useEffect(() => {
    setSelectedKeys([getSelectedKeyFromPath(location.pathname)])
  }, [location.pathname])
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleMenuClick = (key: any) => {
    setSelectedKeys([key])
    switch (key) {
      case '1':
        navigate('/admin/dashboard')
        break
      case '2':
        navigate('/admin/transaction-history')
        break
      case '3':
        navigate('/admin/doctors')
        break
      case '4':
        navigate('/admin/content-providers')
        break
      case '5':
        navigate('/admin/family-members')
        break
      case '6':
        navigate('/admin/users')
        break
      case '7':
        navigate('/admin/exercises')
        break
      case '8':
        navigate('/admin/books')
        break
      case '9':
        navigate('/admin/musics')
        break
      case '10':
        navigate('/admin/subscription-packages')
        break
      case '11':
        navigate('/admin/history-emergency')
        break
      default:
        navigate('/admin/dashboard')
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
      {/* Sidebar - Fixed position */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className='bg-white shadow-md  custom-sider'
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          overflow: 'hidden'
        }}
      >
        <div className='flex flex-col items-center p-4 whitespace-nowrap overflow-hidden'>
          <img src={Logo} alt='Logo' className='w-10 h-10 mr-2' />
          {!collapsed && <span className='text-[#FF1356] font-medium text-lg'>Tiện ích tuổi già</span>}
        </div>
        <div
          style={{
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          <Menu
            theme='light'
            mode='inline'
            selectedKeys={selectedKeys}
            onSelect={({ key }) => setSelectedKeys([key])}
            className='bg-white h-full border-r-0' // Thêm h-full và border-r-0
            style={{ minHeight: '100%' }} // Đảm bảo menu chiếm đủ chiều cao
          >
            <Menu.Item
              key='1'
              className='
              ant-menu-item-gradient
              [&.ant-menu-item-selected]:text-white
              [&.ant-menu-item-selected]:bg-gradient-to-r
              [&.ant-menu-item-selected]:from-[#FF1356]
              [&.ant-menu-item-selected]:to-[#ff7d47]
              [&.ant-menu-item-selected>.anticon]:text-white
              hover:text-[#FF1356]
              transition-all
              duration-300
            '
              onClick={({ key }) => handleMenuClick(key)}
            >
              <PieChartOutlined />
              <span>Dashboard</span>
            </Menu.Item>

            <Menu.Item
              key='11'
              className='
              ant-menu-item-gradient
              [&.ant-menu-item-selected]:text-white
              [&.ant-menu-item-selected]:bg-gradient-to-r
              [&.ant-menu-item-selected]:from-[#FF1356]
              [&.ant-menu-item-selected]:to-[#ff7d47]
              [&.ant-menu-item-selected>.anticon]:text-white
              hover:text-[#FF1356]
              transition-all
              duration-300
            '
              onClick={({ key }) => handleMenuClick(key)}
            >
              <AlertOutlined />
              <span>Báo động khẩn cấp</span>
            </Menu.Item>
            <Menu.Item
              key='2'
              className='
              ant-menu-item-gradient
              [&.ant-menu-item-selected]:text-white
              [&.ant-menu-item-selected]:bg-gradient-to-r
              [&.ant-menu-item-selected]:from-[#FF1356]
              [&.ant-menu-item-selected]:to-[#ff7d47]
              [&.ant-menu-item-selected>.anticon]:text-white
              hover:text-[#FF1356]
              transition-all
              duration-300
            '
              onClick={({ key }) => handleMenuClick(key)}
            >
              <HistoryOutlined />
              <span>Lịch sử giao dịch</span>
            </Menu.Item>

            <SubMenu
              key='sub1'
              title={
                <span>
                  <UserOutlined />
                  <span>Quản lí tài khoản</span>
                </span>
              }
              className='
              ant-submenu-gradient
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:text-white
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:bg-gradient-to-r
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:from-[#FF1356]
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:to-[#ff7d47]
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title>.anticon]:text-white
              hover:[>.ant-menu-submenu-title]:text-[#FF1356]
              transition-all
              duration-300
            '
              onClick={({ key }) => handleMenuClick(key)}
            >
              <Menu.Item
                key='3'
                className='
                ant-menu-item-gradient
                [&.ant-menu-item-selected]:text-white
                [&.ant-menu-item-selected]:bg-gradient-to-r
                [&.ant-menu-item-selected]:from-[#FF1356]
                [&.ant-menu-item-selected]:to-[#ff7d47]
                hover:text-[#FF1356]
                transition-all
                duration-300
              '
                onClick={({ key }) => handleMenuClick(key)}
              >
                Bác sĩ
              </Menu.Item>
              <Menu.Item
                key='4'
                className='
                ant-menu-item-gradient
                [&.ant-menu-item-selected]:text-white
                [&.ant-menu-item-selected]:bg-gradient-to-r
                [&.ant-menu-item-selected]:from-[#FF1356]
                [&.ant-menu-item-selected]:to-[#ff7d47]
                hover:text-[#FF1356]
                transition-all
                duration-300
              '
                onClick={({ key }) => handleMenuClick(key)}
              >
                Nhà cung cấp nội dung
              </Menu.Item>
              <Menu.Item
                key='5'
                className='
                ant-menu-item-gradient
                [&.ant-menu-item-selected]:text-white
                [&.ant-menu-item-selected]:bg-gradient-to-r
                [&.ant-menu-item-selected]:from-[#FF1356]
                [&.ant-menu-item-selected]:to-[#ff7d47]
                hover:text-[#FF1356]
                transition-all
                duration-300
              '
                onClick={({ key }) => handleMenuClick(key)}
              >
                Người thân
              </Menu.Item>
              <Menu.Item
                key='6'
                className='
                ant-menu-item-gradient
                [&.ant-menu-item-selected]:text-white
                [&.ant-menu-item-selected]:bg-gradient-to-r
                [&.ant-menu-item-selected]:from-[#FF1356]
                [&.ant-menu-item-selected]:to-[#ff7d47]
                hover:text-[#FF1356]
                transition-all
                duration-300
              '
                onClick={({ key }) => handleMenuClick(key)}
              >
                Người dùng
              </Menu.Item>
            </SubMenu>

            <SubMenu
              key='sub2'
              title={
                <span>
                  <DesktopOutlined />
                  <span>Nội dung</span>
                </span>
              }
              className='
              ant-submenu-gradient
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:text-white
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:bg-gradient-to-r
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:from-[#FF1356]
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:to-[#ff7d47]
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title>.anticon]:text-white
              hover:[>.ant-menu-submenu-title]:text-[#FF1356]
              transition-all
              duration-300
            '
              onClick={({ key }) => handleMenuClick(key)}
            >
              <Menu.Item
                key='7'
                className='
                ant-menu-item-gradient
                [&.ant-menu-item-selected]:text-white
                [&.ant-menu-item-selected]:bg-gradient-to-r
                [&.ant-menu-item-selected]:from-[#FF1356]
                [&.ant-menu-item-selected]:to-[#ff7d47]
                hover:text-[#FF1356]
                transition-all
                duration-300
              '
                onClick={({ key }) => handleMenuClick(key)}
              >
                Bài tập
              </Menu.Item>
              <Menu.Item
                key='8'
                className='
                ant-menu-item-gradient
                [&.ant-menu-item-selected]:text-white
                [&.ant-menu-item-selected]:bg-gradient-to-r
                [&.ant-menu-item-selected]:from-[#FF1356]
                [&.ant-menu-item-selected]:to-[#ff7d47]
                hover:text-[#FF1356]
                transition-all
                duration-300
              '
                onClick={({ key }) => handleMenuClick(key)}
              >
                Sách
              </Menu.Item>
              <Menu.Item
                key='9'
                className='
                ant-menu-item-gradient
                [&.ant-menu-item-selected]:text-white
                [&.ant-menu-item-selected]:bg-gradient-to-r
                [&.ant-menu-item-selected]:from-[#FF1356]
                [&.ant-menu-item-selected]:to-[#ff7d47]
                hover:text-[#FF1356]
                transition-all
                duration-300
              '
                onClick={({ key }) => handleMenuClick(key)}
              >
                Âm Nhạc
              </Menu.Item>
            </SubMenu>

            <Menu.Item
              key='10'
              className='
              ant-menu-item-gradient
              [&.ant-menu-item-selected]:text-white
              [&.ant-menu-item-selected]:bg-gradient-to-r
              [&.ant-menu-item-selected]:from-[#FF1356]
              [&.ant-menu-item-selected]:to-[#ff7d47]
              [&.ant-menu-item-selected>.anticon]:text-white
              hover:text-[#FF1356]
              transition-all
              duration-300
            '
              onClick={({ key }) => handleMenuClick(key)}
            >
              <span>
                <SnippetsOutlined />

                <span> Gói sử dụng</span>
              </span>
            </Menu.Item>
          </Menu>
        </div>
      </Sider>

      {/* Main Content Area */}
      <div
        className='flex-1 flex flex-col'
        style={{
          marginLeft: collapsed ? '80px' : '200px',
          transition: 'margin-left 0.2s'
        }}
      >
        {/* Header */}
        <Header
          className='px-5 flex justify-end items-center bg-white shadow-md'
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}
        >
          <Badge
            count={5}
            className='mr-5'
            style={{
              color: 'white',
              background: 'linear-gradient(135deg, #FF1356, #ff7d47)'
            }}
          >
            <BellOutlined className='text-xl' style={{ color: '#FF1356' }} />
          </Badge>
          <SettingOutlined className='text-xl mr-5' style={{ color: '#FF1356' }} />
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key='user-info' disabled style={{ cursor: 'default' }}>
                  <p style={{ color: '#666' }}>Xin chào!</p>
                  <p className='text-[#FF1356] font-bold'>{user?.fullName || 'User'}</p>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key='profile'>
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
                background: user?.avatar ? 'transparent' : 'linear-gradient(135deg, #FF1356, #ff7d47)',
                cursor: 'pointer',
                color: 'white'
              }}
              src={user?.avatar} // Hiển thị avatar từ user data
              icon={!user?.avatar && <UserOutlined />} // Hiển thị icon nếu không có avatar
            >
              {!user?.avatar && user?.fullName?.charAt(0).toUpperCase()}
            </Avatar>
          </Dropdown>
        </Header>

        {/* Content */}
        {/* <Content
          className='p-5 bg-white flex-1'
          style={{
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 64px - 64px)'
          }}
        >
          <div className='text-lg font-semibold mb-5' style={{ color: '#FF1356' }}>
            Bill is a cat.
          </div>
          <ClientList />
        </Content> */}
        <Content className='p-5 bg-white flex-1' style={{ overflowY: 'auto' }}>
          {/* {children || 'This is default page'} */}
          <Outlet />
        </Content>
        {/* Footer */}
        <Footer className='text-center bg-white py-4' style={{ color: '#FF1356' }}>
          Senior Essentials Design ©2025 Created by LUXDEN
        </Footer>
      </div>
    </div>
  )
}

export default AdminLayout
