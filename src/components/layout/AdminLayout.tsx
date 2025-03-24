import React, { useState } from 'react'
import { Layout, Menu, Avatar, Badge, Dropdown } from 'antd'
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons'
import ClientList from '../ClientList'
import Logo from '../../assets/Logo.png'

const { Header, Content, Footer, Sider } = Layout
const { SubMenu } = Menu

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState(['1'])

  return (
    <div className='flex min-h-screen bg-white'>
      {/* Sidebar - Fixed position */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className='bg-white shadow-md'
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          overflow: 'auto'
        }}
      >
        <div className='flex items-center p-4'>
          <img src={Logo} alt='Logo' className='w-10 h-10 mr-2' />
          {!collapsed && <span className='text-black text-lg'>My Project</span>}
        </div>

        <Menu
          theme='light'
          mode='inline'
          selectedKeys={selectedKeys}
          onSelect={({ key }) => setSelectedKeys([key])}
          className='bg-white'
        >
          <Menu.Item
            key='1'
            className='
              ant-menu-item-gradient
              [&.ant-menu-item-selected]:text-white
              [&.ant-menu-item-selected]:bg-gradient-to-r
              [&.ant-menu-item-selected]:from-[#ec4899]
              [&.ant-menu-item-selected]:to-[#ff7d47]
              [&.ant-menu-item-selected>.anticon]:text-white
              hover:text-[#ec4899]
              transition-all
              duration-300
            '
          >
            <PieChartOutlined />
            <span>Option 1</span>
          </Menu.Item>

          <Menu.Item
            key='2'
            className='
              ant-menu-item-gradient
              [&.ant-menu-item-selected]:text-white
              [&.ant-menu-item-selected]:bg-gradient-to-r
              [&.ant-menu-item-selected]:from-[#ec4899]
              [&.ant-menu-item-selected]:to-[#ff7d47]
              [&.ant-menu-item-selected>.anticon]:text-white
              hover:text-[#ec4899]
              transition-all
              duration-300
            '
          >
            <DesktopOutlined />
            <span>Option 2</span>
          </Menu.Item>

          <SubMenu
            key='sub1'
            title={
              <span>
                <UserOutlined />
                <span>User</span>
              </span>
            }
            className='
              ant-submenu-gradient
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:text-white
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:bg-gradient-to-r
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:from-[#ec4899]
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:to-[#ff7d47]
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title>.anticon]:text-white
              hover:[>.ant-menu-submenu-title]:text-[#ec4899]
              transition-all
              duration-300
            '
          >
            <Menu.Item
              key='3'
              className='
                ant-menu-item-gradient
                [&.ant-menu-item-selected]:text-white
                [&.ant-menu-item-selected]:bg-gradient-to-r
                [&.ant-menu-item-selected]:from-[#ec4899]
                [&.ant-menu-item-selected]:to-[#ff7d47]
                hover:text-[#ec4899]
                transition-all
                duration-300
              '
            >
              Tom
            </Menu.Item>
            <Menu.Item
              key='4'
              className='
                ant-menu-item-gradient
                [&.ant-menu-item-selected]:text-white
                [&.ant-menu-item-selected]:bg-gradient-to-r
                [&.ant-menu-item-selected]:from-[#ec4899]
                [&.ant-menu-item-selected]:to-[#ff7d47]
                hover:text-[#ec4899]
                transition-all
                duration-300
              '
            >
              Bill
            </Menu.Item>
            <Menu.Item
              key='5'
              className='
                ant-menu-item-gradient
                [&.ant-menu-item-selected]:text-white
                [&.ant-menu-item-selected]:bg-gradient-to-r
                [&.ant-menu-item-selected]:from-[#ec4899]
                [&.ant-menu-item-selected]:to-[#ff7d47]
                hover:text-[#ec4899]
                transition-all
                duration-300
              '
            >
              Alex
            </Menu.Item>
          </SubMenu>

          <SubMenu
            key='sub2'
            title={
              <span>
                <TeamOutlined />
                <span>Team</span>
              </span>
            }
            className='
              ant-submenu-gradient
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:text-white
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:bg-gradient-to-r
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:from-[#ec4899]
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title]:to-[#ff7d47]
              [&.ant-menu-submenu-selected>.ant-menu-submenu-title>.anticon]:text-white
              hover:[>.ant-menu-submenu-title]:text-[#ec4899]
              transition-all
              duration-300
            '
          >
            <Menu.Item
              key='6'
              className='
                ant-menu-item-gradient
                [&.ant-menu-item-selected]:text-white
                [&.ant-menu-item-selected]:bg-gradient-to-r
                [&.ant-menu-item-selected]:from-[#ec4899]
                [&.ant-menu-item-selected]:to-[#ff7d47]
                hover:text-[#ec4899]
                transition-all
                duration-300
              '
            >
              Team 1
            </Menu.Item>
            <Menu.Item
              key='8'
              className='
                ant-menu-item-gradient
                [&.ant-menu-item-selected]:text-white
                [&.ant-menu-item-selected]:bg-gradient-to-r
                [&.ant-menu-item-selected]:from-[#ec4899]
                [&.ant-menu-item-selected]:to-[#ff7d47]
                hover:text-[#ec4899]
                transition-all
                duration-300
              '
            >
              Team 2
            </Menu.Item>
          </SubMenu>

          <Menu.Item
            key='9'
            className='
              ant-menu-item-gradient
              [&.ant-menu-item-selected]:text-white
              [&.ant-menu-item-selected]:bg-gradient-to-r
              [&.ant-menu-item-selected]:from-[#ec4899]
              [&.ant-menu-item-selected]:to-[#ff7d47]
              [&.ant-menu-item-selected>.anticon]:text-white
              hover:text-[#ec4899]
              transition-all
              duration-300
            '
          >
            <FileOutlined />
          </Menu.Item>
        </Menu>
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
              background: 'linear-gradient(135deg, #ec4899, #ff7d47)'
            }}
          >
            <BellOutlined className='text-xl' style={{ color: '#ec4899' }} />
          </Badge>
          <SettingOutlined className='text-xl mr-5' style={{ color: '#ec4899' }} />
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key='profile' style={{ color: '#ec4899' }}>
                  Profile
                </Menu.Item>
                <Menu.Item key='logout' style={{ color: '#ec4899' }}>
                  Logout
                </Menu.Item>
              </Menu>
            }
          >
            <Avatar
              style={{
                background: 'linear-gradient(135deg, #ec4899, #ff7d47)',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              U
            </Avatar>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content
          className='p-5 bg-white flex-1'
          style={{
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 64px - 64px)'
          }}
        >
          <div className='text-lg font-semibold mb-5' style={{ color: '#ec4899' }}>
            Bill is a cat.
          </div>
          <ClientList />
        </Content>

        {/* Footer */}
        <Footer className='text-center bg-white py-4' style={{ color: '#ec4899' }}>
          Ant Design ©2018 Created by Ant UED
        </Footer>
      </div>
    </div>
  )
}

export default AdminLayout
