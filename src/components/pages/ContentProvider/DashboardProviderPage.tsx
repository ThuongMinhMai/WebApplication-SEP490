import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Spin, Empty, Alert, Statistic, Typography } from 'antd'
import {
  BookOutlined,
  CustomerServiceOutlined,
  VideoCameraOutlined,
  PlaySquareOutlined,
  FileTextOutlined
} from '@ant-design/icons'

const { Title } = Typography

interface ApiResponse {
  status: number
  message: string
  data: {
    books: number
    musics: number
    lessons: number
    musicPlaylists: number
    lessonPlaylists: number
  }
}

interface StatItem {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  backgroundColor: string
}

function DashboardProviderPage() {
  const [stats, setStats] = useState<ApiResponse['data'] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://api.diavan-valuation.asia/content-management/all-content')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: ApiResponse = await response.json()
        setStats(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statItems: StatItem[] = stats
    ? [
        {
          title: 'Danh sách phát nhạc',
          value: stats.musicPlaylists,
          icon: <PlaySquareOutlined style={{ fontSize: '24px' }} />,
          color: '#fff',
          backgroundColor: '#722ed1' // Purple
        },
        {
          title: 'Danh sách phát bài học',
          value: stats.lessonPlaylists,
          icon: <FileTextOutlined style={{ fontSize: '24px' }} />,
          color: '#fff',
          backgroundColor: '#f5222d' // Red
        },
        {
          title: 'Sách',
          value: stats.books,
          icon: <BookOutlined style={{ fontSize: '24px' }} />,
          color: '#fff',
          backgroundColor: '#1890ff' // Blue
        },
        {
          title: 'Bài hát',
          value: stats.musics,
          icon: <CustomerServiceOutlined style={{ fontSize: '24px' }} />,
          color: '#fff',
          backgroundColor: '#52c41a' // Green
        },
        {
          title: 'Bài học',
          value: stats.lessons,
          icon: <VideoCameraOutlined style={{ fontSize: '24px' }} />,
          color: '#fff',
          backgroundColor: '#faad14' // Gold
        }
      ]
    : []

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size='large' />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert message='Error' description={error} type='error' showIcon />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px', color: '#1d1d1d' }}>
        Content Management Dashboard
      </Title>

      {stats ? (
        <Row gutter={[16, 16]}>
          {statItems.map((item) => (
            <Col
              key={item.title}
              style={{
                flex: '0 0 calc(20% - 16px)', // 5 cards/hàng
                minWidth: '200px',
                maxWidth: 'calc(20% - 16px)'
              }}
            >
              <Card
                hoverable
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  border: 'none',
                  background: item.backgroundColor,
                  transition: 'transform 0.3s',
                  height: '100%', // Chiếm hết chiều cao của Col
                  display: 'flex',
                  flexDirection: 'column'
                }}
                bodyStyle={{
                  padding: '20px',
                  color: item.color,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '16px'
                    }}
                  >
                    {item.icon}
                  </div>
                  <Statistic
                    title={<span style={{ color: item.color }}>{item.title}</span>}
                    value={item.value}
                    valueStyle={{
                      color: item.color,
                      fontSize: '28px',
                      fontWeight: 'bold'
                    }}
                  />
                </div>
              </Card>
            </Col>
          ))}

          {/* Thêm card tổng hợp */}
          <Col xs={12}>
            <Card
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                border: 'none',
                background: 'linear-gradient(135deg, #434343 0%, #1d1d1d 100%)',
                color: '#fff'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<span style={{ color: '#fff' }}>Tổng nội dung</span>}
                value={Object.values(stats).reduce((a, b) => a + b, 0)}
                valueStyle={{
                  color: '#fff',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
        </Row>
      ) : (
        <Empty description='Không tìm thấy số liệu thống kê' />
      )}
    </div>
  )
}

export default DashboardProviderPage
