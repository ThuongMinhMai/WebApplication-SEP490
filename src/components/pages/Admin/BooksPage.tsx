import {
  BookOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  LeftOutlined,
  RedoOutlined,
  RightOutlined,
  SearchOutlined,
  StopOutlined
} from '@ant-design/icons'
import { Button, Empty, Input, Modal, Spin, Table, Tag, message } from 'antd'
import type { ColumnType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { EpubView } from 'react-reader'

import { Viewer, Worker } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import * as pdfjsLib from 'pdfjs-dist'
import 'pdfjs-dist/build/pdf.worker.entry'
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

function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [banningBook, setBanningBook] = useState<Book | null>(null)
  const [banLoading, setBanLoading] = useState(false)
  const [viewingBook, setViewingBook] = useState<Book | null>(null)
  const [epubLocation, setEpubLocation] = useState<string | number | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const layoutPluginInstance = defaultLayoutPlugin()
  const [searchText, setSearchText] = useState('')
  const [searchedColumn, setSearchedColumn] = useState('')
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

  const handleBanBook = (book: Book) => {
    setBanningBook(book)
  }

  const handleBanConfirm = async () => {
    if (!banningBook) return

    try {
      setBanLoading(true)
      const response = await fetch(
        `https://api.diavan-valuation.asia/content-management/book-by-admin?bookId=${banningBook.bookId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'AdminDelete'
          })
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 1) {
        message.success('Cấm sách thành công')
        setBooks(books.map((book) => (book.bookId === banningBook.bookId ? { ...book, status: 'AdminDelete' } : book)))
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setBanLoading(false)
      setBanningBook(null)
    }
  }

  const handleBanCancel = () => {
    setBanningBook(null)
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
      render: (status: string) => <Tag color={statusColor[status] || 'default'}>{statusText[status] || status}</Tag>
    },
    {
      title: 'Tùy chọn',
      key: 'action',
      render: (_: any, record: Book) => (
        <div className='flex space-x-2'>
          <Button icon={<EyeOutlined />} onClick={() => handleViewBook(record)}>
            Xem
          </Button>
          {record.status === 'Active' && (
            <Button danger onClick={() => handleBanBook(record)}>
              <StopOutlined />
              Cấm
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
      <Button type='text' icon={<RedoOutlined />} onClick={fetchBooks} className='flex items-center'>
        Tải lại
      </Button>

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
        // closable={false}
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
            {/* <div className='absolute bottom-4 left-4 flex space-x-2'>
              <Button icon={<LeftOutlined />} onClick={handlePrevPage} disabled={currentPage === 1} />
              <Button icon={<RightOutlined />} onClick={handleNextPage} />
            </div> */}
          </div>
        )}
      </Modal>

      <Modal
        title={
          <>
            <ExclamationCircleOutlined className='text-yellow-500 mr-2' /> Xác nhận cấm sách
          </>
        }
        open={!!banningBook}
        onOk={handleBanConfirm}
        onCancel={handleBanCancel}
        confirmLoading={banLoading}
        okText='Xác nhận cấm'
        cancelText='Hủy'
        okButtonProps={{ danger: true }}
      >
        {banningBook && (
          <p>
            Bạn có chắc chắn muốn cấm sách <strong>"{banningBook.bookName}"</strong>? Hành động này sẽ khiến sách không
            khả dụng với tất cả người dùng.
          </p>
        )}
      </Modal>
    </div>
  )
}

export default BooksPage
