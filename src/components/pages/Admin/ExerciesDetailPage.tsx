import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined
} from '@ant-design/icons'
import { Button, Card, Empty, message, Modal, Spin, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

// Ảnh mặc định
const DEFAULT_THUMBNAIL =
  'https://urbanaplaceseniorliving.com/wp-content/uploads/2023/05/Why-Should-Senior-Citizens-Perform-Balance-Exercises-Hero.jpg'

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

function ExerciesDetailPage() {
  const { id: playlistId } = useParams<{ id: string }>()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const playlistName = searchParams.get('playlistname')
  const [banningLesson, setBanningLesson] = useState<Lesson | null>(null)
  const [banLoading, setBanLoading] = useState(false)
  useEffect(() => {
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

    fetchLessons()
  }, [playlistId])

  const handleBanLesson = (lesson: Lesson) => {
    setBanningLesson(lesson)
  }
  const handleBanConfirm = async () => {
    if (!banningLesson) return

    try {
      setBanLoading(true)
      const response = await fetch(
        `https://api.diavan-valuation.asia/content-management/lesson-by-admin?lessonId=${banningLesson.lessonId}`,
        {
          method: 'DELETE',
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
        message.success('Cấm bài học thành công')
        // Update the lesson status in local state
        setLessons(
          lessons.map((lesson) =>
            lesson.lessonId === banningLesson.lessonId ? { ...lesson, status: 'AdminDelete' } : lesson
          )
        )
      } else {
        message.error(data.message || 'Lỗi cấm bài học')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      message.error(errorMessage)
    } finally {
      setBanLoading(false)
      setBanningLesson(null)
    }
  }

  const handleBanCancel = () => {
    setBanningLesson(null)
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
      <Button
        type='primary'
        className='bg-[#FF1356] border-[#FF1356] font-bold hover:bg-pink-700 hover:border-pink-700 mb-5'
        onClick={() => navigate(-1)}
        icon={<ArrowLeftOutlined />}
      >
        Quay lại
      </Button>
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
              actions={[
                <div className='flex justify-between items-center px-4 py-2'>
                  <span className='text-gray-500'>
                    <ClockCircleOutlined className='mr-1' />
                    {new Date(lesson.createdDate).toLocaleDateString()}
                  </span>
                  <Tag color={statusColor[lesson.status] || 'default'}>
                    {lesson.status === 'Active'
                      ? 'Đang sử dụng'
                      : lesson.status === 'Inactive'
                        ? 'Ngưng sử dụng'
                        : lesson.status === 'AdminDelete'
                          ? 'Đã bị cấm'
                          : lesson.status}
                  </Tag>
                  {lesson.status === 'Active' && (
                    <Button
                      danger
                      size='small'
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBanLesson(lesson)
                      }}
                    >
                      <StopOutlined /> Cấm
                    </Button>
                  )}
                </div>
              ]}
            >
              <Card.Meta
                title={<h3 className='text-lg font-semibold'>{lesson.lessonName}</h3>}
                description={
                  <div className='mt-4'>
                    <video controls autoPlay={false} className='w-full rounded' poster={lesson.imageUrl || ''}>
                      <source src={lesson.lessonUrl} type='video/mp4' />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                }
              />
            </Card>
          ))}
        </div>
      )}

      <Modal
        title={
          <>
            <ExclamationCircleOutlined className='text-yellow-500 mr-2' /> Xác nhận cấm bài tập
          </>
        }
        open={!!banningLesson}
        onOk={handleBanConfirm}
        onCancel={handleBanCancel}
        confirmLoading={banLoading}
        okText='Xác nhận cấm'
        cancelText='Hủy'
        okButtonProps={{ danger: true }}
      >
        {banningLesson && (
          <p>
            Bạn có chắc chắn muốn cấm bài học <strong>"{banningLesson.lessonName}"</strong>? Hành động này sẽ khiến bài
            học không khả dụng với tất cả người dùng.
          </p>
        )}
      </Modal>
    </div>
  )
}

export default ExerciesDetailPage
