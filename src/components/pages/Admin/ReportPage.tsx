import { SearchOutlined } from '@ant-design/icons'
import { Button, Image, Input, InputRef, message, Modal, Select, TablePaginationConfig, Tag } from 'antd'
import Table, { ColumnType } from 'antd/es/table'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { Content } from 'antd/es/layout/layout'

interface ReportPageProps {
  reportId: number
  accountId: number
  fullName: string
  phoneNumber: string
  reportTitle: string
  reportContent: string
  attachmentUrl: string
  reportType: string
  status: string
  createdAt: string
}

function ReportPage() {
  const [data, setData] = useState<ReportPageProps[]>([])
  const [filteredData, setFilteredData] = useState<ReportPageProps[]>([])
  const { Option } = Select
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100']
  })
  const [tableLoading, setTableLoading] = useState(false)
  const searchInput = useRef<InputRef>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<{ id: number; newStatus: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize])

  const fetchData = async () => {
    setTableLoading(true)
    try {
      const response = await axios.get('https://api.diavan-valuation.asia/api/Report')
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
      setTableLoading(false)
    }
  }

  const handleStatusChange = (reportId: number, newStatus: string) => {
    setCurrentAccount({ id: reportId, newStatus })
    setIsModalOpen(true)
  }

  const handleConfirmStatusChange = async () => {
    if (!currentAccount) return

    try {
      const response = await axios.put(`https://api.diavan-valuation.asia/api/Report/update/${currentAccount.id}`)

      const result = await response.data

      if (result.status === 1) {
        // Giả sử status 1 là thành công
        // Cập nhật lại dữ liệu
        const updatedData = data.map((item) =>
          item.reportId === currentAccount.id ? { ...item, status: currentAccount.newStatus } : item
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

  const getColumnSearchProps = (dataIndex: keyof ReportPageProps): ColumnType<ReportPageProps> => ({
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

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: keyof ReportPageProps) => {
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

  const handleTableChange = (newPagination: TablePaginationConfig, sorter: any) => {
    let sortedData = [...filteredData]
    if (sorter.field) {
      sortedData = sortedData.sort((a, b) => {
        const aValue = a[sorter.field as keyof ReportPageProps]
        const bValue = b[sorter.field as keyof ReportPageProps]

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sorter.order === 'ascend' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }
        return 0
      })
    }

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
            // backgroundColor: '#fff0f5',
            color: '#FF1356'
          }}
        />
      )
    }
  }

  const getGenderLabel = (gender: string) => {
    return gender === 'string' ? 'Khác' : 'Này'
  }

  const columns: ColumnType<ReportPageProps>[] = [
    {
      title: 'STT',
      key: 'stt',
      width: '5%',
      render: (_, __, index) => {
        return (pagination.current! - 1) * pagination.pageSize! + index + 1
      }
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'reportTitle',
      key: 'reportTitle',
      width: '10%',
      sorter: (a, b) => a.reportTitle.localeCompare(b.reportTitle),
      ...getColumnSearchProps('reportTitle'),
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Nội dung báo cáo',
      dataIndex: 'reportContent',
      key: 'reportContent',
      width: '15%',
      sorter: (a, b) => a.reportContent.localeCompare(b.reportContent),
      ...getColumnSearchProps('reportContent'),
      render: (text: string) => <div>{text}</div>
    },
    {
      title: 'Tên người báo cáo',
      dataIndex: 'fullName',
      key: 'fullName',
      width: '12%',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      ...getColumnSearchProps('fullName'),
      render: (text: string) => <div>{text}</div>
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: '10%',
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
      ...getColumnSearchProps('phoneNumber'),
      render: (text: string) => <div>{text}</div>
    },
    {
      title: 'Ảnh báo cáo',
      dataIndex: 'attachmentUrl',
      key: 'attachmentUrl',
      width: '10%',
      render: (attachmentUrl: string, record: ReportPageProps) => (
        <ImageCell attachmentUrl={attachmentUrl} reportTitle={record.reportTitle} />
      )
    },
    {
      title: 'Loại báo cáo',
      dataIndex: 'reportType',
      key: 'reportType',
      width: '10%',

      filters: [{ text: 'Khác', value: 'string' }],
      onFilter: (value, record) => record.reportType === value,
      render: (gender: string) => <Tag color={gender === 'string' ? 'blue' : 'pink'}>{gender == 'string' ? 'Khác' : gender}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      filters: [
        { text: 'Đã xử lí', value: 'Đã xử lí' },
        { text: 'Đang chờ xử lí', value: 'Đang chờ xử lí' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string, record: ReportPageProps) => (
        <>
          <Select
            value={status}
            disabled={status == 'Đã xử lí'}
            style={{ width: '100%' }}
            onChange={() => handleStatusChange(record.reportId, 'Đã xử lí')}
          >
            <Option value='Đã xử lí'>
              <Tag color='green' style={{ width: '90%' }}>
                Đã xử lí
              </Tag>
            </Option>
            <Option value='Đang chờ xử lí'>
              <Tag color='red' style={{ width: '90%' }}>
                Đang chờ xử lí
              </Tag>
            </Option>
          </Select>
        </>
      )
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '25%',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (text: string) => <div>{format(new Date(text), 'HH:mm:ss dd/MM/yyyy')}</div>
    }
  ]

  const ImageCell = ({ attachmentUrl, reportTitle }: { attachmentUrl: string; reportTitle: string }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
      <>
        {attachmentUrl && attachmentUrl !== 'string' ? (
          <>
            <Image
              width={50}
              height={50}
              src={attachmentUrl}
              alt={`Ảnh báo cáo ${reportTitle}`}
              preview={{
                visible: false // Disable default preview
              }}
              onClick={() => setIsModalOpen(true)}
              style={{
                borderRadius: '4px',
                objectFit: 'cover',
                cursor: 'pointer'
              }}
            />
            <Modal
              title={`Ảnh báo cáo: ${reportTitle}`}
              open={isModalOpen}
              onCancel={() => setIsModalOpen(false)}
              footer={null}
              width='80%'
              styles={{
                body: {
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 0
                }
              }}
            >
              <img
                src={attachmentUrl}
                alt={`Ảnh báo cáo ${reportTitle}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain'
                }}
              />
            </Modal>
          </>
        ) : (
          <div>Không có ảnh</div>
        )}
      </>
    )
  }

  return (
    <Content style={{ padding: '50px 50px' }}>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold text-[#FF1356] m-0'>Danh sách báo cáo</h2>
      </div>
      <Table
        columns={columns}
        rowKey={(record) => record.reportId.toString()}
        dataSource={filteredData}
        pagination={pagination}
        loading={tableLoading}
        onChange={handleTableChange}
        components={components}
        bordered
      />
      <Modal
        title='Xác nhận thay đổi trạng thái'
        open={isModalOpen}
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
        <p>
          Bạn có chắc chắn rằng báo cáo này đã được xử lí thành công? Khi báo cáo được xử lí, nó sẽ không thể đổi trạng
          lại về lại đang chờ xử lí
        </p>
      </Modal>
    </Content>
  )
}

export default ReportPage
