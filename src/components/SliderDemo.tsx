import React from 'react'
import { Layout, Menu, Breadcrumb, Avatar, Badge, Dropdown } from 'antd'
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons'
import ClientList from './ClientList'
import Logo from '../assets/Logo.png'

const { Header, Content, Footer, Sider } = Layout
const { SubMenu } = Menu

class SiderDemo extends React.Component {
  state = {
    collapsed: false
  }

  onCollapse = (collapsed: any) => {
    this.setState({ collapsed })
  }

  render() {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
        {/* Sidebar */}
        <Sider
          collapsible
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
          style={{ backgroundColor: '#fff' }}
        >
          {/* Logo & Tên dự án */}
          <div style={{ display: 'flex', alignItems: 'center', padding: 16 }}>
            <img src={Logo} alt='Logo' style={{ width: 40, height: 40, marginRight: 10 }} />
            {!this.state.collapsed && <span style={{ color: '#', fontSize: 16 }}>My Project</span>}
          </div>

          {/* Menu */}
          <Menu defaultSelectedKeys={['1']} mode='inline' style={{ backgroundColor: '#fff', color: '#000' }}>
            <Menu.Item key='1' style={{ backgroundColor: '#fff' }}>
              <PieChartOutlined />
              <span>Option 1</span>
            </Menu.Item>
            <Menu.Item key='2' style={{ backgroundColor: '#fff' }}>
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
              style={{ backgroundColor: '#fff' }}
            >
              <Menu.Item key='3'>Tom</Menu.Item>
              <Menu.Item key='4'>Bill</Menu.Item>
              <Menu.Item key='5'>Alex</Menu.Item>
            </SubMenu>
            <SubMenu
              key='sub2'
              title={
                <span>
                  <TeamOutlined />
                  <span>Team</span>
                </span>
              }
              style={{ backgroundColor: '#fff' }}
            >
              <Menu.Item key='6'>Team 1</Menu.Item>
              <Menu.Item key='8'>Team 2</Menu.Item>
            </SubMenu>
            <Menu.Item key='9' style={{ backgroundColor: '#fff' }}>
              <FileOutlined />
            </Menu.Item>
          </Menu>
        </Sider>

        {/* Main Layout */}
        <Layout className='site-layout'>
          {/* Header */}
          <Header
            style={{
              padding: '0 20px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              backgroundColor: '#fff',
              color: '#000'
            }}
          >
            <Badge count={5} style={{ marginRight: 20 }}>
              <BellOutlined style={{ fontSize: 20, color: '#fff' }} />
            </Badge>
            <SettingOutlined style={{ fontSize: 20, marginRight: 20, color: '#fff' }} />
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key='profile'>Profile</Menu.Item>
                  <Menu.Item key='logout'>Logout</Menu.Item>
                </Menu>
              }
            >
              <Avatar src='https://via.placeholder.com/40' style={{ cursor: 'pointer' }} />
            </Dropdown>
          </Header>

          {/* Content */}
          <Content style={{ margin: '0 16px', backgroundColor: '#fff' }}>
            <Breadcrumb style={{ margin: '16px 0', color: '#fff' }}>
              <Breadcrumb.Item>User</Breadcrumb.Item>
              <Breadcrumb.Item>Bill</Breadcrumb.Item>
            </Breadcrumb>
            <div
              className='site-layout-background'
              style={{
                padding: 24,
                minHeight: 360,
                backgroundColor: '#fff',
                color: '#333'
              }}
            >
              Bill is a cat.
              <div>
                <ClientList />
              </div>
            </div>
          </Content>

          {/* Footer */}
          <Footer style={{ textAlign: 'center', backgroundColor: '#fff', color: '#fff' }}>
            Ant Design ©2018 Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    )
  }
}

export default SiderDemo
