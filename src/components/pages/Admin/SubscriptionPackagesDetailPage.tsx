import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileDoneOutlined,
  FireOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Avatar, Button, Card, Col, Descriptions, Divider, Progress, Row, Space, Table, Tag, Typography } from 'antd'
import axios from 'axios'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const { Title, Text } = Typography

interface User {
  accountId: number
  fullName: string
  avatar: string
  email: string
  status: string
  gender: string
  phoneNumber: string
}

interface Subscription {
  subscriptionId: number
  purchaseDate: string
  subName: string
  validityPeriod: number
  numberOfMeeting: number
  numberOfMeetingLeft: number
  usersInSubscriptions: {
    buyer: User
    elderly: User
  }[]
}

const SubscriptionPackagesDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState<boolean>(true)
  const [subscriptionData, setSubscriptionData] = useState<Subscription[]>([])
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      try {
        const response = await axios.get(`https://api.diavan-valuation.asia/combo-management/user/${id}`)

        if (response.data.status === 1) {
          setSubscriptionData(response.data.data)
        } else {
          setError(response.data.message || 'Không thể lấy thông tin chi tiết đăng ký')
        }
      } catch (err) {
        setError('Đã xảy ra lỗi khi lấy thông tin chi tiết đăng ký')
        console.error('Lỗi khi tìm kiếm thông tin đăng ký:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionDetails()
  }, [id])

  const columns = [
    {
      title: (
        <div className='flex gap-1'>
          <CalendarOutlined />
          <Text>Ngày mua</Text>
        </div>
      ),
      dataIndex: 'purchaseDate',
      key: 'purchase',
      render: (date: string, record: Subscription) => (
        <Space direction='vertical'>
          <Text strong>{moment(date, 'DD-MM-YYYY').format('DD/MM/YYYY')}</Text>
        </Space>
      ),
      sorter: (a: Subscription, b: Subscription) =>
        moment(a.purchaseDate, 'DD-MM-YYYY').unix() - moment(b.purchaseDate, 'DD-MM-YYYY').unix()
    },
    {
      title: 'Người mua',
      key: 'buyer',
      render: (_: any, record: Subscription) => (
        <Space>
          <Avatar src={record.usersInSubscriptions[0].buyer.avatar} icon={<UserOutlined />} />
          <Space direction='vertical' size={0}>
            <Text strong>{record.usersInSubscriptions[0].buyer.fullName}</Text>
            <Text type='secondary'>{record.usersInSubscriptions[0].buyer.email}</Text>
          </Space>
        </Space>
      )
    },
    {
      title: 'Người sử dụng',
      key: 'elderly',
      render: (_: any, record: Subscription) => (
        <Space>
          <Avatar src={record.usersInSubscriptions[0].elderly.avatar} icon={<UserOutlined />} />
          <Space direction='vertical' size={0}>
            <Text strong>{record.usersInSubscriptions[0].elderly.fullName}</Text>
            <Text type='secondary'>{record.usersInSubscriptions[0].elderly.email}</Text>
          </Space>
        </Space>
      )
    },
    {
      title: 'Buổi hẹn',
      key: 'meetings',
      render: (_: any, record: Subscription) => (
        <Space direction='vertical'>
          <Text>
            <Text strong>Đã dùng: </Text>
            {record.numberOfMeeting - record.numberOfMeetingLeft} / {record.numberOfMeeting}
          </Text>
          <Progress
            percent={Math.round(((record.numberOfMeeting - record.numberOfMeetingLeft) / record.numberOfMeeting) * 100)}
            status={
              record.numberOfMeetingLeft === 0
                ? 'exception'
                : record.numberOfMeetingLeft < record.numberOfMeeting / 2
                  ? 'normal'
                  : 'active'
            }
            strokeColor={
              ((record.numberOfMeeting - record.numberOfMeetingLeft) / record.numberOfMeeting) * 100 > 80
                ? '#ff4d4f'
                : '#52c41a'
            }
          />
          <Text type='secondary'>{record.numberOfMeetingLeft} cuộc hẹn còn lại</Text>
        </Space>
      ),
      sorter: (a: Subscription, b: Subscription) =>
        a.numberOfMeeting - a.numberOfMeetingLeft - (b.numberOfMeeting - b.numberOfMeetingLeft)
    },
    {
      title: 'Hiệu lực',
      key: 'validity',
      render: (_: any, record: Subscription) => {
        const purchaseDate = moment(record.purchaseDate, 'DD-MM-YYYY')
        const expiryDate = purchaseDate.clone().add(record.validityPeriod, 'days')
        const daysRemaining = expiryDate.diff(moment(), 'days')

        return (
          <Space direction='vertical'>
            <Text>
              <Text strong>Mua: </Text>
              {purchaseDate.format('DD/MM/YYYY')}
            </Text>
            <Text>
              <Text strong>Hết hạn: </Text>
              {expiryDate.format('DD/MM/YYYY')}
            </Text>
            <Text>
              <Text strong>Trạng thái: </Text>
              {daysRemaining > 0 ? (
                <Tag icon={<CheckCircleOutlined />} color='green'>
                  ({daysRemaining} ngày còn lại)
                </Tag>
              ) : (
                <Tag icon={<CloseCircleOutlined />} color='red'>
                  Đã hết hạn
                </Tag>
              )}
            </Text>
          </Space>
        )
      },
      sorter: (a: Subscription, b: Subscription) => {
        const aExpiry = moment(a.purchaseDate, 'DD-MM-YYYY').add(a.validityPeriod, 'days')
        const bExpiry = moment(b.purchaseDate, 'DD-MM-YYYY').add(b.validityPeriod, 'days')
        return aExpiry.unix() - bExpiry.unix()
      }
    }
  ]

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Đang tải chi tiết đăng ký...</div>
  }

  if (error) {
    return <div style={{ padding: 24, color: 'red' }}>Lỗi: {error}</div>
  }

  if (!subscriptionData.length) {
    return (
      <div
        style={{
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <svg width='120' height='120' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
              stroke='#888'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path d='M12 8V12' stroke='#888' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M12 16H12.01' stroke='#888' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </div>

        <Title level={3} style={{ color: '#555', marginBottom: 8 }}>
          Gói chưa có người mua
        </Title>

        <Text type='secondary' style={{ maxWidth: 500, marginBottom: 24 }}>
          Hiện tại chưa có ai đăng ký gói subscription này. Khi có người mua, thông tin sẽ được hiển thị tại đây.
        </Text>

        <Button
          type='primary'
          icon={<TeamOutlined />}
          onClick={() => navigate(-1)} // Hoặc điều hướng đến trang khác nếu cần
        >
          Quay lại trang trước
        </Button>

        <div style={{ marginTop: 48, color: '#aaa', fontSize: 12 }}>
          <ClockCircleOutlined /> Cập nhật lần cuối: {moment().format('HH:mm DD/MM/YYYY')}
        </div>
      </div>
    )
  }
  // Calculate statistics
  const totalPurchases = subscriptionData.length
  const activePurchases = subscriptionData.filter((sub) => {
    const expiryDate = moment(sub.purchaseDate, 'DD-MM-YYYY').add(sub.validityPeriod, 'days')
    return expiryDate.isAfter(moment())
  }).length

  const mostRecentPurchase = subscriptionData.reduce((latest, current) => {
    const currentDate = moment(current.purchaseDate, 'DD-MM-YYYY')
    const latestDate = moment(latest.purchaseDate, 'DD-MM-YYYY')
    return currentDate.isAfter(latestDate) ? current : latest
  })

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 24 }}>
        <Button type='text' icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 16 }}>
          Trở lại
        </Button>
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            title={
              <Space>
                <FileDoneOutlined style={{ color: '#FF1356' }} />
                <Text strong>Tóm tắt gói</Text>
              </Space>
            }
            headStyle={{ backgroundColor: '#ffebf6', borderBottom: 0 }}
            style={{ borderTop: '3px solid #FF1356', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
          >
            <Descriptions column={1}>
              <Descriptions.Item label={<Text strong>Tên gói</Text>}>
                <Tag color='pink' icon={<FireOutlined />}>
                  {subscriptionData[0].subName}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Thời hạn hiệu lực</Text>}>
                <Space>
                  <ClockCircleOutlined style={{ color: '#faad14' }} />
                  <Text>{subscriptionData[0].validityPeriod} ngày</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Tổng số buổi hẹn</Text>}>
                <Space>
                  <TeamOutlined style={{ color: '#52c41a' }} />
                  <Text>{subscriptionData[0].numberOfMeeting} buổi</Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Card Total Purchases */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <Space direction='vertical' size='middle'>
              <Text strong style={{ fontSize: 16 }}>
                <ShoppingCartOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                Tổng lượt mua
              </Text>
              <Title level={3} style={{ margin: 0 }}>
                {totalPurchases}
              </Title>
              <Text type='secondary'>Trên tất cả người dùng</Text>
              <Progress percent={100} showInfo={false} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
            </Space>
          </Card>
        </Col>

        {/* Card Active Purchases */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <Space direction='vertical' size='middle'>
              <Text strong style={{ fontSize: 16 }}>
                <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                Đang còn hiệu lực
              </Text>
              <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                {activePurchases}
              </Title>
              <Text type='secondary'>{Math.round((activePurchases / totalPurchases) * 100)}% trên tổng số</Text>
              <Progress
                percent={Math.round((activePurchases / totalPurchases) * 100)}
                status='active'
                strokeColor='#52c41a'
              />
            </Space>
          </Card>
        </Col>

        {/* Card Most Recent Purchase */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <Space direction='vertical' size='middle'>
              <Text strong style={{ fontSize: 16 }}>
                <CalendarOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                Mua gần đây nhất
              </Text>
              <Title level={4} style={{ margin: 0 }}>
                {moment(mostRecentPurchase.purchaseDate, 'DD-MM-YYYY').format('DD/MM/YYYY')}
              </Title>
              <Text>
                <UserOutlined style={{ marginRight: 4 }} />
                Bởi: {mostRecentPurchase.usersInSubscriptions[0].buyer.fullName}
              </Text>
              <Tag color='gold' icon={<StarOutlined />}>
                Mới nhất
              </Tag>
            </Space>
          </Card>
        </Col>
      </Row>
      <Divider orientation='left'>Tất cả các giao dịch mua</Divider>

      <Table
        columns={columns}
        dataSource={subscriptionData}
        // rowKey={(record) => `${record.subscriptionId}-${record.usersInSubscriptions[0].buyer.accountId}`}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        loading={loading}
        bordered
        scroll={{ x: true }}
      />
    </div>
  )
}

export default SubscriptionPackagesDetailPage
