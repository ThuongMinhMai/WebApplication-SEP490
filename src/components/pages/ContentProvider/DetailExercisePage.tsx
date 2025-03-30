import { useAuth } from '@/contexts/AuthContext'
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons'
import { Button, Card, Empty, Input, message, Modal, Select, Spin, Tag, Upload } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
const { Option } = Select

interface Lesson {
  lessonId: number
  playlistId: number
  accountId: number
  lessonName: string
  lessonUrl: string
  imageUrl: string | null
  createdDate: string
  status: string
}

interface ApiResponse {
  status: number
  message: string
  data: Lesson[]
}

const statusColor: Record<string, string> = {
  Active: 'green',
  Inactive: 'orange',
  AdminDelete: 'red'
}
interface AddVideoForm {
  lessonName: string
  lessonFile: File | null
  thumbnailImage: File | null
}
function DetailExercisePage() {
  const { user } = useAuth()
  const { id: playlistId } = useParams<{ id: string }>()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const playlistName = searchParams.get('playlistname')
  const [changeStatusLoading, setChangeStatusLoading] = useState(false)
  const [tempStatus, setTempStatus] = useState<Record<number, string>>({})
  const [videoModalVisible, setVideoModalVisible] = useState(false)
  const [videoForm, setVideoForm] = useState<AddVideoForm>({
    lessonName: '',
    lessonFile: null,
    thumbnailImage: null
  })
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoErrors, setVideoErrors] = useState({
    lessonName: '',
    lessonFile: ''
  })
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const fetchLessons = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.diavan-valuation.asia/content-management/all-lesson/${playlistId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()

      if (data.status === 1) {
        setLessons(data.data)
      } else {
        setError(data.message || 'Failed to fetch lessons')
        message.error(data.message || 'Failed to fetch lessons')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchLessons()
  }, [playlistId])

  const handleStatusChange = (lesson: Lesson, status: string) => {
    setTempStatus((prev) => ({ ...prev, [lesson.lessonId]: status }))
    setCurrentLesson({ ...lesson, status })
  }

  const handleChangeStatusConfirm = async () => {
    if (!currentLesson) return

    try {
      setChangeStatusLoading(true)
      const response = await fetch(
        `https://api.diavan-valuation.asia/content-management/lesson-status?lessonId=${currentLesson.lessonId}&status=${currentLesson.status}`,
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
        message.success('Đổi trạng thái bài học thành công')
        setLessons(
          lessons.map((lesson) =>
            lesson.lessonId === currentLesson.lessonId ? { ...lesson, status: currentLesson.status } : lesson
          )
        )
        // Clear temporary status after successful update
        setTempStatus((prev) => {
          const newStatus = { ...prev }
          delete newStatus[currentLesson.lessonId]
          return newStatus
        })
      } else {
        message.error(data.message || 'Lỗi đổi trạng thái bài học')
        // Revert temporary status on failure
        setTempStatus((prev) => {
          const newStatus = { ...prev }
          delete newStatus[currentLesson.lessonId]
          return newStatus
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      message.error(errorMessage)
      // Revert temporary status on error
      setTempStatus((prev) => {
        const newStatus = { ...prev }
        delete newStatus[currentLesson.lessonId]
        return newStatus
      })
    } finally {
      setChangeStatusLoading(false)
      setCurrentLesson(null)
    }
  }

  const handleChangeStatusCancel = () => {
    // Revert temporary status when cancel
    if (currentLesson) {
      setTempStatus((prev) => {
        const newStatus = { ...prev }
        delete newStatus[currentLesson.lessonId]
        return newStatus
      })
    }
    setCurrentLesson(null)
  }
  const handleAddVideoSubmit = async () => {
    // Validate form
    const errors = {
      lessonName: '',
      lessonFile: ''
    }

    if (!videoForm.lessonName.trim()) {
      errors.lessonName = 'Vui lòng nhập tên video'
    }

    if (!videoForm.lessonFile) {
      errors.lessonFile = 'Vui lòng chọn file video'
    }

    setVideoErrors(errors)
    if (errors.lessonName || errors.lessonFile) return

    try {
      setVideoLoading(true)
      const formData = new FormData()

      // Thêm các field vào formData
      formData.append('AccountId', user?.accountId.toString() || '0')
      formData.append('PlaylistId', playlistId!.toString())
      formData.append('LessonName', videoForm.lessonName)
      if (videoForm.lessonFile) {
        formData.append('LessonFile', videoForm.lessonFile)
      }
      if (videoForm.thumbnailImage) {
        formData.append('ThumbnailImage', videoForm.thumbnailImage)
      }

      const response = await fetch('https://api.diavan-valuation.asia/content-management/lesson', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      const result = await response.json()

      if (result.status === 1) {
        message.success('Thêm video thành công')
        setVideoModalVisible(false)
        fetchLessons() // Refresh danh sách
      } else {
        message.error(result.data || 'Thêm video thất bại')
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setVideoLoading(false)
    }
  }
  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Spin size='large' tip='Đang tải bài học...' />
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
      <div className='flex justify-between items-center'>
        <Button
          type='primary'
          className='bg-[#FF1356] border-[#FF1356] font-bold hover:bg-pink-700 hover:border-pink-700 mb-5'
          onClick={() => navigate(-1)}
          icon={<ArrowLeftOutlined />}
        >
          Quay lại
        </Button>
        <Button
          type='primary'
          className='bg-[#FF1356] border-[#FF1356] font-bold hover:bg-pink-700 hover:border-pink-700 mb-5'
          onClick={() => {
            setVideoForm({
              lessonName: '',
              lessonFile: null,
              thumbnailImage: null
            })
            setVideoModalVisible(true)

            setVideoErrors({
              lessonName: '',
              lessonFile: ''
            })

            // Quan trọng: Reset preview ảnh
            if (thumbnailPreview) {
              URL.revokeObjectURL(thumbnailPreview)
            }
            setThumbnailPreview(null)
          }}
          icon={<PlusOutlined />}
        >
          Thêm video
        </Button>
      </div>
      <h1 className='text-3xl font-bold text-center text-[#FF1356] mb-8'> {playlistName}</h1>

      {lessons.length === 0 ? (
        <div className='flex justify-center'>
          <Empty description='Không tìm thấy bài tập nào cho danh sách phát này' />
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {lessons.map((lesson) => (
            <Card
              key={lesson.lessonId}
              hoverable
              className='shadow-lg rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105'
              cover={
                <div className='relative pt-[56.25%] overflow-hidden'>
                  <video
                    controls
                    autoPlay={false}
                    className='absolute top-0 left-0 w-full h-full object-cover'
                    poster={lesson.imageUrl || undefined}
                  >
                    <source src={lesson.lessonUrl} type='video/mp4' />
                    Your browser does not support the video tag.
                  </video>
                </div>
              }
              actions={[
                <div className='flex justify-between items-center px-4 py-2'>
                  <span className='text-gray-500'>
                    <ClockCircleOutlined className='mr-1' />
                    {new Date(lesson.createdDate).toLocaleDateString()}
                  </span>
                  {lesson.status === 'AdminDelete' ? (
                    <Tag color={statusColor[lesson.status] || 'default'}>Đã bị cấm</Tag>
                  ) : (
                    <Select
                      value={tempStatus[lesson.lessonId] || lesson.status}
                      style={{ width: 150 }}
                      onChange={(value) => handleStatusChange(lesson, value)}
                      loading={currentLesson?.lessonId === lesson.lessonId && changeStatusLoading}
                      disabled={changeStatusLoading}
                    >
                      <Option value='Active'>
                        <Tag color='green' style={{ width: '100%', margin: 0 }}>
                          Đang sử dụng
                        </Tag>
                      </Option>
                      <Option value='Inactive'>
                        <Tag color='orange' style={{ width: '100%', margin: 0 }}>
                          Ngưng sử dụng
                        </Tag>
                      </Option>
                    </Select>
                  )}
                </div>
              ]}
            >
              <Card.Meta
                title={<h3 className='text-lg font-semibold'>{lesson.lessonName}</h3>}
                // description={<div className='mt-2 text-gray-500'>ID: {lesson.lessonId}</div>}
              />
            </Card>
          ))}
        </div>
      )}

      <Modal
        title={
          <>
            <ExclamationCircleOutlined className='text-yellow-500 mr-2' />
            Xác nhận thay đổi trạng thái
          </>
        }
        open={!!currentLesson}
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
        cancelButtonProps={{
          disabled: changeStatusLoading
        }}
      >
        {currentLesson &&
          (currentLesson.status === 'Inactive' ? (
            <p>
              Bạn có chắc chắn muốn ngưng sử dụng bài học <strong>{currentLesson.lessonName}</strong>? Hành động này sẽ
              khiến bài học không khả dụng với tất cả người dùng.
            </p>
          ) : (
            <p>
              Bạn có chắc chắn muốn kích hoạt bài học <strong>{currentLesson.lessonName}</strong>? Hành động này sẽ
              khiến bài học khả dụng với tất cả người dùng.
            </p>
          ))}
      </Modal>
      <Modal
        title='Thêm video mới'
        open={videoModalVisible}
        onOk={handleAddVideoSubmit}
        onCancel={() => setVideoModalVisible(false)}
        okText='Thêm'
        cancelText='Hủy'
        confirmLoading={videoLoading}
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
              Tên video <span className='text-red-500'>*</span>
            </label>
            <Input
              value={videoForm.lessonName}
              onChange={(e) => setVideoForm({ ...videoForm, lessonName: e.target.value })}
              placeholder='Nhập tên video'
            />
            {videoErrors.lessonName && <div className='text-red-500 text-sm mt-1'>{videoErrors.lessonName}</div>}
          </div>

          <div>
            <label className='block mb-1 font-medium'>
              File video <span className='text-red-500'>*</span>
            </label>
            <Upload
              accept='video/*'
              beforeUpload={(file) => {
                setVideoForm({ ...videoForm, lessonFile: file })
                return false
              }}
              maxCount={1}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Chọn file video</Button>
            </Upload>
            {videoForm.lessonFile && <div className='mt-2 text-sm'>Đã chọn: {videoForm.lessonFile.name}</div>}
            {videoErrors.lessonFile && <div className='text-red-500 text-sm mt-1'>{videoErrors.lessonFile}</div>}
          </div>

          <div>
            <label className='block mb-1 font-medium'>Ảnh thumbnail (tùy chọn)</label>
            <Upload
              accept='image/*'
              beforeUpload={(file) => {
                const previewUrl = URL.createObjectURL(file)
                setThumbnailPreview(previewUrl)
                setVideoForm({ ...videoForm, thumbnailImage: file })
                return false
              }}
              onRemove={() => {
                if (thumbnailPreview) {
                  URL.revokeObjectURL(thumbnailPreview) // Giải phóng bộ nhớ
                }
                setThumbnailPreview(null)
                setVideoForm({ ...videoForm, thumbnailImage: null })
              }}
              maxCount={1}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh thumbnail</Button>
            </Upload>
            {thumbnailPreview && (
              <div className='mt-4'>
                <div className='relative' style={{ width: '200px', height: '150px' }}>
                  <img src={thumbnailPreview} alt='Thumbnail preview' className='w-full h-full object-cover rounded' />
                  <Button
                    type='link'
                    danger
                    icon={<DeleteOutlined />}
                    className='absolute top-1 right-1 bg-white/80 rounded-full p-1'
                    onClick={(e) => {
                      e.stopPropagation()
                      URL.revokeObjectURL(thumbnailPreview)
                      setThumbnailPreview(null)
                      setVideoForm({ ...videoForm, thumbnailImage: null })
                    }}
                  />
                </div>
                <p className='text-xs text-gray-500 mt-1'>{videoForm.thumbnailImage?.name}</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DetailExercisePage
