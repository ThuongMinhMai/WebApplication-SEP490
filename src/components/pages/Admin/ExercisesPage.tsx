import { EyeFilled, RedoOutlined, SearchOutlined, StopOutlined, VideoCameraOutlined } from '@ant-design/icons'
import type { InputRef } from 'antd'
import { Avatar, Button, Input, Layout, message, Modal, Table, Tag } from 'antd'
import type { ColumnType, TablePaginationConfig } from 'antd/es/table'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const { Content } = Layout

interface Playlist {
  playlistId: number
  playlistName: string
  imageUrl: string | null
  numberOfContent: number
  status: string
}

interface ApiResponse {
  status: number
  message: string
  data: Playlist[]
}

const ExerciesPage = () => {
  const [data, setData] = useState<Playlist[]>([])
  const [filteredData, setFilteredData] = useState<Playlist[]>([])
  const navigate = useNavigate()

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100']
  })
  const [tableLoading, setTableLoading] = useState(false)
  const searchInput = useRef<InputRef>(null)

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize])

  const fetchData = async () => {
    setTableLoading(true)
    try {
      const response = await fetch('https://api.diavan-valuation.asia/content-management/all-lesson-playlist')
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
      }
      setTableLoading(false)
    } catch (error) {
      console.error('Fetch error:', error)
      message.error('Failed to fetch playlists lesson')
      setTableLoading(false)
    }
  }

  const getColumnSearchProps = (dataIndex: keyof Playlist): ColumnType<Playlist> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
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
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#FF1356' : undefined }} />,
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

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: keyof Playlist) => {
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

  const handleBanPlaylist = async (playlistId: number, playlistName: string) => {
    try {
      // Hiển thị dialog xác nhận
      Modal.confirm({
        title: 'Xác nhận cấm danh sách phát',
        content: (
          <div>
            <p>
              Bạn có chắc chắn muốn cấm danh sách phát <strong>{playlistName}</strong>?
            </p>
            <p style={{ color: 'red' }}>Lưu ý: Khi cấm, tất cả video trong danh sách phát này sẽ không thể sử dụng!</p>
          </div>
        ),
        okText: 'Đồng ý',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        async onOk() {
          try {
            // Gọi API cấm playlist
            const response = await axios.delete(
              `https://api.diavan-valuation.asia/content-management/playlist-by-admin?playlistId=${playlistId}`
            )

            // Xử lý response
            if (response.data.status === 1) {
              message.success(`Đã cấm danh sách phát ${playlistName} thành công`)
              // Cập nhật lại danh sách
              fetchData()
            } else {
              message.error(response.data.message || 'Cấm danh sách phát thất bại')
            }
          } catch (error) {
            if (axios.isAxiosError(error)) {
              if (error.response?.data?.status === 0) {
                message.error(error.response.data.message || 'Danh sách phát không tồn tại')
              } else {
                message.error('Lỗi hệ thống khi cấm danh sách phát')
              }
            } else {
              message.error('Lỗi không xác định')
            }
            console.error('Error banning playlist:', error)
          }
        }
      })
    } catch (error) {
      console.error('Error showing confirmation dialog:', error)
    }
  }

  const columns: ColumnType<Playlist>[] = [
    {
      title: 'STT',
      key: 'stt',
      width: '5%',
      render: (_, __, index) => {
        // Tính số thứ tự dựa trên trang hiện tại và số lượng item mỗi trang
        return (pagination.current! - 1) * pagination.pageSize! + index + 1
      }
    },
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: '5%',
      render: (imageUrl: string | null) => (
        <Avatar
          // src={imageUrl || 'https://preview.redd.it/q3varo58nxkz.jpg?width=640&crop=smart&auto=webp&s=3d9df6326088836eeafcf51c77d9c07de5c10bde'}
          src={imageUrl}
          size='large'
          shape='square'
        />
      )
    },
    {
      title: 'Tên danh sách phát',
      dataIndex: 'playlistName',
      key: 'playlistName',
      width: '20%',
      sorter: (a, b) => a.playlistName.localeCompare(b.playlistName),
      ...getColumnSearchProps('playlistName'),
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Số lượng video',
      dataIndex: 'numberOfContent',
      key: 'numberOfContent',
      width: '10%',
      sorter: (a, b) => a.numberOfContent - b.numberOfContent,
      render: (count: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <VideoCameraOutlined style={{ color: count > 0 ? '#52c41a' : '#faad14' }} />
          <Tag color={count > 0 ? 'green' : 'orange'}>
            {count} {count === 1 ? 'video' : 'video'}
          </Tag>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '5%',
      filters: [
        { text: 'Đang sử dụng', value: 'Active' },
        { text: 'Ngưng sử dụng', value: 'Inactive' },
        { text: 'Đã bị cấm', value: 'AdminDelete' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        let color = ''
        let text = ''

        switch (status) {
          case 'Active':
            color = 'green'
            text = 'Đang sử dụng'
            break
          case 'Inactive':
            color = 'orange'
            text = 'Ngưng sử dụng'
            break
          case 'AdminDelete':
            color = 'red'
            text = 'Đã bị cấm'
            break
          default:
            color = 'gray'
            text = 'Không xác định'
        }

        return (
          <Tag color={color} style={{ width: '100%', textAlign: 'center' }}>
            {text}
          </Tag>
        )
      }
    },

    {
      title: '',
      key: 'actions',
      width: '5%',
      render: (_, record) => (
        <div className='flex'>
          {record.numberOfContent > 0 && (
            <>
              <Button
                type='link'
                onClick={() => navigate(`/admin/exercises/${record.playlistId}?playlistname=${record.playlistName}`)}
              >
                <EyeFilled /> Xem
              </Button>
              {record.status == 'Active' && (
                <Button type='link' danger onClick={() => handleBanPlaylist(record.playlistId, record.playlistName)}>
                  <StopOutlined /> Cấm
                </Button>
              )}
            </>
          )}
        </div>
      )
    }
  ]

  return (
    <Content style={{ padding: '50px 50px' }}>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold text-[#FF1356] m-0'>Danh sách phát bài tập</h2>
        <Button type='text' icon={<RedoOutlined />} onClick={fetchData} className='flex items-center'>
          Tải lại
        </Button>
      </div>
      <Table
        columns={columns}
        rowKey={(record) => record.playlistId.toString()}
        dataSource={filteredData}
        pagination={pagination}
        loading={tableLoading}
        onChange={handleTableChange}
        bordered
      />
    </Content>
  )
}

export default ExerciesPage
