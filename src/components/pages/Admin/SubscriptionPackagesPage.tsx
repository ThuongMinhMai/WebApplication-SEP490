import {
  EyeFilled,
  PauseOutlined,
  PlusOutlined,
  PoweroffOutlined,
  QuestionOutlined,
  SearchOutlined,
  StopOutlined
} from '@ant-design/icons'
import type { InputRef } from 'antd'
import {
  Button,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Layout,
  message,
  Modal,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd'
import type { ColumnType, TablePaginationConfig } from 'antd/es/table'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const { Content } = Layout
const { Title } = Typography

interface SubscriptionPackage {
  subscriptionId: number
  name: string
  description: string
  fee: number
  validityPeriod: number
  createdDate: string
  createdTime: string
  updatedTime: string
  updatedDate: string
  numberOfUsers: number
  status: string
  accountId: number
  numberOfMeeting: number
}

interface ApiResponse {
  status: number
  message: string
  data: SubscriptionPackage[]
}

const SubscriptionPackagesPage = () => {
  const [data, setData] = useState<SubscriptionPackage[]>([])
  const [filteredData, setFilteredData] = useState<SubscriptionPackage[]>([])
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
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
      const response = await axios.get<ApiResponse>('https://api.diavan-valuation.asia/combo-management')
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
      message.error('Không thể tải các gói đăng ký')
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

      Modal.confirm({
        title: 'Xác nhận tạo gói mới',
        content: (
          <div>
            <p>Bạn có chắc chắn muốn tạo gói mới với thông tin sau?</p>
            <Descriptions bordered column={1} size='small' style={{ marginTop: 16 }}>
              <Descriptions.Item label='Tên gói'>{values.name}</Descriptions.Item>
              <Descriptions.Item label='Mô tả'>{values.description}</Descriptions.Item>
              <Descriptions.Item label='Phí'>{values.fee.toLocaleString()} VND</Descriptions.Item>
              <Descriptions.Item label='Thời hạn'>{values.validityPeriod} ngày</Descriptions.Item>
              <Descriptions.Item label='Số buổi gặp'>{values.numberOfMeeting}</Descriptions.Item>
            </Descriptions>
            <p style={{ marginTop: 16, color: '#ff4d4f', fontWeight: 500 }}>
              Lưu ý: Gói sau khi tạo sẽ không thể chỉnh sửa. Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.
            </p>
          </div>
        ),
        okText: 'Xác nhận tạo',
        cancelText: 'Kiểm tra lại',
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            setLoading(true)
            const response = await axios.post(
              'https://api.diavan-valuation.asia/combo-management',
              {
                name: values.name,
                description: values.description,
                fee: values.fee,
                validityPeriod: values.validityPeriod,
                numberOfMeeting: values.numberOfMeeting
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  accept: '*/*'
                }
              }
            )

            if (response.data.status === 1) {
              message.success('Tạo gói mới thành công')
              setIsModalVisible(false)
              form.resetFields()
              fetchData()
            } else {
              message.error(response.data.message || 'Tạo gói thất bại')
            }
          } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
              message.error(error.response.data?.message || 'Tạo gói thất bại')
            } else {
              message.error('Đã xảy ra lỗi khi tạo gói')
            }
            console.error('Error adding package:', error)
          } finally {
            setLoading(false)
          }
        }
      })
    } catch (error) {
      console.error('Form validation failed:', error)
    }
  }

  const getColumnSearchProps = (dataIndex: keyof SubscriptionPackage): ColumnType<SubscriptionPackage> => ({
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

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: keyof SubscriptionPackage) => {
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

  const handleChangeStatus = async (subscriptionId: number, name: string, newStatus: string) => {
    try {
      let modalContent = null
      let okButtonProps = {}

      switch (newStatus) {
        case 'Tạm ngưng':
          modalContent = (
            <div>
              <p>
                Gói <strong>{name}</strong> đang được sử dụng bởi một số tài khoản.
              </p>
              <p>Bạn không thể chuyển trực tiếp sang trạng thái "Ngưng hoạt động".</p>
              <p>
                Bạn đang chuyển gói <strong>{name}</strong> sang trạng thái <Tag color='orange'>Tạm ngưng</Tag>.
              </p>
              <p>Khi tạm ngưng:</p>
              <ul>
                <li>Gói sẽ không hiển thị để mua mới trong hệ thống</li>
                <li>Vẫn duy trì hiệu lực cho các tài khoản đã mua</li>
                <li>Gói sẽ ngưng hoạt động sau khi không còn tài khoản sử dụng</li>
              </ul>
              <p style={{ marginTop: 16, fontWeight: 500 }}>Bạn có chắc chắn muốn tiếp tục?</p>
            </div>
          )
          okButtonProps = { danger: true }
          break

        case 'Inactive':
          modalContent = (
            <div>
              <p>
                Bạn đang chuyển gói <strong>{name}</strong> sang trạng thái <Tag color='red'>Ngưng hoạt động</Tag>.
              </p>
              <p style={{ color: '#ff4d4f', fontWeight: 500 }}>Lưu ý quan trọng:</p>
              <ul>
                <li>Gói sẽ hoàn toàn không khả dụng trong hệ thống</li>
              </ul>
              <p style={{ marginTop: 16, fontWeight: 500 }}>Bạn có chắc chắn muốn ngưng hoạt động gói này?</p>
            </div>
          )
          okButtonProps = { danger: true }
          break

        case 'Active':
          modalContent = (
            <div>
              <p>
                Bạn đang kích hoạt gói <strong>{name}</strong> sang trạng thái <Tag color='green'>Hoạt động</Tag>.
              </p>
              <p>Khi kích hoạt:</p>
              <ul>
                <li>Gói sẽ hiển thị và có thể mua trong hệ thống</li>
                <li>Các tài khoản đã mua có thể tiếp tục sử dụng</li>
              </ul>
              <p style={{ marginTop: 16, fontWeight: 500 }}>Bạn có chắc chắn muốn kích hoạt gói này?</p>
            </div>
          )
          okButtonProps = { danger: true }
          break
      }

      Modal.confirm({
        title: `Xác nhận thay đổi trạng thái gói`,
        content: modalContent,
        okText: 'Xác nhận',
        cancelText: 'Hủy bỏ',
        okButtonProps: okButtonProps,
        async onOk() {
          try {
            // Gọi API thay đổi trạng thái
            const response = await axios.put(
              `https://api.diavan-valuation.asia/combo-management/update/${subscriptionId}?status=${encodeURIComponent(newStatus)}`
            )
            const statusMap: Record<string, string> = {
              Active: 'Hoạt động',
              Inactive: 'Ngưng hoạt động',
              'Tạm ngưng': 'Tạm ngưng'
            }

            const statusDisplay = statusMap[newStatus] || newStatus
            // Kiểm tra response từ server
            if (response.data && response.data.status === 1) {
              message.success(`Đã thay đổi trạng thái gói ${name} thành ${statusDisplay}`)
              fetchData()
            } else {
              message.error(response.data?.message || 'Thay đổi trạng thái thất bại')
            }
          } catch (error) {
            console.error('Error changing status:', error)

            // Xử lý lỗi chi tiết hơn
            if (axios.isAxiosError(error)) {
              if (error.response) {
                // Lỗi từ phía server (4xx, 5xx)
                message.error(error.response.data?.message || 'Lỗi server khi thay đổi trạng thái')
              } else if (error.request) {
                // Không nhận được phản hồi từ server
                message.error('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng')
              } else {
                // Lỗi khi thiết lập request
                message.error('Đã xảy ra lỗi khi gửi yêu cầu')
              }
            } else {
              message.error('Đã xảy ra lỗi không xác định')
            }
          }
        }
      })
    } catch (error) {
      console.error('Error showing confirmation dialog:', error)
    }
  }
  const getStatusLabel = (status: string) => {
    return status === 'Active' ? 'Đang hoạt động' : status === 'Inactive' ? 'Ngưng hoạt động' : status
  }
  const columns: ColumnType<SubscriptionPackage>[] = [
    {
      title: 'Tên gói',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps('name'),
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: '25%',
      ...getColumnSearchProps('description')
    },
    {
      title: 'Phí (VND)',
      dataIndex: 'fee',
      key: 'fee',
      width: '10%',
      sorter: (a, b) => a.fee - b.fee,
      render: (fee: number) => fee.toLocaleString(),
      align: 'right'
    },
    {
      title: 'Hiệu lực (ngày)',
      dataIndex: 'validityPeriod',
      key: 'validityPeriod',
      width: '10%',
      sorter: (a, b) => a.validityPeriod - b.validityPeriod,
      align: 'center'
    },
    {
      title: 'Số buổi hẹn',
      dataIndex: 'numberOfMeeting',
      key: 'numberOfMeeting',
      width: '10%',
      sorter: (a, b) => a.numberOfMeeting - b.numberOfMeeting,
      align: 'center'
    },
    {
      title: 'Đang sử dụng (tài khoản)',
      dataIndex: 'numberOfUsers',
      key: 'numberOfUsers',
      width: '10%',
      sorter: (a, b) => a.numberOfUsers - b.numberOfUsers,
      align: 'center'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      filters: [
        { text: 'Đang hoạt động', value: 'Active' },
        { text: 'Tạm ngưng', value: 'Tạm ngưng' },
        { text: 'Ngưng hoạt động', value: 'Inactive' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        let color = ''
        let text = status

        switch (status) {
          case 'Active':
            color = 'green'
            break
          case 'Tạm ngưng':
            color = 'orange'
            break
          case 'Inactive':
            color = 'red'
            break
          default:
            color = 'gray'
        }

        return (
          <Tag color={color} style={{ width: '100%', textAlign: 'center' }}>
            {getStatusLabel(text)}
          </Tag>
        )
      }
    },

    {
      title: 'Tùy chọn',
      key: 'actions',
      width: '10%',
      render: (_, record) => {
        const getStatusAction = () => {
          if (record.status === 'Active') {
            if (record.numberOfUsers > 0) {
              return {
                icon: <PauseOutlined />,
                text: 'Tạm ngưng',
                newStatus: 'Tạm ngưng',
                color: 'orange'
              }
            } else {
              return {
                icon: <StopOutlined />,
                text: 'Ngưng hoạt động',
                newStatus: 'Inactive',
                color: 'red'
              }
            }
          } else if (record.status === 'Tạm ngưng' || record.status === 'Inactive') {
            return {
              icon: <PoweroffOutlined />,
              text: 'Kích hoạt',
              newStatus: 'Active',
              color: 'green'
            }
          }

          return {
            icon: <QuestionOutlined />,
            text: 'Không xác định',
            newStatus: 'Active',
            color: 'gray'
          }
        }

        const statusAction = getStatusAction()

        return (
          <div className='flex gap-2'>
            <Tooltip title='Xem lịch sử mua'>
              <Button
                type='link'
                icon={<EyeFilled />}
                onClick={() => navigate(`/admin/subscription-packages/${record.subscriptionId}`)}
              />
            </Tooltip>

            <Tooltip title={statusAction.text}>
              <Button
                type='link'
                icon={statusAction.icon}
                style={{ color: statusAction.color }}
                onClick={() => handleChangeStatus(record.subscriptionId, record.name, statusAction.newStatus)}
              />
            </Tooltip>
          </div>
        )
      }
    }
  ]

  return (
    <Content style={{ padding: '24px' }}>
      <div className='flex justify-between items-center mb-5'>
        <Title level={2} style={{ color: '#FF1356', margin: 0 }}>
          Gói đăng ký
        </Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={showModal}
          style={{ background: '#FF1356', borderColor: '#FF1356' }}
        >
          Thêm gói
        </Button>
      </div>
      <Table
        columns={columns}
        rowKey={(record) => record.subscriptionId.toString()}
        dataSource={filteredData}
        pagination={pagination}
        loading={tableLoading}
        onChange={handleTableChange}
        bordered
        scroll={{ x: true }}
      />
      <Modal
        title='Thêm gói mới'
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText='Thêm'
        cancelText='Hủy'
        okButtonProps={{ style: { background: '#FF1356', borderColor: '#FF1356' } }}
      >
        <Form form={form} layout='vertical'>
          <Form.Item name='name' label='Tên gói' rules={[{ required: true, message: 'Vui lòng nhập tên gói' }]}>
            <Input placeholder='Nhập tên gói' />
          </Form.Item>

          <Form.Item name='description' label='Mô tả' rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
            <Input.TextArea rows={3} placeholder='Nhập mô tả gói' />
          </Form.Item>

          <Form.Item
            name='fee'
            label='Phí (VND)'
            rules={[
              { required: true, message: 'Vui lòng nhập phí' },
              { type: 'number', min: 1, message: 'Phí phải lớn hơn 0' }
            ]}
          >
            <InputNumber
              min={0}
              className='w-full'
              placeholder='Nhập phí'
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item
            name='validityPeriod'
            label='Thời hạn (ngày)'
            rules={[
              { required: true, message: 'Vui lòng nhập thời hạn' },
              { type: 'number', min: 1, message: 'Thời hạn phải lớn hơn 0' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item
            name='numberOfMeeting'
            label='Số buổi gặp'
            rules={[
              { required: true, message: 'Vui lòng nhập số buổi gặp' },
              { type: 'number', min: 1, message: 'Số buổi phải lớn hơn 0' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  )
}

export default SubscriptionPackagesPage
