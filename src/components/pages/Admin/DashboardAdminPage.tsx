import { AlertOutlined, DollarOutlined, RedoOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons'
import { Button, Card, Spin, Statistic, Table } from 'antd'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js'
import { useEffect, useState } from 'react'
import { Bar, Line, Pie } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, ArcElement, Title, Tooltip, Legend, PointElement)

interface DashboardData {
  totalUsers: number
  totalDoctor: number
  totalContentProvider: number
  totalFamilyMember: number
  totalElderly: number
  appointments: number
  emergencyAlerts: number
  revenue: number
  subscriptions: number
  monthlyGrowth: { month: string; value: number }[]
  boughtPackages: { packageName: string; packagePrice: number; boughtQuantity: number }[]
  revenueByMonth: { month: string; value: number }[]
}

interface ApiResponse {
  status: number
  message: string
  data: DashboardData
}

const DashboardAdmin = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const fetchData = async () => {
    try {
      const response = await fetch('https://api.diavan-valuation.asia/dashboard-management/admin-dashboard')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result: ApiResponse = await response.json()
      if (result.status === 1) {
        setData(result.data)
        setLastUpdated(new Date().toLocaleTimeString())
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Spin size='large' />
      </div>
    )
  }

  if (error) {
    return <div className='flex items-center justify-center h-screen text-red-500'>Error: {error}</div>
  }

  if (!data) {
    return <div className='flex items-center justify-center h-screen'>No data available</div>
  }

  const barChartData = {
    labels: ['Tổng', 'Nhà cung cấp nội dung', 'Bác sĩ', 'Người thân', 'Người cao tuổi'],
    datasets: [
      {
        label: 'Thống kê người dùng',
        data: [data.totalUsers, data.totalContentProvider, data.totalDoctor, data.totalFamilyMember, data.totalElderly],
        backgroundColor: ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6']
      }
    ]
  }

  const lineChartData = {
    labels: data.revenueByMonth.map((item) => item.month),
    datasets: [
      {
        label: 'Tăng trưởng hàng tháng (%)',
        data: data.monthlyGrowth.map((item) => item.value),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Doanh thu (VND)',
        data: data.revenueByMonth.map((item) => item.value),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  }
  console.log('chart nef' + data.revenueByMonth.map((item) => item.value))
  const pieChartData = {
    labels: ['Người dùng miễn phí', 'Người dùng trả phí'],
    datasets: [
      {
        label: 'Phân bổ người dùng',
        data: [data.totalElderly - data.subscriptions, data.subscriptions],
        backgroundColor: ['#10B981', '#F59E0B'],
        borderWidth: 1
      }
    ]
  }

  const packagePieChartData = {
    labels: data.boughtPackages.map((pkg) => pkg.packageName),
    datasets: [
      {
        label: 'Subscription Packages',
        data: data.boughtPackages.map((pkg) => pkg.boughtQuantity),
        backgroundColor: ['#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981'],
        borderWidth: 1
      }
    ]
  }

  const packageTableColumns = [
    {
      title: <span className='font-semibold'>Gói</span>,
      dataIndex: 'packageName',
      key: 'packageName'
    },
    {
      title: <span className='font-semibold'>Giá (VND)</span>,
      dataIndex: 'packagePrice',
      key: 'packagePrice',
      render: (price: number) => price.toLocaleString()
    },
    {
      title: <span className='font-semibold'>Người đăng ký</span>,
      dataIndex: 'boughtQuantity',
      key: 'boughtQuantity'
    }
  ]

  const cardStyle = 'shadow-md rounded-lg border-0 h-full'
  const statCardStyle = 'bg-gradient-to-br from-blue-50 to-blue-100'
  const chartCardStyle = 'bg-white'

  return (
    <div className='p-5 min-h-screen'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Tổng quan</h1>
        <div className='text-sm text-gray-500 mt-1'>Cập nhật lúc: {lastUpdated || '--:--:--'}</div>

        <Button type='text' icon={<RedoOutlined />} onClick={fetchData} loading={loading} className='flex items-center'>
          Tải lại
        </Button>
      </div>
      <div className='flex flex-col lg:flex-row gap-5 mb-6'>
        <div className='lg:w-1/4'>
          <Card
            className={`${cardStyle} bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 shadow-lg shadow-amber-200/50 hover:shadow-amber-200/70 transition-all duration-300 h-full flex flex-col justify-center items-center text-center`}
          >
            <Statistic
              title={<span className='text-amber-800 font-medium'>TỔNG DOANH THU</span>}
              value={data.revenue.toLocaleString()}
              suffix={<span className='text-amber-700'>VND</span>}
              prefix={<DollarOutlined className='text-amber-600 text-xl' />}
              valueStyle={{
                color: '#B45309',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
              className='text-center'
            />
          </Card>
        </div>

        <div className='lg:w-3/4 flex flex-col gap-5'>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5'>
            <Card className={`${cardStyle} bg-gradient-to-br from-blue-50 to-blue-100 h-full`}>
              <Statistic
                title={<span className='text-gray-600'>Tổng người dùng</span>}
                value={data.totalUsers}
                prefix={<UserOutlined className='text-blue-600' />}
                valueStyle={{ color: '#2563EB' }}
              />
            </Card>

            <Card className={`${cardStyle} bg-gradient-to-br from-purple-50 to-purple-100 h-full`}>
              <Statistic
                title={<span className='text-gray-600'>Tổng NCC nội dung</span>}
                value={data.totalContentProvider}
                prefix={<UserOutlined className='text-purple-600' />}
                valueStyle={{ color: '#7C3AED' }}
              />
            </Card>

            <Card className={`${cardStyle} bg-gradient-to-br from-purple-50 to-purple-100 h-full`}>
              <Statistic
                title={<span className='text-gray-600'>Tổng bác sĩ</span>}
                value={data.totalDoctor}
                prefix={<UserOutlined className='text-purple-600' />}
                valueStyle={{ color: '#7C3AED' }}
              />
            </Card>

            <Card className={`${cardStyle} bg-gradient-to-br from-pink-50 to-pink-100 h-full`}>
              <Statistic
                title={<span className='text-gray-600'>Người thân hỗ trợ</span>}
                value={data.totalFamilyMember}
                prefix={<UserOutlined className='text-pink-600' />}
                valueStyle={{ color: '#DB2777' }}
              />
            </Card>

            <Card className={`${cardStyle} bg-gradient-to-br from-indigo-50 to-indigo-100 h-full`}>
              <Statistic
                title={<span className='text-gray-600'>Người cao tuổi</span>}
                value={data.totalElderly}
                prefix={<UserOutlined className='text-indigo-600' />}
                valueStyle={{ color: '#4F46E5' }}
              />
            </Card>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
            <Card className={`${cardStyle} bg-gradient-to-br from-cyan-50 to-cyan-100 h-full`}>
              <Statistic
                title={<span className='text-gray-600'>Cuộc hẹn tư vấn</span>}
                value={data.appointments}
                prefix={<VideoCameraOutlined className='text-cyan-600' />}
                valueStyle={{ color: '#0891B2' }}
              />
            </Card>

            <Card className={`${cardStyle} bg-gradient-to-br from-red-50 to-red-100 h-full`}>
              <Statistic
                title={<span className='text-gray-600'>Cảnh báo khẩn cấp</span>}
                value={data.emergencyAlerts}
                prefix={<AlertOutlined className='text-red-600' />}
                valueStyle={{ color: '#DC2626' }}
              />
            </Card>

            <Card className={`${cardStyle} bg-gradient-to-br from-emerald-50 to-emerald-100 h-full`}>
              <Statistic
                title={<span className='text-gray-600'>Đăng kí trả phí</span>}
                value={data.subscriptions}
                prefix={<UserOutlined className='text-emerald-600' />}
                valueStyle={{ color: '#059669' }}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
        <Card
          className={`${cardStyle} ${chartCardStyle}`}
          title={<span className='font-semibold text-gray-700'>Thống kê người dùng</span>}
        >
          <div className='h-80'>
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const
                  }
                }
              }}
            />
          </div>
        </Card>
        <Card
          className={`${cardStyle} ${chartCardStyle}`}
          title={<span className='font-semibold text-gray-700'>Tăng trưởng & Doanh thu hàng tháng</span>}
        >
          <div className='h-80'>
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
        <Card
          className={`${cardStyle} ${chartCardStyle}`}
          title={<span className='font-semibold text-gray-700'>Phân bổ người dùng</span>}
        >
          <div className='h-80'>
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const
                  }
                }
              }}
            />
          </div>
        </Card>
        <Card
          className={`${cardStyle} ${chartCardStyle}`}
          title={<span className='font-semibold text-gray-700'>Gói đăng ký</span>}
        >
          <div className='h-80'>
            <Pie
              data={packagePieChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>

      {/* Package Table */}
      <Card
        className={`${cardStyle} ${chartCardStyle}`}
        title={<span className='font-semibold text-gray-700'>Chi tiết gói đăng ký</span>}
      >
        <Table
          columns={packageTableColumns}
          dataSource={data.boughtPackages}
          pagination={false}
          rowKey='packageName'
          className='rounded-lg overflow-hidden'
          bordered
        />
      </Card>
    </div>
  )
}

export default DashboardAdmin
