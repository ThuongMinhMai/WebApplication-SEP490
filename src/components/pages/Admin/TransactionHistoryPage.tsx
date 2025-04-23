import { EyeFilled, RedoOutlined, SearchOutlined } from '@ant-design/icons'
import type { InputRef } from 'antd'
import { Avatar, Button, Input, Layout, message, Table, Tag } from 'antd'
import type { ColumnType, TablePaginationConfig } from 'antd/es/table'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const { Content } = Layout

interface Account {
  accountId: number
  fullName: string
  avatar: string
  email: string
  // Các trường khác có thể thêm nếu cần
}

interface Transaction {
  transactionId: number
  paymentCode: string
  paymentDate: string
  paymentMethod: string
  paymentStatus: string
  subscriptionName: string
  subscriptionDescription: string
  price: number
  account: Account
}

interface ApiResponse {
  status: number
  message: string
  data: Transaction[]
}

const TransactionHistoryPage = () => {
  const [data, setData] = useState<Transaction[]>([])
  const [filteredData, setFilteredData] = useState<Transaction[]>([])
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
      const response = await axios.get<ApiResponse>('https://api.diavan-valuation.asia/transaction-management')

      if (response.data.status === 1) {
        const startIndex = (pagination.current! - 1) * pagination.pageSize!
        const endIndex = startIndex + pagination.pageSize!
        const paginatedData = response.data.data.slice(startIndex, endIndex)

        setData(response.data.data)
        setFilteredData(paginatedData)
        setPagination({
          ...pagination,
          total: response.data.data.length
        })
      }
      setTableLoading(false)
    } catch (error) {
      console.error('Fetch error:', error)
      message.error('Failed to fetch transaction history')
      setTableLoading(false)
    }
  }

  const getColumnSearchProps = (dataIndex: keyof Transaction): ColumnType<Transaction> => ({
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

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: keyof Transaction) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  const getStatusLabel = (status: string) => {
    return status === 'Paid' ? 'Đã thanh toán' : status === 'Pending' ? 'Đang đợi thanh toán' : 'Đã hủy'
  }
  const columns: ColumnType<Transaction>[] = [
    {
      title: 'Người mua',
      dataIndex: ['account', 'fullName'],
      key: 'user',
      width: '15%',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar src={record.account.avatar} />
          <div>
            <div>{record.account.fullName}</div>
            <div style={{ fontSize: '0.8em', color: '#888' }}>{record.account.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Mã giao dịch',
      dataIndex: 'paymentCode',
      key: 'paymentCode',
      width: '10%',
      ...getColumnSearchProps('paymentCode')
    },
    {
      title: 'Ngày mua',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: '10%',
      sorter: (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime(),
      render: (date) => formatDate(date)
    },
    {
      title: 'Gói',
      dataIndex: 'subscriptionName',
      key: 'subscriptionName',
      width: '15%',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <div style={{ fontSize: '0.8em', color: '#888' }}>{record.subscriptionDescription}</div>
        </div>
      )
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: '5%',
      sorter: (a, b) => a.price - b.price,
      render: (price) => <Tag color='green'>{formatCurrency(price)}</Tag>
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: '5%',
      filters: [
        { text: 'ZaloPay', value: 'ZaloPay' },
        { text: 'Momo', value: 'Momo' },
        { text: 'VNPay', value: 'VNPay' }
      ],
      onFilter: (value, record) => record.paymentMethod === value,
      render: (method) => <Tag color='blue'>{method}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: '5%',
      filters: [
        { text: 'Đã thanh toán', value: 'Paid' },
        { text: 'Đang đợi thanh toán', value: 'Pending' },
        { text: 'Đã hủy', value: 'Cancelled' }
      ],
      onFilter: (value, record) => record.paymentStatus === value,
      render: (status) => {
        let color = ''
        switch (status) {
          case 'Paid':
            color = 'green'
            break
          case 'Pending':
            color = 'orange'
            break
          case 'Cancelled':
            color = 'red'
            break
          default:
            color = 'gray'
        }
        return <Tag color={color}>{getStatusLabel(status)}</Tag>
      }
    }
  ]

  return (
    <div>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold text-[#FF1356] m-0'>Lịch sử giao dịch</h2>
        <Button type='text' icon={<RedoOutlined />} onClick={fetchData} className='flex items-center'>
          Tải lại
        </Button>
      </div>
      <Table
        columns={columns}
        rowKey={(record) => record.transactionId.toString()}
        dataSource={filteredData}
        pagination={pagination}
        loading={tableLoading}
        onChange={handleTableChange}
        bordered
      />
    </div>
  )
}

export default TransactionHistoryPage
