import { MoreOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Card, Image, Input, InputRef, Modal, TablePaginationConfig, Tag, Typography } from 'antd'
import { Content } from 'antd/es/layout/layout'
import Table, { ColumnType } from 'antd/es/table'
import axios from 'axios'
import Map, { Marker } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef, useState } from 'react'

const { Text } = Typography

interface EmergencyInformation {
  emergencyInformationId: number
  frontCameraImage: string
  rearCameraImage: string
  longitude: string
  latitude: string
  longitudeIot: string | null
  latitudeIot: string | null
  informationDate: string
  informationTime: string
  status: string
}

interface EmergencyContact {
  accountId: number
  fullName: string
  phoneNumber: string
}

interface HistoryEmergencyAlertProps {
  emergencyConfirmationId: number
  elderlyId: number
  elderlyName: string
  confirmationAccountName: string
  emergencyDate: string
  emergencyTime: string
  emergencyDateTime: string
  confirmationDate: string | null
  isConfirmed: boolean
  emergencyInformations: EmergencyInformation[]
  emergencyContacts: EmergencyContact[]
}

function HistoryEmergencyAlert() {
  const [data, setData] = useState<HistoryEmergencyAlertProps[]>([])
  const [filteredData, setFilteredData] = useState<HistoryEmergencyAlertProps[]>([])
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100']
  })
  const [tableLoading, setTableLoading] = useState(false)
  const searchInput = useRef<InputRef>(null)
  const [selectedEmergency, setSelectedEmergency] = useState<HistoryEmergencyAlertProps | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [imageModalVisible, setImageModalVisible] = useState(false)
  const [selectedMarkerInfo, setSelectedMarkerInfo] = useState<EmergencyInformation | null>(null)

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize])

  const fetchData = async () => {
    setTableLoading(true)
    try {
      const response = await axios.get('https://api.diavan-valuation.asia/emergency-contacts')
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

  const getColumnSearchProps = (
    dataIndex: keyof HistoryEmergencyAlertProps
  ): ColumnType<HistoryEmergencyAlertProps> => ({
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

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: keyof HistoryEmergencyAlertProps) => {
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
        const aValue = a[sorter.field as keyof HistoryEmergencyAlertProps]
        const bValue = b[sorter.field as keyof HistoryEmergencyAlertProps]

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

  const DetailModal = () => {
    if (!selectedEmergency) return null
    const date = new Date(selectedEmergency.confirmationDate !== null ? selectedEmergency.confirmationDate : new Date())
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return (
      <Modal
        title={`Thông tin khẩn cấp chi tiết - ${selectedEmergency.elderlyName}`}
        style={{ fontSize: '30px' }}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width='80%'
        footer={null}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className='flex flex-col'>
            <Text type='secondary'>{`Trạng thái: ${selectedEmergency.isConfirmed ? 'Đã xác nhận hỗ trợ' : 'Đang chờ hỗ trợ'}`}</Text>
            <Text type='secondary'>{`Ngày gửi tín hiệu: ${selectedEmergency.emergencyTime}  ${selectedEmergency.emergencyDate}`}</Text>
            <Text type='secondary'>{`Ngày xác nhận hỗ trợ: ${selectedEmergency.confirmationDate != null ? `${hours}:${minutes} ${day}-${month}-${year}` : 'Chưa xác định'}   `}</Text>
            <Text type='secondary'>{`Người hỗ trợ: ${selectedEmergency.confirmationAccountName != '' ? selectedEmergency.confirmationAccountName : 'Chưa xác định'}   `}</Text>
          </div>
          {/* Emergency Information Section */}
          <Card title='Thông tin khẩn cấp'>
            {selectedEmergency.emergencyInformations.length === 0 ? (
              <Text type='secondary'>Không có thông tin hỗ trợ khẩn cấp</Text>
            ) : (
              <>
                <Map
                  initialViewState={{
                    latitude: parseFloat(selectedEmergency.emergencyInformations[0].latitude),
                    longitude: parseFloat(selectedEmergency.emergencyInformations[0].longitude),
                    zoom: 14
                  }}
                  style={{ width: '100%', height: '500px' }}
                  mapStyle='https://api.maptiler.com/maps/streets/style.json?key=RL6l0LZpLevsKU7Cg5fp'
                >
                  {selectedEmergency.emergencyInformations.map((info, index) => (
                    <Marker
                      longitude={parseFloat(info.longitude)}
                      latitude={parseFloat(info.latitude)}
                      anchor='bottom'
                      color='red'
                    >
                      <div
                        onClick={() => {
                          setSelectedMarkerInfo(info)
                          setImageModalVisible(true)
                        }}
                        style={{
                          position: 'relative',
                          textAlign: 'center'
                        }}
                      >
                        <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white p-1 rounded shadow-md font-bold whitespace-nowrap'>
                          Địa điểm {index + 1}
                        </div>

                        <div className='w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-md' />
                      </div>
                    </Marker>
                  ))}
                </Map>
                <Modal
                  title='Hình ảnh khẩn cấp'
                  open={imageModalVisible}
                  onCancel={() => setImageModalVisible(false)}
                  footer={null}
                  width={800}
                >
                  {selectedMarkerInfo && (
                    <div className='flex gap-4'>
                      <div>
                        <h4 className='font-bold mb-2'>Camera trước</h4>
                        <Image
                          width='100%'
                          src={selectedMarkerInfo.frontCameraImage}
                          fallback='https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'
                        />
                      </div>
                      <div>
                        <h4 className='font-bold mb-2'>Camera sau</h4>
                        <Image
                          width='100%'
                          src={selectedMarkerInfo.rearCameraImage}
                          fallback='https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'
                        />
                      </div>
                    </div>
                  )}
                </Modal>
              </>
            )}
          </Card>

          <Card title='Thông tin liên hệ'>
            {selectedEmergency.emergencyContacts.length > 0 ? (
              <Table
                dataSource={selectedEmergency.emergencyContacts}
                rowKey='accountId'
                pagination={false}
                columns={[
                  {
                    title: 'Tên',
                    dataIndex: 'fullName',
                    key: 'fullName'
                  },
                  {
                    title: 'Số điện thoại',
                    dataIndex: 'phoneNumber',
                    key: 'phoneNumber'
                  }
                ]}
              />
            ) : (
              <Text type='secondary'>No emergency contacts available</Text>
            )}
          </Card>
        </div>
      </Modal>
    )
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

  const columns: ColumnType<HistoryEmergencyAlertProps>[] = [
    {
      title: 'STT',
      key: 'stt',
      width: '5%',
      render: (_, __, index) => {
        return (pagination.current! - 1) * pagination.pageSize! + index + 1
      }
    },
    {
      title: 'Tên người gửi',
      dataIndex: 'elderlyName',
      key: 'elderlyName',
      width: '15%',
      sorter: (a, b) => a.elderlyName.localeCompare(b.elderlyName),
      ...getColumnSearchProps('elderlyName'),
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Tên người xác nhận',
      dataIndex: 'confirmationAccountName',
      key: 'confirmationAccountName',
      width: '20%',
      sorter: (a, b) => a.elderlyName.localeCompare(b.elderlyName),
      ...getColumnSearchProps('elderlyName'),
      render: (text: string) =>
        text != '' ? <Text type='secondary'>{text}</Text> : <Text type='secondary'>Chưa xác nhận</Text>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isConfirmed',
      key: 'isConfirmed',
      width: '5%',
      filters: [
        { text: 'Đã xác nhận', value: true },
        { text: 'Chưa xác nhận', value: false }
      ],
      onFilter: (value, record) => record.isConfirmed === value,
      render: (isConfirmed: boolean) => (
        <Tag color={isConfirmed ? 'green' : 'orange'}>{isConfirmed ? 'Đã xác nhận' : 'Chưa xác nhận'}</Tag>
      )
    },
    {
      title: 'Thời gian gửi tín hiệu',
      dataIndex: 'emergencyDateTime',
      key: 'emergencyDateTime',
      width: '8%',
      sorter: (a, b) => {
        const dateA = new Date(a.emergencyDateTime)
        const dateB = new Date(b.emergencyDateTime)
        return dateA.getTime() - dateB.getTime()
      },
      render: (emergencyDateTime: string) => {
        const date = new Date(emergencyDateTime)
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()

        return <Text type='secondary'>{`${hours}:${minutes} ${day}-${month}-${year}`}</Text>
      }
    },
    {
      title: 'Thời gian hỗ trợ',
      dataIndex: 'confirmationDate',
      key: 'confirmationDate',
      width: '8%',
      sorter: (a, b) => {
        // Handle null values in sorting
        if (!a.confirmationDate && !b.confirmationDate) return 0
        if (!a.confirmationDate) return 1 // nulls last
        if (!b.confirmationDate) return -1 // nulls last

        const dateA = new Date(a.confirmationDate.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3'))
        const dateB = new Date(b.confirmationDate.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3'))
        return dateA.getTime() - dateB.getTime()
      },
      render: (confirmationDate: string | null) => {
        if (!confirmationDate) {
          return <Text type='secondary'>Chưa xác nhận</Text>
        }

        // Format from "19-03-2025 14:08" to "14:08 19/03/2025"
        const [datePart, timePart] = confirmationDate.split(' ')
        const [day, month, year] = datePart.split('-')
        return (
          <Text type='secondary'>
            {timePart} {day}/{month}/{year}
          </Text>
        )
      }
    },
    {
      title: 'Chi tiết',
      key: 'action',
      width: '2%',
      render: (_, record) => (
        <Button
          type='text'
          icon={<MoreOutlined />}
          onClick={() => {
            setSelectedEmergency(record)
            setIsDetailModalOpen(true)
          }}
          style={{ color: '#FF1356' }}
        />
      )
    }
  ]

  return (
    <Content style={{ padding: '50px 50px' }}>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-2xl font-bold text-[#FF1356] m-0'>Danh sách báo cáo</h2>
      </div>
      <Table
        columns={columns}
        rowKey={(record) => record.emergencyConfirmationId.toString()}
        dataSource={filteredData}
        pagination={pagination}
        loading={tableLoading}
        onChange={handleTableChange}
        components={components}
        bordered
      />
      <DetailModal />
    </Content>
  )
}

export default HistoryEmergencyAlert
