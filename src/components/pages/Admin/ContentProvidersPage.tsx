import { PlusOutlined, RedoOutlined, SearchOutlined } from '@ant-design/icons'
import type { InputRef } from 'antd'
import { Avatar, Button, DatePicker, Form, Input, Layout, message, Modal, Select, Table, Tag } from 'antd'
import type { ColumnType, TablePaginationConfig } from 'antd/es/table'
import { useEffect, useRef, useState } from 'react'

const { Content } = Layout
const { Option } = Select

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

const ContentProviderPage = () => {
  const [data, setData] = useState<User[]>([])
  const [filteredData, setFilteredData] = useState<User[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<{ id: number; newStatus: string } | null>(null)
  const [form] = Form.useForm()

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
      const response = await fetch('https://api.diavan-valuation.asia/account-management/5')
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

      const response = await fetch('https://api.diavan-valuation.asia/account-management/system-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*'
        },
        body: JSON.stringify({
          ...values,
          roleId: 5, // Role ID for content provider (assuming 5 is the correct role)
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null
        })
      })

      const result = await response.json()
      if (result.status === 1) {
        message.success('Thêm nhà cung cấp thành công')
        fetchData() // Refresh the table data
        setIsModalVisible(false)
        form.resetFields()
      } else {
        message.error(result.message || 'Có lỗi xảy ra khi thêm nhà cung cấp')
      }
    } catch (error) {
      console.error('Error:', error)
      message.error('Có lỗi xảy ra khi thêm nhà cung cấp')
    } finally {
      setModalLoading(false)
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
            color: '#FF1356'
          }}
        />
      )
    }
  }
  const getGenderLabel = (gender: string) => {
    return gender === 'Male' ? 'Nam' : 'Nữ'
  }
  const handleStatusChange = (accountId: number, newStatus: string) => {
    setCurrentAccount({ id: accountId, newStatus })
    setIsModalOpen(true)
  }

  const handleConfirmStatusChange = async () => {
    if (!currentAccount) return

    try {
      const response = await fetch('https://api.diavan-valuation.asia/account-management/account-status', {
        method: 'PUT',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountId: currentAccount.id,
          status: currentAccount.newStatus
        })
      })

      const result = await response.json()

      if (result.status === 1) {
        // Giả sử status 1 là thành công
        // Cập nhật lại dữ liệu
        const updatedData = data.map((item) =>
          item.accountId === currentAccount.id ? { ...item, status: currentAccount.newStatus } : item
        )
        setData(updatedData)
        // Cập nhật filteredData với dữ liệu đã được paginate
        const startIndex = (pagination.current! - 1) * pagination.pageSize!
        const endIndex = startIndex + pagination.pageSize!
        const updatedFilteredData = updatedData.slice(startIndex, endIndex)

        setFilteredData(updatedFilteredData)
        message.success(`Cập nhật trạng thái thành công`)
      } else {
        message.error(result.message || 'Cập nhật trạng thái thất bại')
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật trạng thái' + error)
      console.error('Error:', error)
    } finally {
      setIsModalOpen(false)
      setCurrentAccount(null)
    }
  }

  const columns: ColumnType<User>[] = [
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
        { text: 'Đang hoạt động', value: 'Active' },
        { text: 'Ngưng hoạt động', value: 'Inactive' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string, record: User) => (
        <>
          <Select
            value={status}
            style={{ width: '100%' }}
            onChange={(value) => handleStatusChange(record.accountId, value)}
          >
            <Option value='Active'>
              <Tag color='green' style={{ width: '90%' }}>
                Đang hoạt động
              </Tag>
            </Option>
            <Option value='Inactive'>
              <Tag color='red' style={{ width: '90%' }}>
                Ngưng hoạt động
              </Tag>
            </Option>
          </Select>
          <Modal
            title='Xác nhận thay đổi trạng thái'
            open={isModalOpen && currentAccount?.id === record.accountId}
            onOk={handleConfirmStatusChange}
            onCancel={() => setIsModalOpen(false)}
            okText='Xác nhận'
            cancelText='Hủy'
            okButtonProps={{
              style: {
                backgroundColor: '#FF1356',
                borderColor: '#FF1356'
              }
            }}
          >
            {currentAccount?.newStatus === 'Inactive' ? (
              <p>
                Bạn có chắc chắn muốn ngưng hoạt động tài khoản này? Tài khoản sau khi ngưng hoạt động sẽ không thể truy
                cập vào hệ thống.
              </p>
            ) : (
              <p>
                Bạn có chắc chắn muốn kích hoạt tài khoản này? Tài khoản sau khi kích hoạt sẽ có thể truy cập vào hệ
                thống.
              </p>
            )}
          </Modal>
        </>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '25%',
      ...getColumnSearchProps('email'),
      render: (email: string) => <a href={`mailto:${email}`}>{email}</a>
    }
  ]

  return (
    <Content style={{ padding: '50px 50px' }}>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold text-[#FF1356] m-0'>Danh sách nhà cung cấp</h2>
        <div className='flex justify-between items-center gap-5 mb-5'>
          <Button type='text' icon={<RedoOutlined />} onClick={fetchData} className='flex items-center'>
            Tải lại
          </Button>
          <Button
            type='primary'
            className='bg-[#FF1356] border-[#FF1356] font-bold hover:bg-pink-700 hover:border-pink-700'
            icon={<PlusOutlined />}
            onClick={showModal}
          >
            Thêm nhà cung cấp
          </Button>
        </div>
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

      <Modal
        title='Thêm nhà cung cấp nội dung mới'
        visible={isModalVisible}
        onOk={handleSubmit}
        confirmLoading={modalLoading}
        onCancel={handleCancel}
        okText='Thêm'
        cancelText='Hủy'
        okButtonProps={{ className: 'bg-[#FF1356] border-pink-600 hover:bg-pink-700 hover:border-pink-700' }}
      >
        <Form form={form} layout='vertical'>
          <Form.Item name='fullName' label='Họ và tên' rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
            <Input placeholder='Nhập họ và tên' />
          </Form.Item>

          <Form.Item
            name='email'
            label='Email'
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder='Nhập email' />
          </Form.Item>

          <Form.Item name='password' label='Mật khẩu' rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
            <Input.Password placeholder='Nhập mật khẩu' />
          </Form.Item>

          <Form.Item name='gender' label='Giới tính' rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}>
            <Select placeholder='Chọn giới tính'>
              <Option value='Male'>Nam</Option>
              <Option value='Female'>Nữ</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label='Số điện thoại'
            name='phoneNumber'
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              {
                validator: (_, value) => {
                  if (!/^0\d{9}$/.test(value)) {
                    return Promise.reject('Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0')
                  }
                  return Promise.resolve()
                }
              }
            ]}
          >
            <Input
              placeholder='Nhập số điện thoại'
              maxLength={10}
              onChange={(e) => {
                // Chỉ cho phép nhập số
                const value = e.target.value.replace(/\D/g, '')
                // Đảm bảo luôn bắt đầu bằng 0
                if (value && !value.startsWith('0')) {
                  e.target.value = '0' + value
                } else {
                  e.target.value = value
                }
                return e
              }}
            />
          </Form.Item>

          <Form.Item
            name='dateOfBirth'
            label='Ngày sinh'
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format='DD/MM/YYYY'
              placeholder='Chọn ngày sinh'
              disabledDate={(current) => {
                return current && current.year() > 2024
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  )
}

export default ContentProviderPage
