import { useAuth } from '@/contexts/AuthContext'
import {
  CustomerServiceOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeFilled,
  PlusOutlined,
  RedoOutlined,
  SearchOutlined,
  UploadOutlined
} from '@ant-design/icons'
import type { InputRef } from 'antd'
import { Avatar, Button, Input, Layout, message, Modal, Select, Table, Tag, Upload } from 'antd'
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
interface AddPlaylistForm {
  playlistName: string
  playlistImage: File | null
}
const ManageMusicPage = () => {
  const { user } = useAuth()
  const [data, setData] = useState<Playlist[]>([])
  const [filteredData, setFilteredData] = useState<Playlist[]>([])
  const navigate = useNavigate()
  const [currentPlayList, setCurrentPlayList] = useState<Playlist | null>(null)
  const [changeStatusLoading, setChangeStatusLoading] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [addForm, setAddForm] = useState<AddPlaylistForm>({
    playlistName: '',
    playlistImage: null
  })
  const [addLoading, setAddLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({
    playlistName: ''
  })
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100']
  })
  const [tableLoading, setTableLoading] = useState(false)
  const searchInput = useRef<InputRef>(null)
  const [editForm, setEditForm] = useState<Playlist>({
    playlistId: 0,
    playlistName: '',
    imageUrl: '',
    numberOfContent: 0,
    status: ''
  })
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

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
      message.error('Failed to fetch playlists music')
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

        fetchData()
      } else {
        message.error(data.data || 'Cập nhật danh sách phát thất bại')
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

  const handleOpenAddModal = () => {
    setAddModalVisible(true)
    setAddForm({
      playlistName: '',
      playlistImage: null
    })
    setFormErrors({
      playlistName: ''
    })
  }

  const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target

    if (name === 'playlistImage' && files) {
      setAddForm({ ...addForm, playlistImage: files[0] })
    } else {
      setAddForm({ ...addForm, [name]: value })
    }
  }

  const handleAddSubmit = async () => {
    // Validate form
    if (!addForm.playlistName.trim()) {
      setFormErrors({
        playlistName: 'Vui lòng nhập tên danh sách phát'
      })
      return
    }
    console.log('add form ' + addForm.playlistImage)

    try {
      setAddLoading(true)
      const formData = new FormData()

      // Thêm các field vào formData
      // formData.append('PlaylistName', addForm.playlistName)
      if (addForm.playlistImage) {
        formData.append('PlaylistImage', addForm.playlistImage)
      }
      console.log('FormData contents:')
      for (const [key, value] of formData.entries()) {
        console.log(key, value)
      }

      const response = await fetch(
        `https://api.diavan-valuation.asia/content-management/playlist?AccountId=${user?.accountId}&PlaylistName=${addForm.playlistName}&IsLesson=false`,
        {
          method: 'POST',
          body: formData
        }
      )

      const data = await response.json()

      if (data.status === 1) {
        message.success('Thêm danh sách phát thành công')
        setAddModalVisible(false)
        setAddForm({
          playlistName: '',
          playlistImage: null
        })
        fetchData() // Refresh danh sách
      } else {
        message.error(data.data || 'Thêm danh sách phát thất bại')
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setAddLoading(false)
    }
  }

  const handleCloseAddModal = () => {
    // Giải phóng object URL nếu có
    if (addForm.playlistImage) {
      URL.revokeObjectURL(URL.createObjectURL(addForm.playlistImage))
    }

    // Reset form
    setAddForm({
      playlistName: '',
      playlistImage: null
    })
    setFormErrors({
      playlistName: ''
    })

    setAddModalVisible(false)
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

  const handleOpenEditModal = (playlist: Playlist) => {
    setEditForm({
      playlistId: playlist.playlistId,
      playlistName: playlist.playlistName,
      imageUrl: playlist.imageUrl,
      numberOfContent: playlist.numberOfContent,
      status: playlist.status
    })
    setEditModalVisible(true)
  }

  const handleEditSubmit = async () => {
    const errors = {
      playlistName: !editForm.playlistName.trim() ? 'Vui lòng nhập tên danh sách phát' : ''
      // ... các validation khác nếu có
    }

    setFormErrors(errors)

    // Nếu có lỗi thì dừng lại
    if (errors.playlistName) {
      return
    }
    try {
      setEditLoading(true)
      const response = await fetch('https://api.diavan-valuation.asia/content-management/playlist', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
          // Authorization: `Bearer ${localStorage.getItem('token')}` // Thêm token nếu cần
        },
        body: JSON.stringify({
          playlistId: editForm.playlistId,
          playlistName: editForm.playlistName
        })
      })

      const data = await response.json()

      if (data.status === 1) {
        message.success('Cập nhật sách thành công')
        fetchData()
        setEditModalVisible(false)
      } else {
        message.error(data.data || 'Cập nhật sách thất bại')
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setEditLoading(false)
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
          <CustomerServiceOutlined style={{ color: count > 0 ? '#52c41a' : '#faad14' }} />
          <Tag color={count > 0 ? 'green' : 'orange'}>
            {count} {count === 1 ? 'bài hát' : 'bài hát'}
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
              <Tag color='green' style={{ width: '90%' }}>
                Đang sử dụng
              </Tag>
            </Option>
            <Option value='Inactive'>
              <Tag color='red' style={{ width: '90%' }}>
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
        <div className='flex space-x-2'>
          <>
            <Button
              onClick={() =>
                navigate(
                  `/content-provider/musics/${record.playlistId}?playlistname=${record.playlistName}&image=${record.imageUrl}`
                )
              }
            >
              <EyeFilled /> Chi tiết
            </Button>
            {record.numberOfContent === 0 && (
              <Button icon={<EditOutlined />} onClick={() => handleOpenEditModal(record)}>
                Chỉnh sửa
              </Button>
            )}
          </>
        </div>
      )
    }
  ]

  return (
    <Content style={{ padding: '50px 50px' }}>
      <h1 className='text-3xl font-bold text-center text-[#FF1356] mb-8'>Danh sách phát nhạc</h1>
      <div className='flex justify-between items-center mb-5'>
        <Button type='text' icon={<RedoOutlined />} onClick={fetchData} className='flex items-center'>
          Tải lại
        </Button>
        <Button
          type='primary'
          className='bg-[#FF1356] border-[#FF1356] font-bold hover:bg-[#FF1356] hover:border-[#FF1356]'
          onClick={handleOpenAddModal}
          icon={<PlusOutlined />}
        >
          Thêm danh sách phát
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
              sẽ khiến tất cả bài hát trong danh sách phát không khả dụng với người dùng.
            </p>
          ) : (
            <p>
              Bạn có chắc chắn muốn sử dụng danh sách phát <strong>{currentPlayList.playlistName}</strong>? Hành động
              này sẽ khiến danh sách phát khả dụng với tất cả người dùng.
            </p>
          ))}
      </Modal>

      <Modal
        title='Thêm danh sách phát mới'
        open={addModalVisible}
        onOk={handleAddSubmit}
        onCancel={handleCloseAddModal} // Sử dụng hàm đóng mới
        destroyOnClose={true}
        okText='Thêm'
        cancelText='Hủy'
        confirmLoading={addLoading}
        okButtonProps={{
          style: {
            backgroundColor: '#FF1356',
            borderColor: '#FF1356'
          }
        }}
      >
        <div className='space-y-4'>
          <div>
            <label className='block mb-1 font-medium'>
              Tên danh sách phát <span className='text-red-500'>*</span>
            </label>
            <Input
              required
              name='playlistName'
              value={addForm.playlistName}
              onChange={handleAddFormChange}
              placeholder='Nhập tên danh sách phát'
            />
            {formErrors.playlistName && <div className='text-red-500 text-sm mt-1'>{formErrors.playlistName}</div>}
          </div>

          <div>
            <label className='block mb-1 font-medium'>Ảnh bìa</label>
            <Upload
              name='playlistImage'
              accept='image/*'
              beforeUpload={(file) => {
                console.log('Before upload:', file) // Thêm dòng này để kiểm tra
                const isLt5M = file.size / 1024 / 1024 < 5
                if (!isLt5M) {
                  message.error('Ảnh phải nhỏ hơn 5MB!')
                  return Upload.LIST_IGNORE
                }
                return false // Trả về false để ngăn upload tự động
              }}
              // onChange={(info) => {
              //   console.log('Upload onChange:', info) // Thêm log này
              //   if (info.file.originFileObj) {
              //     console.log('File selected:', info.file.originFileObj)
              //     setAddForm({ ...addForm, playlistImage: info.file.originFileObj || info.file })
              //   }
              // }}
              onChange={(info) => {
                console.log('Upload event details:', {
                  status: info.file.status,
                  name: info.file.name,
                  originFileObj: info.file.originFileObj,
                  file: info.file
                })

                // Cách 1: Lấy file từ info.file.originFileObj hoặc info.file
                const selectedFile = info.file.originFileObj || info.file

                if (selectedFile instanceof File) {
                  console.log('Selected file:', selectedFile)
                  setAddForm((prev) => ({
                    ...prev,
                    playlistImage: selectedFile
                  }))
                } else {
                  console.warn('No valid file object found:', selectedFile)
                }

                // Cách 2: Lấy từ fileList
                if (info.fileList.length > 0) {
                  const firstFile = info.fileList[0].originFileObj || info.fileList[0]
                  console.log('First file in list:', firstFile)
                }
              }}
              maxCount={1}
              listType='picture-card'
              showUploadList={{
                showRemoveIcon: true,
                removeIcon: <DeleteOutlined onClick={(e) => e.stopPropagation()} />
              }}
              onRemove={() => {
                setAddForm({ ...addForm, playlistImage: null })
                return false
              }}
            >
              {!addForm.playlistImage ? (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              ) : null}
            </Upload>
            {/* {addForm.playlistImage && (
              <img
                src={URL.createObjectURL(addForm.playlistImage)}
                alt='Preview'
                style={{ maxWidth: '100%', maxHeight: 200, marginTop: 8 }}
              />
            )} */}
            <p className='text-xs text-gray-500 mt-1'>Hỗ trợ: JPG, PNG, JPEG (tối đa 5MB)</p>
          </div>
        </div>
      </Modal>

      <Modal
        title='Chỉnh sửa thông tin danh sách phát'
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        okText='Lưu thay đổi'
        cancelText='Hủy'
        confirmLoading={editLoading}
        okButtonProps={{
          style: {
            backgroundColor: '#FF1356',
            borderColor: '#FF1356'
          }
        }}
      >
        <div className='space-y-4'>
          <div>
            <label className='block mb-1 font-medium'>Tên danh sách phát</label>
            <Input
              required
              value={editForm.playlistName}
              onChange={(e) => setEditForm({ ...editForm, playlistName: e.target.value })}
            />
            {formErrors.playlistName && <div className='text-red-500 text-sm mt-1'>{formErrors.playlistName}</div>}
          </div>
        </div>
      </Modal>
    </Content>
  )
}

export default ManageMusicPage
