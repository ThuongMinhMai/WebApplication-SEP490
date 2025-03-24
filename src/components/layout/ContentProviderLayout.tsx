// src/layouts/ContentProviderLayout.js
import React from 'react'
import { Layout, Menu } from 'antd'
import { FileOutlined, UploadOutlined, DashboardOutlined, UserOutlined } from '@ant-design/icons'

const { Header, Content, Footer, Sider } = Layout

export default function ContentProviderLayout({ children }: any) {
  return (
    <div className='flex min-h-screen bg-white'>
      <Sider
        className='bg-white shadow-md'
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          overflow: 'auto'
        }}
      >
        <div className='flex items-center p-4'>
          <span className='text-black text-lg'>Content Portal</span>
        </div>

        <Menu theme='light' mode='inline' defaultSelectedKeys={['1']}>
          <Menu.Item key='1' icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key='2' icon={<UploadOutlined />}>
            Upload Content
          </Menu.Item>
          <Menu.Item key='3' icon={<FileOutlined />}>
            My Contents
          </Menu.Item>
          <Menu.Item key='4' icon={<UserOutlined />}>
            Profile
          </Menu.Item>
        </Menu>
      </Sider>

      <div className='flex-1 flex flex-col' style={{ marginLeft: 200 }}>
        <Header className='bg-white shadow-md flex justify-end items-center px-5'>{/* Header content */}</Header>
        <Content className='p-5 bg-white flex-1'>{children}</Content>
        <Footer className='text-center bg-white py-4'>Content Provider Portal ©2023</Footer>
      </div>
    </div>
  )
}
