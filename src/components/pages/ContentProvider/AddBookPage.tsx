import React, { useState } from 'react'
import { Button, Form, Input, Select, DatePicker, Upload, message, Modal, Spin, AutoComplete, Row, Col } from 'antd'
import { UploadOutlined, ExclamationCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { UploadFile } from 'antd/es/upload/interface'
import dayjs from 'dayjs'
import * as pdfjsLib from 'pdfjs-dist'
import 'pdfjs-dist/build/pdf.worker.entry'
import { useAuth } from '@/contexts/AuthContext'
const { Option } = Select
const { confirm } = Modal

const bookTypeOptions = [
  'Tiểu thuyết',
  'Khoa học',
  'Kỹ năng sống',
  'Tâm lý học',
  'Kinh tế',
  'Lịch sử',
  'Văn học',
  'Triết học',
  'Tôn giáo',
  'Nuôi dạy con',
  'Sức khỏe',
  'Nghệ thuật',
  'Công nghệ',
  'Du lịch',
  'Nấu ăn',
  'Thể thao',
  'Truyện tranh',
  'Thơ ca',
  'Kinh doanh',
  'Pháp luật',
  'Khác' // Luôn để "Khác" ở cuối
]
interface BookFormValues {
  bookName: string
  bookType: string
  publishDate: dayjs.Dayjs
  author: string
  bookFile: UploadFile[]
}

const AddBookPage: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [addloading, setAddLoading] = useState(false)
  const { user } = useAuth()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)
  const beforeUpload = (file: File) => {
    const isPdf = file.type === 'application/pdf'
    if (!isPdf) {
      message.error('Chỉ chấp nhận file PDF!')
    }
    return isPdf || Upload.LIST_IGNORE
  }

  // const handleUploadChange = ({ fileList }: { fileList: UploadFile[] }) => {
  //   setFileList(fileList)
  // }
  const handleUploadChange = async ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList)

    if (fileList.length > 0 && fileList[0].originFileObj) {
      try {
        const preview = await generatePdfPreview(fileList[0].originFileObj)
        setPdfPreview(preview)
      } catch (error) {
        console.error('Error generating PDF preview:', error)
        setPdfPreview(null)
      }
    } else {
      setPdfPreview(null)
    }
  }

  const generatePdfPreview = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()

      fileReader.onload = async () => {
        try {
          const typedArray = new Uint8Array(fileReader.result as ArrayBuffer)

          // Load PDF
          const pdf = await pdfjsLib.getDocument(typedArray).promise

          // Get first page
          const page = await pdf.getPage(1)
          const viewport = page.getViewport({ scale: 1.0 })

          // Prepare canvas
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          if (!context) {
            throw new Error('Could not get canvas context')
          }

          canvas.height = viewport.height
          canvas.width = viewport.width

          // Render PDF page to canvas
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise

          // Convert canvas to data URL
          resolve(canvas.toDataURL('image/jpeg', 0.8))
        } catch (error) {
          reject(error)
        }
      }

      fileReader.onerror = reject
      fileReader.readAsArrayBuffer(file)
    })
  }
  const onFinish = async (values: BookFormValues) => {
    confirm({
      title: 'Xác nhận thêm sách',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn thêm sách này?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: {
        style: {
          backgroundColor: '#FF1356',
          borderColor: '#FF1356'
        },
        loading: addloading
      },

      async onOk() {
        try {
          setAddLoading(true)

          const formData = new FormData()
          if (fileList.length > 0 && fileList[0].originFileObj) {
            formData.append('BookFile', fileList[0].originFileObj)
          }

          const params = new URLSearchParams({
            AccountId: user!.accountId.toString(),
            BookName: values.bookName,
            BookType: values.bookType,
            PublishDate: values.publishDate.toISOString(),
            Author: values.author
          })

          const response = await fetch(
            `https://api.diavan-valuation.asia/content-management/book?${params.toString()}`,
            {
              method: 'POST',
              headers: {
                accept: '*/*'
              },
              body: formData
            }
          )

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()

          if (data.status === 1) {
            message.success('Thêm sách thành công')
            navigate('/content-provider/books')
          } else {
            message.error(data.message + data.data || 'Thêm sách thất bại')
          }
        } catch (error) {
          message.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
        } finally {
          setAddLoading(false)
        }
      }
    })
  }
  const BookTypeSelector: React.FC = () => {
    const [showCustomInput, setShowCustomInput] = useState(false)
    const [customType, setCustomType] = useState('')
    const [form] = Form.useForm()
    return (
      <Form.Item
        label='Thể loại'
        name='bookType'
        rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập thể loại!' }]}
      >
        {showCustomInput ? (
          <AutoComplete
            options={bookTypeOptions.filter((opt) => opt !== 'Khác').map((opt) => ({ value: opt }))}
            placeholder='Nhập thể loại sách'
            defaultActiveFirstOption={false}
            style={{ width: '100%' }}
            onChange={(value) => {
              setCustomType(value)
              form.setFieldsValue({ bookType: value })
            }}
            onBlur={() => {
              form.setFieldsValue({ bookType: customType })
            }}
            autoFocus
          />
        ) : (
          <Select
            placeholder='Chọn thể loại sách'
            onChange={(value) => {
              if (value === 'Khác') {
                setShowCustomInput(true)
                setCustomType('')
                form.setFieldsValue({ bookType: '' })
              } else {
                form.setFieldsValue({ bookType: value })
              }
            }}
            showSearch
            optionFilterProp='children'
            filterOption={(input, option) =>
              option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
            }
          >
            {bookTypeOptions.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        )}
      </Form.Item>
    )
  }

  return (
    <div className='p-6 bg-white rounded-lg '>
      <div className='flex justify-between items-center'>

      <h1 className='text-2xl font-bold text-[#FF1356] mb-6'>Thêm sách mới</h1>
      <Button
        type='primary'
        className='bg-[#FF1356] border-[#FF1356] font-bold hover:bg-pink-700 hover:border-pink-700'
        onClick={() => navigate(-1)}
        icon={<ArrowLeftOutlined />}
        >
        Quay lại
      </Button>
        </div>

      <Spin spinning={loading}>
        <Form form={form} layout='vertical' onFinish={onFinish} autoComplete='off'>
          <Row gutter={24}>
           

            <Col xs={24} md={8}>
              <Form.Item
                label='File sách (PDF)'
                name='bookFile'
                rules={[{ required: true, message: 'Vui lòng tải lên file sách!' }]}
              >
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-full'>
                  {fileList.length > 0 && (
                    <div className='my-4 w-full'>
                      {pdfPreview && (
                        <div className=' rounded-lg overflow-hidden'>
                          <img src={pdfPreview} alt='PDF preview' className='w-full h-auto max-h-64 object-contain' />
                          <p className='text-xs text-center text-gray-500 mt-3'>Xem trước trang đầu tiên</p>
                        </div>
                      )}
                      {/* <p className='font-medium text-sm mb-2'>File đã chọn: {fileList[0].name}</p> */}
                    </div>
                  )}
                  <Upload
                    accept='application/pdf'
                    beforeUpload={beforeUpload}
                    fileList={fileList}
                    onChange={handleUploadChange}
                    maxCount={1}
                    className='w-full text-center'
                  >
                    <Button icon={<UploadOutlined />} className='mb-2'>
                      Chọn file PDF
                    </Button>
                    <p className='text-sm text-gray-500'>Hoặc kéo thả file vào đây</p>
                  </Upload>
                </div>
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item
                label='Tên sách'
                name='bookName'
                rules={[{ required: true, message: 'Vui lòng nhập tên sách!' }]}
              >
                <Input placeholder='Nhập tên sách' />
              </Form.Item>

              <Form.Item
                label='Tác giả'
                name='author'
                rules={[{ required: true, message: 'Vui lòng nhập tên tác giả!' }]}
              >
                <Input placeholder='Nhập tên tác giả' />
              </Form.Item>

              <BookTypeSelector />
              <Form.Item
                label='Ngày xuất bản'
                name='publishDate'
                rules={[{ required: true, message: 'Vui lòng chọn ngày xuất bản!' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format='DD/MM/YYYY'
                  disabledDate={(current) => {
                    // Disable các ngày sau ngày hiện tại
                    return current && current > dayjs().endOf('day')
                  }}
                />
              </Form.Item>

              <Form.Item className='mt-8'>
                <div className='flex justify-end space-x-4'>
                  <Button onClick={() => navigate('/content-provider/books')}>Hủy</Button>
                  <Button
                    type='primary'
                    htmlType='submit'
                    className='bg-[#FF1356] border-[#FF1356] hover:bg-[#FF1356]/90 hover:border-[#FF1356]/90'
                  >
                    Thêm sách
                  </Button>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Spin>
    </div>
  )
}

export default AddBookPage
