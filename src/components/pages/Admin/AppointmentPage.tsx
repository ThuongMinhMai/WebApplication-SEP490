import { MoreOutlined, RedoOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import type { InputRef } from 'antd'
import { Avatar, Button, Input, Layout, message, Modal, Space, Spin, Table, Tag, Typography, Timeline } from 'antd'
import type { ColumnType, TablePaginationConfig } from 'antd/es/table'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image as AntImage } from 'antd'

const { Content } = Layout
const { Text, Title } = Typography
interface Appointment {
  appointmentId: number
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
interface CloudinaryImage {
  asset_id: string
  public_id: string
  version: number
  format: string
  width: number
  height: number
  type: string
  created_at: string
  asset_folder: string
  displayUrl?: string
}
interface CloudinaryResponse {
  resources: CloudinaryImage[]
  updated_at: string
}

// Nhóm ảnh theo ngày
interface GroupedImages {
  datetime: string
  formattedTime: string
  images: CloudinaryImage[]
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
  const [modalVisible, setModalVisible] = useState(false)
  const [currentAppointmentId, setCurrentAppointmentId] = useState<number | null>(null)
  const [appointmentImages, setAppointmentImages] = useState<CloudinaryImage[]>([])
  const [groupedImages, setGroupedImages] = useState<GroupedImages[]>([])
  const [imagesLoading, setImagesLoading] = useState(false)
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize])

  // Xử lý và nhóm ảnh theo giờ khi appointmentImages thay đổi
  useEffect(() => {
    if (appointmentImages.length > 0) {
      const grouped = groupImagesByHour(appointmentImages)
      setGroupedImages(grouped)
    } else {
      setGroupedImages([])
    }
  }, [appointmentImages])

  // Hàm nhóm ảnh theo giờ
  const groupImagesByHour = (images: CloudinaryImage[]): GroupedImages[] => {
    const groups: Record<string, CloudinaryImage[]> = {}

    // Sắp xếp ảnh theo thời gian tạo (mới nhất lên đầu)
    const sortedImages = [...images].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Nhóm ảnh theo giờ
    sortedImages.forEach((image) => {
      const date = new Date(image.created_at)
      // Lấy thời gian chính xác đến phút
      const timeKey = date.toISOString().split('.')[0] // YYYY-MM-DDTHH:MM:SS

      if (!groups[timeKey]) {
        groups[timeKey] = []
      }

      groups[timeKey].push(image)
    })

    // Chuyển đổi thành mảng và sắp xếp theo giờ (mới nhất lên đầu)
    return Object.entries(groups)
      .map(([datetime, images]) => {
        const formattedTime = formatDetailedTime(datetime)
        return { datetime, formattedTime, images }
      })
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
  }

  // Hàm điều chỉnh múi giờ (+7 giờ)
  const adjustTimeZone = (date: Date): Date => {
    const adjustedDate = new Date(date)
    adjustedDate.setHours(adjustedDate.getHours() + 7)
    return adjustedDate
  }

  // Hàm định dạng thời gian chi tiết (ngày + giờ) với điều chỉnh +7h
  const formatDetailedTime = (dateTimeString: string): string => {
    const date = adjustTimeZone(new Date(dateTimeString))
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')

    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`
  }

  // Hàm định dạng giờ với điều chỉnh +7h
  const formatTime = (dateTimeString: string): string => {
    const date = adjustTimeZone(new Date(dateTimeString))
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

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

  const fetchAppointmentImages = async (appointmentId: number) => {
    setImagesLoading(true)
    try {
      const url = `https://res.cloudinary.com/drtn3fqci/image/list/appointment${appointmentId}.json`

      const response = await fetch(url)
      const result: CloudinaryResponse = await response.json()

      const imagesWithUrls = result.resources.map((image) => ({
        ...image,
        displayUrl: `https://res.cloudinary.com/drtn3fqci/image/upload/${image.public_id}.${image.format}`
      }))

      setAppointmentImages(imagesWithUrls)
    } catch (error) {
      console.error('Lỗi tải hình ảnh', error)
      message.error('Không thể tải hình ảnh từ Cloudinary')
      setAppointmentImages([])
    } finally {
      setImagesLoading(false)
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

  const handleShowDetail = (appointmentId: number) => {
    const appointment = data.find((item) => item.appointmentId === appointmentId) || null
    setCurrentAppointment(appointment)
    setCurrentAppointmentId(appointmentId)
    setModalVisible(true)
    fetchAppointmentImages(appointmentId)
  }

  const TimelineImagePreview = () => {
    if (imagesLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Spin size='large' />
        </div>
      )
    }

    if (appointmentImages.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Text type='secondary'>Không có hình ảnh nào cho lịch hẹn này</Text>
        </div>
      )
    }

    return (
      <div className='timeline-container' style={{ padding: '20px 0' }}>
        <Timeline mode='left'>
          {groupedImages.map((group) => (
            <Timeline.Item key={group.datetime} label={group.formattedTime} color='blue'>
              <div style={{ marginBottom: '24px' }}>
                <AntImage.PreviewGroup>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '16px',
                      padding: '8px'
                    }}
                  >
                    {group.images.map((image) => (
                      <div key={image.asset_id} style={{ position: 'relative' }}>
                        <AntImage
                          src={image.displayUrl}
                          alt={`Ảnh chụp lúc ${formatTime(image.created_at)}`}
                          style={{ width: '100%', borderRadius: '8px' }}
                        />
                      </div>
                    ))}
                  </div>
                </AntImage.PreviewGroup>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    )
  }
  const HorizontalTimeline = () => {
    return (
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          padding: '16px 0',
          gap: '24px'
        }}
      >
        {groupedImages.map((group) => (
          <div
            key={group.datetime}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '200px'
            }}
          >
            {/* Dot và thời gian */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '8px'
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#1890ff',
                  marginBottom: '4px'
                }}
              />
              <div
                style={{
                  color: '#666',
                  fontWeight: 500,
                  whiteSpace: 'nowrap'
                }}
              >
                {group.formattedTime}
              </div>
            </div>

            {/* Các ảnh */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexDirection: 'column',
                width: '100%'
              }}
            >
              {group.images.map((image) => (
                <AntImage
                  key={image.asset_id}
                  src={image.displayUrl}
                  width={'100%'}
                  style={{
                    borderRadius: '6px',
                    aspectRatio: '4/3',
                    objectFit: 'cover'
                  }}
                  preview
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
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
        return record.status === value
      },
      render: (status: string) => getStatusTag(status)
    },

    {
      title: 'Chi tiết',
      key: 'action',
      width: '10%',
      render: (_, record) =>
        record.status !== 'Cancelled' ? (
          <Button type='text' icon={<MoreOutlined />} onClick={() => handleShowDetail(record.appointmentId)} />
        ) : null
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

      <Modal
        title={
          <div>
            <div>Hình ảnh lịch hẹn </div>
            {currentAppointment && (
              <div
                style={{
                  fontSize: '14px',
                  color: '#666',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Avatar src={currentAppointment.elderlyAvatar} size='small' icon={<UserOutlined />} />
                <div>
                  <Text strong style={{ color: '#333' }}>
                    {currentAppointment.elderlyFullName}
                  </Text>
                  <Text type='secondary' style={{ marginLeft: '8px' }}>
                    {currentAppointment.dateOfAppointment} ({currentAppointment.timeOfAppointment})
                  </Text>
                </div>
              </div>
            )}
          </div>
        }
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width='80%'
      >
        <TimelineImagePreview />
        {/* <HorizontalTimeline /> */}
      </Modal>
      {/* <Modal
        title={
          <div style={{ padding: '8px 0' }}>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>Hình ảnh lịch hẹn</div>
            {currentAppointment && (
              <div
                style={{
                  fontSize: '14px',
                  color: '#666',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Avatar src={currentAppointment.elderlyAvatar} size='small' icon={<UserOutlined />} />
                <div>
                  <Text strong style={{ color: '#333' }}>
                    {currentAppointment.elderlyFullName}
                  </Text>
                  <Text type='secondary' style={{ marginLeft: '8px' }}>
                    {currentAppointment.dateOfAppointment} ({currentAppointment.timeOfAppointment})
                  </Text>
                </div>
              </div>
            )}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width='80%'
        styles={{
          header: {
            borderBottom: '1px solid #f0f0f0',
            padding: '16px 24px',
            marginBottom: 0
          },
          body: {
            padding: '24px',
            maxHeight: '70vh',
            overflowY: 'auto'
          }
        }}
      >
        <TimelineImagePreview />
      </Modal> */}
    </Content>
  )
}

export default AppointmentPage
