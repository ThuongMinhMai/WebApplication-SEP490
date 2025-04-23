import {
  BookOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  LeftOutlined,
  PlusOutlined,
  RedoOutlined,
  RightOutlined,
  SearchOutlined
} from '@ant-design/icons'
import { Viewer, Worker } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import { AutoComplete, Button, Empty, Input, Modal, Select, Spin, Table, Tag, message } from 'antd'
import type { ColumnType } from 'antd/es/table'
import * as pdfjsLib from 'pdfjs-dist'
import 'pdfjs-dist/build/pdf.worker.entry'
import { useEffect, useState } from 'react'
import { EpubView } from 'react-reader'
import { useNavigate } from 'react-router-dom'
const { Option } = Select
interface Book {
  bookId: number
  accountId: number
  bookName: string
  bookUrl: string
  bookType: string
  author: string
  publishDate: string
  createdDate: string
  status: string
}

interface ApiResponse {
  status: number
  message: string
  data: Book[]
}

const statusColor: Record<string, string> = {
  Active: 'green',
  Inactive: 'orange',
  AdminDelete: 'red'
}

const statusText: Record<string, string> = {
  Active: 'Đang sử dụng',
  Inactive: 'Ngưng sử dụng',
  AdminDelete: 'Đã bị cấm'
}
interface EditBookForm {
  bookId: number
  bookName: string
  bookType: string
  publishDate: string
  author: string
}
interface BookTypeOption {
  value: string
  label: string
}

function ManageBook() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentBook, setCurrentBook] = useState<Book | null>(null)
  const [changeStatusLoading, setChangeStatusLoading] = useState(false)
  const [viewingBook, setViewingBook] = useState<Book | null>(null)
  const [epubLocation, setEpubLocation] = useState<string | number | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const navigate = useNavigate()
  const layoutPluginInstance = defaultLayoutPlugin()
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchedColumn] = useState('')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editForm, setEditForm] = useState<EditBookForm>({
    bookId: 0,
    bookName: '',
    bookType: '',
    publishDate: '',
    author: ''
  })

  const [editErrors, setEditErrors] = useState({
    bookName: '',
    bookType: '',
    author: ''
  })

  const [bookTypeOptions, setBookTypeOptions] = useState<BookTypeOption[]>([
    { value: 'Tiểu thuyết', label: 'Tiểu thuyết' },
    { value: 'Khoa học', label: 'Khoa học' },
    { value: 'Kinh tế', label: 'Kinh tế' },
    { value: 'Tâm lý', label: 'Tâm lý' },
    { value: 'Kỹ năng sống', label: 'Kỹ năng sống' },
    { value: 'Lịch sử', label: 'Lịch sử' },
    { value: 'Văn học', label: 'Văn học' },
    { value: 'Triết học', label: 'Triết học' },
    { value: 'Tôn giáo', label: 'Tôn giáo' },
    { value: 'Nuôi dạy con', label: 'Nuôi dạy con' },
    { value: 'Sức khỏe', label: 'Sức khỏe' },
    { value: 'Nghệ thuật', label: 'Nghệ thuật' },
    { value: 'Công nghệ', label: 'Công nghệ' },
    { value: 'Du lịch', label: 'Du lịch' },
    { value: 'Nấu ăn', label: 'Nấu ăn' },
    { value: 'Thể thao', label: 'Thể thao' },
    { value: 'Truyện tranh', label: 'Truyện tranh' },
    { value: 'Thơ ca', label: 'Thơ ca' },
    { value: 'Kinh doanh', label: 'Kinh doanh' },
    { value: 'Pháp luật', label: 'Pháp luật' }
  ])
  const [editLoading, setEditLoading] = useState(false)
  const getPdfCover = async (pdfUrl: string): Promise<string | null> => {
    try {
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise
      const page = await pdf.getPage(1)
      const scale = 1.5
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      if (!context) return null

      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({ canvasContext: context, viewport }).promise
      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error('Error generating cover:', error)
      return null
    }
  }
  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://api.diavan-valuation.asia/content-management/all-book')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()

      if (data.status === 1) {
        const booksWithCovers = await Promise.all(
          data.data.map(async (book) => {
            if (book.bookUrl.endsWith('.pdf')) {
              const cover = await getPdfCover(book.bookUrl)
              return { ...book, cover }
            }
            return book
          })
        )

        setBooks(booksWithCovers)
        // setBooks(data.data)
      } else {
        setError(data.message || 'Failed to fetch books')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchBooks()
  }, [])

  const handleStatusChange = (book: Book, status: string) => {
    setCurrentBook({ ...book, status })
  }

  const handleChangeStatusConfirm = async () => {
    if (!currentBook) return

    try {
      setChangeStatusLoading(true)
      const response = await fetch(
        `https://api.diavan-valuation.asia/content-management/book-status?bookId=${currentBook.bookId}&status=${currentBook.status}`,
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
        message.success('Cập nhật trạng thái sách thành công')
        setBooks(
          books.map((book) => (book.bookId === currentBook.bookId ? { ...book, status: currentBook.status } : book))
        )
      } else {
        message.error(data.data || 'Câp nhật trạng thái sách thất bại')
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setChangeStatusLoading(false)
      setCurrentBook(null)
    }
  }

  const handleChangeStatusCancel = () => {
    setCurrentBook(null)
  }

  const handleViewBook = (book: Book) => {
    setViewingBook(book)
    setEpubLocation(0)
    setCurrentPage(1)
  }

  const handleCloseViewer = () => {
    setViewingBook(null)
    setEpubLocation(null)
    setCurrentPage(1)
  }

  const handleNextPage = () => {
    if (viewingBook?.bookUrl.endsWith('.epub')) {
      setEpubLocation((prev) => (typeof prev === 'number' ? prev + 1 : prev))
    } else {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (viewingBook?.bookUrl.endsWith('.epub')) {
      setEpubLocation((prev) => (typeof prev === 'number' && prev > 0 ? prev - 1 : prev))
    } else {
      setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
    }
  }
  const handleOpenEditModal = (book: Book) => {
    setEditForm({
      bookId: book.bookId,
      bookName: book.bookName,
      bookType: book.bookType,
      publishDate: book.publishDate,
      author: book.author
    })
    setEditModalVisible(true)
  }
  const handleEditSubmit = async () => {
    const errors = {
      bookName: '',
      bookType: '',
      author: ''
    }

    if (!editForm.bookName.trim()) {
      errors.bookName = 'Vui lòng nhập tên sách'
    }
    if (!editForm.bookType.trim()) {
      errors.bookType = 'Vui lòng nhập loại sách'
    }
    if (!editForm.author.trim()) {
      errors.author = 'Vui lòng nhập tên tác giả'
    }

    setEditErrors(errors)
    if (errors.bookName || errors.bookType || errors.author) return
    try {
      setEditLoading(true)
      const response = await fetch('https://api.diavan-valuation.asia/content-management/book', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
          // Authorization: `Bearer ${localStorage.getItem('token')}` // Thêm token nếu cần
        },
        body: JSON.stringify(editForm)
      })

      const data = await response.json()

      if (data.status === 1) {
        message.success('Cập nhật sách thành công')
        setBooks(books.map((book) => (book.bookId === editForm.bookId ? { ...book, ...editForm } : book)))
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
  const getColumnSearchProps = (dataIndex: string, title: string) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Tìm kiếm ${title}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            type='primary'
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size='small'
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size='small' style={{ width: 90 }}>
            Đặt lại
          </Button>
        </div>
      </div>
    ),
    filterIcon: (filtered: any) => <SearchOutlined style={{ color: filtered ? '#FF1356' : undefined }} />,
    onFilter: (value: any, record: any) =>
      record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : ''
  })

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm()
    setSearchText(selectedKeys[0])
    setSearchedColumn(dataIndex)
  }

  const handleReset = (clearFilters: any) => {
    clearFilters()
    setSearchText('')
  }

  const columns: ColumnType<Book>[] = [
    {
      title: 'Ảnh bìa',
      dataIndex: 'cover',
      key: 'cover',
      render: (cover: string, record: Book) =>
        cover ? <img src={cover} alt={record.bookName} className='w-16 h-24 object-cover' /> : <BookOutlined />
    },
    {
      title: 'Tên sách',
      dataIndex: 'bookName',
      key: 'bookName',
      ...getColumnSearchProps('bookName', 'tên sách'),
      sorter: (a: any, b: any) => a.bookName.localeCompare(b.bookName),
      sortDirections: ['ascend', 'descend'] as const,
      render: (text: string, record: Book) => (
        <div className='flex items-center'>
          <p className='font-bold'>{text}</p>
        </div>
      )
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
      ...getColumnSearchProps('author', 'tác giả'),
      sorter: (a: any, b: any) => a.author.localeCompare(b.author),
      sortDirections: ['ascend', 'descend'] as const
    },
    {
      title: 'Thể loại',
      dataIndex: 'bookType',
      key: 'bookType',
      ...getColumnSearchProps('bookType', 'thể loại'),
      sorter: (a: any, b: any) => a.bookType.localeCompare(b.bookType),
      sortDirections: ['ascend', 'descend'] as const,
      filters: [
        { text: 'Tiểu thuyết', value: 'Tiểu thuyết' },
        { text: 'Khoa học', value: 'Khoa học' }
      ],
      onFilter: (value: any, record: any) => record.bookType.includes(value as string)
    },
    {
      title: 'Ngày xuất bản',
      dataIndex: 'publishDate',
      key: 'publishDate',
      sorter: (a: any, b: any) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime(),
      sortDirections: ['ascend', 'descend'] as const,
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Đang sử dụng', value: 'Active' },
        { text: 'Ngưng sử dụng', value: 'Inactive' },
        { text: 'Đã bị cấm', value: 'AdminDelete' }
      ],
      onFilter: (value: any, record: any) => record.status === value,
      //   render: (status: string) => <Tag color={statusColor[status] || 'default'}>{statusText[status] || status}</Tag>
      render: (status: string, record: Book) => {
        if (status === 'AdminDelete') {
          return <Tag color={statusColor[status] || 'default'}>{statusText[status] || status}</Tag>
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
      title: 'Tùy chọn',
      key: 'action',
      render: (_: any, record: Book) => (
        <div className='flex space-x-2'>
          <Button icon={<EyeOutlined />} onClick={() => handleViewBook(record)}>
            Xem
          </Button>
          {record.status != 'AdminDelete' && (
            <Button icon={<EditOutlined />} onClick={() => handleOpenEditModal(record)}>
              Chỉnh sửa
            </Button>
          )}
        </div>
      )
    }
  ]
  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Spin size='large' tip='Đang tải sách ...' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Empty description={<span className='text-red-500'>{error}</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold text-center text-[#FF1356] mb-8'>Danh sách sách</h1>
      <div className='flex justify-between items-center mb-5'>
        <Button type='text' icon={<RedoOutlined />} onClick={fetchBooks} className='flex items-center'>
          Tải lại
        </Button>
        <Button
          type='primary'
          className='bg-[#FF1356] border-[#FF1356] font-bold hover:bg-[#FF1356] hover:border-[#FF1356]'
          onClick={() => navigate(`/content-provider/books/add`)}
          icon={<PlusOutlined />}
        >
          Thêm sách
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={books}
        rowKey='bookId'
        scroll={{ x: true }}
        locale={{
          emptyText: <Empty description='Không có sách nào' />
        }}
      />

      <Modal
        title={viewingBook?.bookName}
        open={!!viewingBook}
        onCancel={handleCloseViewer}
        width='90%'
        footer={null}
        centered
        closable={false}
        bodyStyle={{ padding: 0 }}
      >
        {viewingBook?.bookUrl.endsWith('.epub') && (
          <div className='relative h-[80vh]'>
            <EpubView url={viewingBook.bookUrl} location={epubLocation} locationChanged={setEpubLocation} />
            <div className='absolute bottom-4 left-4 flex space-x-2'>
              <Button icon={<LeftOutlined />} onClick={handlePrevPage} disabled={epubLocation === 0} />
              <Button icon={<RightOutlined />} onClick={handleNextPage} />
            </div>
          </div>
        )}

        {viewingBook?.bookUrl.endsWith('.pdf') && (
          <div className='relative h-[86vh] bg-gray-900'>
            <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'>
              <Viewer fileUrl={viewingBook.bookUrl} plugins={[layoutPluginInstance]} />
            </Worker>
          </div>
        )}
      </Modal>

      <Modal
        title={
          <>
            <ExclamationCircleOutlined className='text-yellow-500 mr-2' />
            Xác nhận thay đổi trạng thái
          </>
        }
        open={!!currentBook}
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
        {currentBook &&
          (currentBook.status === 'Inactive' ? (
            <p>
              Bạn có chắc chắn muốn ngưng sử dụng sách <strong>{currentBook.bookName}</strong>? Hành động này sẽ khiến
              sách không khả dụng với tất cả người dùng.
            </p>
          ) : (
            <p>
              Bạn có chắc chắn muốn kích hoạt sách <strong>{currentBook.bookName}</strong>? Hành động này sẽ khiến sách
              khả dụng với tất cả người dùng.
            </p>
          ))}
      </Modal>
      <Modal
        title='Chỉnh sửa thông tin sách'
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
            <label className='block mb-1 font-medium'>Tên sách</label>
            <Input value={editForm.bookName} onChange={(e) => setEditForm({ ...editForm, bookName: e.target.value })} />
            {editErrors.bookName && <div className='text-red-500 text-sm mt-1'>{editErrors.bookName}</div>}
          </div>

          <div>
            <label className='block mb-1 font-medium'>Tác giả</label>
            <Input value={editForm.author} onChange={(e) => setEditForm({ ...editForm, author: e.target.value })} />
            {editErrors.author && <div className='text-red-500 text-sm mt-1'>{editErrors.author}</div>}
          </div>

          <div>
            <label className='block mb-1 font-medium'>Thể loại</label>
            <AutoComplete
              className='w-full'
              value={editForm.bookType}
              onChange={(value) => setEditForm({ ...editForm, bookType: value })}
              options={bookTypeOptions}
              filterOption={(inputValue, option) =>
                option!.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
              onSelect={(value) => {
                setEditForm({ ...editForm, bookType: value })
              }}
              placeholder='Nhập thể loại sách'
              allowClear
            />
            {editErrors.bookType && <div className='text-red-500 text-sm mt-1'>{editErrors.bookType}</div>}
          </div>
          <div>
            <label className='block mb-1 font-medium'>Ngày xuất bản</label>
            <Input
              type='date'
              value={editForm.publishDate.split('T')[0]}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  publishDate: e.target.value ? `${e.target.value}T00:00:00.000Z` : ''
                })
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ManageBook
