import { CustomerServiceOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import type { InputRef } from 'antd'
import { Avatar, Button, Input, Layout, Table, Tag, Modal, Form, message } from 'antd'
import type { ColumnType, TablePaginationConfig } from 'antd/es/table'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const { Content } = Layout

interface Playlist {
  playlistId: number
  playlistName: string
  imageUrl: string | null
  numberOfContent: number
}

interface ApiResponse {
  status: number
  message: string
  data: Playlist[]
}

const MusicPage = () => {
  const [data, setData] = useState<Playlist[]>([])
  const [filteredData, setFilteredData] = useState<Playlist[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100']
  })
  const [tableLoading, setTableLoading] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const searchInput = useRef<InputRef>(null)

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize])

  const fetchData = async () => {
    setTableLoading(true)
    try {
      const response = await fetch('https://api.diavan-valuation.asia/content-management/all-music-playlist')
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
      message.error('Failed to fetch playlists')
      setTableLoading(false)
    }
  }

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setModalLoading(true)

      // Here you would call your API to create a new playlist
      // For example:
      // const response = await fetch('https://api.diavan-valuation.asia/content-management/music-playlist', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(values)
      // })

      // For now, we'll just simulate success
      message.success('Playlist created successfully!')
      setIsModalVisible(false)
      form.resetFields()
      fetchData() // Refresh the data
    } catch (error) {
      console.error('Error:', error)
      message.error('Failed to create playlist')
    } finally {
      setModalLoading(false)
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
          Search
        </Button>
        <Button onClick={() => handleReset(clearFilters)} size='small' style={{ width: 90 }}>
          Reset
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
      width: '30%',
      sorter: (a, b) => a.playlistName.localeCompare(b.playlistName),
      ...getColumnSearchProps('playlistName'),
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Số lượng bài hát',
      dataIndex: 'numberOfContent',
      key: 'numberOfContent',
      width: '20%',
      sorter: (a, b) => a.numberOfContent - b.numberOfContent,
      render: (count: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CustomerServiceOutlined style={{ color: count > 0 ? '#52c41a' : '#faad14' }} />
          <Tag color={count > 0 ? 'green' : 'orange'}>
            {count} {count === 1 ? 'bài hát' : 'bài hát'}
          </Tag>
        </div>
      )
    },
    {
      title: 'Tùy chọn',
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        <div>
          <Button
            type='link'
            onClick={() => navigate(`/admin/musics/${record.playlistId}?playlistname=${record.playlistName}`)}
          >
            Xem
          </Button>
          <Button type='link' danger>
            Xóa
          </Button>
        </div>
      )
    }
  ]

  return (
    <Content style={{ padding: '50px 50px' }}>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold text-blue-600 m-0'>Music Playlists</h2>
        <Button
          type='primary'
          className='bg-blue-600 border-blue-600 font-bold hover:bg-blue-700 hover:border-blue-700'
          icon={<PlusOutlined />}
          onClick={showModal}
        >
          Add Playlist
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

      <Modal
        title='Add New Playlist'
        visible={isModalVisible}
        onOk={handleSubmit}
        confirmLoading={modalLoading}
        onCancel={handleCancel}
        okText='Add'
        cancelText='Cancel'
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='playlistName'
            label='Playlist Name'
            rules={[{ required: true, message: 'Please enter playlist name' }]}
          >
            <Input placeholder='Enter playlist name' />
          </Form.Item>

          <Form.Item name='imageUrl' label='Cover Image URL'>
            <Input placeholder='Enter image URL (optional)' />
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  )
}

export default MusicPage
