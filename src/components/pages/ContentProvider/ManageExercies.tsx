import { ExclamationCircleOutlined, EyeFilled, SearchOutlined, VideoCameraOutlined } from '@ant-design/icons'
import type { InputRef } from 'antd'
import { Avatar, Button, Input, Layout, message, Modal, Select, Table, Tag } from 'antd'
import type { ColumnType, TablePaginationConfig } from 'antd/es/table'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const { Content } = Layout
const { Option } = Select

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

const ManageExercise = () => {
  const [data, setData] = useState<Playlist[]>([])
  const [filteredData, setFilteredData] = useState<Playlist[]>([])
  const navigate = useNavigate()
  const [currentPlayList, setCurrentPlayList] = useState<Playlist | null>(null)
  const [changeStatusLoading, setChangeStatusLoading] = useState(false)
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
  const handleChangeStatusConfirm = async () => {
    if (!currentPlayList) return

    try {
      setChangeStatusLoading(true)
      const response = await fetch(
        `https://api.diavan-valuation.asia/content-management/playlist-status?playlistId=${currentPlayList.playlistId}&status=${currentPlayList.status}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 1) {
        message.success('Cập nhật trạng thái danh sách phát thành công')
        // setData(
        //   data.map((playlist:Playlist) => (playlist.playlistId === currentPlayList.playlistId ? { ...playlist, status: currentPlayList.status } : playlist))
        // )
        fetchData()
      } else {
        message.error( data.data || 'Cập nhật danh sách phát thất bại')
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setChangeStatusLoading(false)
      setCurrentPlayList(null)
    }
  }

  const handleChangeStatusCancel = () => {
    setCurrentPlayList(null)
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
  const handleStatusChange = (playList: Playlist, status: string) => {
    setCurrentPlayList({ ...playList, status })
  }
  const columns: ColumnType<Playlist>[] = [
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: '10%',
      render: (imageUrl: string | null) => (
        <Avatar
          src={imageUrl || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
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
      render: (status: string, record: Playlist) => {
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

        //   return (
        //     <Tag color={color} style={{ width: '100%', textAlign: 'center' }}>
        //       {text}
        //     </Tag>
        //   )

        if (status === 'AdminDelete') {
          return (
            <Tag color={color} style={{ width: '100%', textAlign: 'center' }}>
              {text}
            </Tag>
          )
        }

        return (
          <Select value={status} style={{ width: 150 }} onChange={(value) => handleStatusChange(record, value)}>
            <Option value='Active'>
              <Tag color='green' style={{ width: '100%' }}>
                Đang sử dụng
              </Tag>
            </Option>
            <Option value='Inactive'>
              <Tag color='red' style={{ width: '100%' }}>
                Ngưng sử dụng
              </Tag>
            </Option>
          </Select>
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
                onClick={() => navigate(`/content-provider/exercises/${record.playlistId}?playlistname=${record.playlistName}`)}
              >
                <EyeFilled /> Xem
              </Button>
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

      <Modal
        title={
          <>
            <ExclamationCircleOutlined className='text-yellow-500 mr-2' />
            Xác nhận thay đổi trạng thái
          </>
        }
        open={!!currentPlayList}
        onOk={handleChangeStatusConfirm}
        onCancel={handleChangeStatusCancel}
        okText='Xác nhận'
        cancelText='Hủy'
        okButtonProps={{
          style: {
            backgroundColor: '#FF1356',
            borderColor: '#FF1356'
          },
          loading: changeStatusLoading
        }}
      >
        {currentPlayList &&
          (currentPlayList.status === 'Inactive' ? (
            <p>
              Bạn có chắc chắn muốn ngưng danh sách phát <strong>{currentPlayList.playlistName}</strong>? Hành động này
              sẽ khiến tất cả bài học trong danh sách phát không khả dụng với người dùng.
            </p>
          ) : (
            <p>
              Bạn có chắc chắn muốn sử dụng danh sách phát <strong>{currentPlayList.playlistName}</strong>? Hành động
              này sẽ khiến danh sách phát khả dụng với tất cả người dùng.
            </p>
          ))}
      </Modal>
    </Content>
  )
}

export default ManageExercise
