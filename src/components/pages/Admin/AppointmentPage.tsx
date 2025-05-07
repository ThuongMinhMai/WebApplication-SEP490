import { MoreOutlined, RedoOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import type { InputRef } from 'antd'
import { Avatar, Button, Input, Layout, message, Space, Table, Tag, Typography } from 'antd'
import type { ColumnType, TablePaginationConfig } from 'antd/es/table'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const { Content } = Layout
const { Text } = Typography
interface Appointment {
  proAvatar: string
  proName: string
  proEmail: string
  elderlyEmail: string
  elderlyAvatar: string
  elderlyFullName: string
  timeOfAppointment: string
  dateOfAppointment: string
  reasonOfMeeting: string
  status: 'Joined' | 'NotYet' | 'Cancelled' // Có thể thêm các trạng thái khác nếu cần
}

interface ApiResponse {
  status: number
  message: string
  data: Appointment[]
}

const AppointmentPage = () => {
  const [data, setData] = useState<Appointment[]>([])
  const [filteredData, setFilteredData] = useState<Appointment[]>([])
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100']
  })
  const [tableLoading, setTableLoading] = useState(false)
  const searchInput = useRef<InputRef>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize])

  const fetchData = async () => {
    setTableLoading(true)
    try {
      const response = await fetch('https://api.diavan-valuation.asia/api/Professor/appointment')
      const result: ApiResponse = await response.json()

      if (result.status === 1) {
        const startIndex = (pagination.current! - 1) * pagination.pageSize!
        const endIndex = startIndex + pagination.pageSize!
        const paginatedData = result.data.slice(startIndex, endIndex)

        setData(result.data)
        setFilteredData(paginatedData)
        setPagination({
          ...pagination,
          total: result.data.length
        })
      } else {
        message.error(result.message || 'Failed to fetch appointments')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      message.error('Failed to fetch appointments')
    } finally {
      setTableLoading(false)
    }
  }

  const getColumnSearchProps = (dataIndex: keyof Appointment): ColumnType<Appointment> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm ${dataIndex}`}
          value={selectedKeys[0] as string}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type='primary'
          onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          icon={<SearchOutlined />}
          size='small'
          style={{ width: 90, marginRight: 8 }}
        >
          Tìm kiếm
        </Button>
        <Button onClick={() => handleReset(clearFilters)} size='small' style={{ width: 90 }}>
          Đặt lại
        </Button>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      const searchValue = value.toString().toLowerCase()
      const recordValue = record[dataIndex]?.toString().toLowerCase()
      return recordValue ? recordValue.includes(searchValue) : false
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.focus(), 100)
      }
    }
  })

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: keyof Appointment) => {
    confirm()
    const searchText = selectedKeys[0].toLowerCase()
    const filtered = data.filter((item) => {
      return item[dataIndex]?.toString().toLowerCase().includes(searchText)
    })
    setFilteredData(filtered)
  }

  const handleReset = (clearFilters?: () => void) => {
    clearFilters?.()
    setFilteredData(data)
  }

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination({
      ...pagination,
      ...newPagination
    })

    const startIndex = (newPagination.current! - 1) * newPagination.pageSize!
    const endIndex = startIndex + newPagination.pageSize!
    const paginatedData = data.slice(startIndex, endIndex)

    setFilteredData(paginatedData)
  }

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'Joined':
        return <Tag color='green'>Đã tham gia</Tag>
      case 'NotYet':
        return <Tag color='orange'>Chưa diễn ra</Tag>
      case 'Cancelled':
        return <Tag color='red'>Đã hủy</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  const columns: ColumnType<Appointment>[] = [
    {
      title: 'STT',
      key: 'stt',
      width: '5%',
      render: (_, __, index) => (pagination.current! - 1) * pagination.pageSize! + index + 1
    },
    {
      title: 'Người cao tuổi',
      dataIndex: 'elderlyFullName',
      key: 'elderlyFullName',
      width: '15%',
      ...getColumnSearchProps('elderlyFullName'),
      render: (text: string, record: Appointment) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Space>
            <Avatar src={record.elderlyAvatar} icon={<UserOutlined />} />
            <Space direction='vertical' size={0}>
              <Text strong>{text}</Text>
              <a href={`mailto:${record.elderlyEmail}`}>{record.elderlyEmail}</a>
            </Space>
          </Space>
        </div>
      )
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'proName',
      key: 'proName',
      width: '15%',
      ...getColumnSearchProps('proName'),
      render: (text: string, record: Appointment) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* <Avatar src={record.proAvatar} alt={text} />
          <span>{text}</span> */}
          <Space>
            <Avatar src={record.proAvatar} icon={<UserOutlined />} />
            <Space direction='vertical' size={0}>
              <Text strong>{text}</Text>
              <a href={`mailto:${record.proEmail}`}>{record.proEmail}</a>
            </Space>
          </Space>
        </div>
      )
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'dateOfAppointment',
      key: 'dateOfAppointment',
      width: '10%',
      sorter: (a, b) => new Date(a.dateOfAppointment).getTime() - new Date(b.dateOfAppointment).getTime()
    },
    {
      title: 'Thời gian',
      dataIndex: 'timeOfAppointment',
      key: 'timeOfAppointment',
      width: '10%'
    },
    {
      title: 'Lý do',
      dataIndex: 'reasonOfMeeting',
      key: 'reasonOfMeeting',
      width: '20%',
      ...getColumnSearchProps('reasonOfMeeting')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      filters: [
        { text: 'Đã tham gia', value: 'Joined' },
        { text: 'Chưa diễn ra', value: 'NotYet' },
        { text: 'Đã hủy', value: 'Cancelled' }
      ],
      onFilter: (value, record) => {
        console.log('Filter value:', value) // In ra giá trị value khi filter
        // console.log('Record status:', record.status) // In ra trạng thái của bản ghi
        return record.status === value
      },
      render: (status: string) => getStatusTag(status)
    },

    {
      title: 'Chi tiết',
      key: 'action',
      width: '10%',
      render: (_, record) => (
        <Button
          type='text'
          icon={<MoreOutlined />}
          onClick={() => navigate(`/appointments/${record.elderlyEmail}`)} // Điều chỉnh route theo nhu cầu
        />
      )
    }
  ]

  return (
    <Content style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Quản lý lịch hẹn</h2>
        <Button icon={<RedoOutlined />} onClick={fetchData}>
          Làm mới
        </Button>
      </div>

      <Table
        columns={columns}
        rowKey={(record) => `${record.elderlyEmail}-${record.dateOfAppointment}-${record.timeOfAppointment}`}
        dataSource={filteredData}
        pagination={pagination}
        loading={tableLoading}
        onChange={handleTableChange}
        bordered
      />
    </Content>
  )
}

export default AppointmentPage
