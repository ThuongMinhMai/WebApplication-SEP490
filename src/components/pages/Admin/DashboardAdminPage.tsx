import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Spin } from 'antd'
import { UserOutlined, VideoCameraOutlined, AlertOutlined, FileTextOutlined, DollarOutlined } from '@ant-design/icons'
import { Bar, Line, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, ArcElement, Title, Tooltip, Legend, PointElement)

// Dữ liệu giả (mock data)
const mockData = {
  totalUsers: 1200,
  totalDoctor: 120,
  totalContentProvider: 10,
  totalFamilyMember: 10,
  totalElderly: 10,
  videoCalls: 150,
  emergencyAlerts: 12,
  newContent: 25,
  revenue: 50000,
  subscriptions: 350,
  monthlyGrowth: [
    { month: 'Tháng 1', value: 5 },
    { month: 'Tháng 2', value: 10 },
    { month: 'Tháng 3', value: -8 },
    { month: 'Tháng 4', value: 12 },
    { month: 'Tháng 5', value: 15 },
    { month: 'Tháng 6', value: 10 },
    { month: 'Tháng 7', value: 18 }
  ],
  packageA: 150,
  packageB: 120,
  packageC: 80,
  revenueByMonth: [
    { month: 'Tháng 1', value: 4000 },
    { month: 'Tháng 2', value: 4500 },
    { month: 'Tháng 3', value: 4800 },
    { month: 'Tháng 4', value: 5000 },
    { month: 'Tháng 5', value: 5200 },
    { month: 'Tháng 6', value: 5300 },
    { month: 'Tháng 7', value: 5400 }
  ]
}

// Định nghĩa kiểu dữ liệu cho state
interface DashboardData {
  totalUsers: number
  totalDoctor: number
  totalContentProvider: number
  totalFamilyMember: number
  totalElderly: number
  videoCalls: number
  emergencyAlerts: number
  newContent: number
  revenue: number
  subscriptions: number
  monthlyGrowth: { month: string; value: number }[]
  packageA: number
  packageB: number
  packageC: number
  revenueByMonth: { month: string; value: number }[]
}

const DashboardAdmin = () => {
  const [data, setData] = useState<DashboardData | null>(null) // Sử dụng kiểu DashboardData hoặc null
  const [loading, setLoading] = useState(true)

  // Giả lập lấy dữ liệu từ API
  useEffect(() => {
    setTimeout(() => {
      setData(mockData) // Cập nhật dữ liệu vào state
      setLoading(false)
    }, 1000) // Giả lập thời gian tải 1 giây
  }, [])

  if (loading) {
    return <Spin size='large' style={{ display: 'block', margin: '50px auto' }} />
  }

  const barChartData = {
    labels: ['Users', 'Video Calls', 'Emergency Alerts', 'New Content'],
    datasets: [
      {
        label: 'Statistics',
        data: [data?.totalUsers, data?.videoCalls, data?.emergencyAlerts, data?.newContent],
        backgroundColor: ['#1890ff', '#faad14', '#ff4d4f', '#722ed1']
      }
    ]
  }

  const lineChartData = {
    labels: data?.monthlyGrowth.map((item) => item.month),
    datasets: [
      {
        label: 'Monthly Growth (%)',
        data: data?.monthlyGrowth.map((item) => item.value),
        borderColor: '#1890ff',
        fill: false
      },
      {
        label: 'Revenue ($)',
        data: data?.revenueByMonth.map((item) => item.value),
        borderColor: '#faad14',
        fill: false
      }
    ]
  }

  const pieChartData = {
    labels: ['Free Users', 'Paid Users'],
    datasets: [
      {
        label: 'User Distribution',
        data: [data!.totalUsers - data!.subscriptions, data!.subscriptions],
        backgroundColor: ['#52c41a', '#faad14']
      }
    ]
  }

  const packagePieChartData = {
    labels: ['Package A', 'Package B', 'Package C'],
    datasets: [
      {
        label: 'Subscription Packages',
        data: [data?.packageA, data?.packageB, data?.packageC],
        backgroundColor: ['#1890ff', '#faad14', '#ff4d4f']
      }
    ]
  }

  const packageTableColumns = [
    { title: 'Package', dataIndex: 'package', key: 'package' },
    { title: 'Users', dataIndex: 'users', key: 'users' }
  ]

  const packageTableData = [
    { key: '1', package: 'Package A', users: data?.packageA },
    { key: '2', package: 'Package B', users: data?.packageB },
    { key: '3', package: 'Package C', users: data?.packageC }
  ]

  return (
    <div style={{ padding: 20 }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title='Total Users' value={data?.totalUsers} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title='Total Doctors' value={data?.totalDoctor} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title='Total Content Providers' value={data?.totalContentProvider} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title='Total Family Members' value={data?.totalFamilyMember} prefix={<UserOutlined />} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic title='Total Elderly' value={data?.totalElderly} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title='Video Calls' value={data?.videoCalls} prefix={<VideoCameraOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title='Emergency Alerts' value={data?.emergencyAlerts} prefix={<AlertOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title='New Content' value={data?.newContent} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic title='Total Revenue' value={`$${data?.revenue}`} prefix={<DollarOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title='Paid Subscriptions' value={data?.subscriptions} prefix={<UserOutlined />} />
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop: 30 }}>
        <Col span={12}>
          <Card title='System Overview Chart'>
            <Bar data={barChartData} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title='Monthly Growth & Revenue'>
            <Line data={lineChartData} />
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop: 30 }}>
        <Col span={12}>
          <Card title='User Distribution'>
            <Pie data={pieChartData} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title='Subscription Packages'>
            <Pie data={packagePieChartData} />
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop: 30 }}>
        <Col span={24}>
          <Card title='Subscription Package Details'>
            <Table columns={packageTableColumns} dataSource={packageTableData} pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardAdmin
