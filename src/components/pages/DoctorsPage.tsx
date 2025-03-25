import { MoreOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import type { InputRef } from 'antd'
import { Avatar, Button, Input, Layout, Table, Tag } from 'antd'
import type { ColumnType, TablePaginationConfig } from 'antd/es/table'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const { Content } = Layout

interface User {
  accountId: number
  roleId: number
  email: string
  fullName: string
  avatar: string
  gender: string
  phoneNumber: string
  status: string
  // ... các trường khác nếu cần
}

interface ApiResponse {
  status: number
  message: string
  data: User[]
}

const DoctorsPage = () => {
  const [data, setData] = useState<User[]>([])
  const [filteredData, setFilteredData] = useState<User[]>([])
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
      const response = await fetch('https://api.diavan-valuation.asia/account-management/4')
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
      setTableLoading(false)
    }
  }

  const getColumnSearchProps = (dataIndex: keyof User): ColumnType<User> => ({
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
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#ec4839' : undefined }} />,
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

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: keyof User) => {
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

  const components = {
    header: {
      cell: (props: any) => (
        <th
          {...props}
          style={{
            backgroundColor: '#fff0f5',
            color: '#ec4899'
          }}
        />
      )
    }
  }
  const getGenderLabel = (gender: string) => {
    return gender === 'Male' ? 'Nam' : 'Nữ'
  }
  const columns: ColumnType<User>[] = [
    {
      title: 'Ảnh đại diện',
      dataIndex: 'avatar',
      key: 'avatar',
      width: '10%',
      render: (avatar: string, record: User) => (
        <Avatar
          src={avatar || 'https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png'}
          alt={record.fullName}
          size='large'
        />
      )
    },
    {
      title: 'Tên đầy đủ',
      dataIndex: 'fullName',
      key: 'fullName',
      width: '25%',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      ...getColumnSearchProps('fullName'),
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: '15%',
      // filters: [
      //   { text: 'Male', value: 'Male' },
      //   { text: 'Female', value: 'Female' }
      // ],
      // onFilter: (value, record) => record.gender === value,
      // render: (gender: string) => <Tag color={gender === 'Male' ? 'blue' : 'pink'}>{gender}</Tag>
      filters: [
        { text: 'Nam', value: 'Male' },
        { text: 'Nữ', value: 'Female' }
      ],
      onFilter: (value, record) => record.gender === value,
      render: (gender: string) => <Tag color={gender === 'Male' ? 'blue' : 'pink'}>{getGenderLabel(gender)}</Tag>
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: '20%',
      ...getColumnSearchProps('phoneNumber'),
      render: (phone: string) => <a href={`tel:${phone}`}>{phone}</a>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '25%',
      ...getColumnSearchProps('email'),
      render: (email: string) => <a href={`mailto:${email}`}>{email}</a>
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <Button
          type='text'
          icon={<MoreOutlined />}
          onClick={() => navigate(`/admin/doctors/${record.accountId}`)}
          style={{ color: '#ec4899' }}
        />
      )
    }
  ]

  return (
    <Content style={{ padding: '50px 50px' }}>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold text-pink-600 m-0'>Danh sách bác sĩ</h2>
        <Button
          type='primary'
          className='bg-pink-600 border-pink-600 font-bold hover:bg-pink-700 hover:border-pink-700'
          onClick={() => navigate(`/admin/doctors/add`)}

          icon={<PlusOutlined />}
        >
          Thêm bác sĩ
        </Button>
      </div>
      <Table
        columns={columns}
        rowKey={(record) => record.accountId.toString()}
        dataSource={filteredData}
        pagination={pagination}
        loading={tableLoading}
        onChange={handleTableChange}
        components={components}
        bordered
      />
    </Content>
  )
}

export default DoctorsPage
