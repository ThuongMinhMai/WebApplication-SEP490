import { useAuth } from '@/contexts/AuthContext'
import {
    ArrowLeftOutlined,
    ExclamationCircleOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
    PlusOutlined,
    UploadOutlined
} from '@ant-design/icons'
import {
    Avatar,
    Button,
    Card,
    Divider,
    Form,
    Layout,
    Modal,
    Progress,
    Select,
    Skeleton,
    Table,
    Tag,
    Typography,
    Upload,
    message
} from 'antd'
import type { RcFile } from 'antd/es/upload/interface'
import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

const { Content } = Layout
const { Title, Text } = Typography
const { Option } = Select

interface Music {
  musicId: number
  playlistId: number
  accountId: number
  musicName: string
  musicUrl: string
  imageUrl: string
  singer: string
  createdDate: string
  status: string
  duration?: number // Added duration property
}

interface ApiResponse {
  status: number
  message: string
  data: Music[]
}

const DetailMusicPage = () => {
  const { user } = useAuth()
  const { id: playlistId } = useParams<{ id: string }>()
  const [songs, setSongs] = useState<Music[]>([])
  const [loading, setLoading] = useState(true)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [searchParams] = useSearchParams()
  const [currentMusic, setCurrentMusic] = useState<Music | null>(null)
  const [changeStatusLoading, setChangeStatusLoading] = useState(false)
  const playlistName = searchParams.get('playlistname')
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<RcFile[]>([])
  const [addloading, setAddLoading] = useState(false)
  useEffect(() => {
    fetchPlaylistSongs()
  }, [playlistId])

  const fetchPlaylistSongs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.diavan-valuation.asia/content-management/all-music/${playlistId}`)
      const result: ApiResponse = await response.json()

      if (result.status === 1) {
        // Add mock duration if not provided by API
        const songsWithDuration = result.data.map((song) => ({
          ...song,
          duration: song.duration || Math.floor(Math.random() * 300) + 120 // 2-5 minutes
        }))
        setSongs(songsWithDuration)
      } else {
        message.error(result.message || 'Failed to load playlist')
      }
    } catch (error) {
      console.error('Error fetching playlist:', error)
      message.error('Failed to load playlist')
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = (musicId: number, musicUrl: string) => {
    if (currentlyPlaying === musicId) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setCurrentlyPlaying(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = musicUrl
        audioRef.current.play()
        audioRef.current.ontimeupdate = () => {
          setCurrentTime(audioRef.current?.currentTime || 0)
        }
        audioRef.current.onloadedmetadata = () => {
          setDuration(audioRef.current?.duration || 0)
        }
      }
      setCurrentlyPlaying(musicId)
    }
  }

  const handleStatusChange = (music: Music, status: string) => {
    setCurrentMusic({ ...music, status })
  }

  const handleChangeStatusConfirm = async () => {
    if (!currentMusic) return

    try {
      setChangeStatusLoading(true)
      const response = await fetch(
        `https://api.diavan-valuation.asia/content-management/music-status?musicId=${currentMusic.musicId}&status=${currentMusic.status}`,
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
        message.success('Cập nhật trạng thái bài hát thành công')

        fetchPlaylistSongs()
      } else {
        message.error(data.data || 'Cập nhật trạng thái bài hát thất bại')
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setChangeStatusLoading(false)
      setCurrentMusic(null)
    }
  }

  const handleChangeStatusCancel = () => {
    setCurrentMusic(null)
  }
  const handleSubmit = async () => {
    try {
      setAddLoading(true)
      const values = await form.validateFields()

      const formData = new FormData()
      formData.append('AccountId', user?.accountId.toString() || '0')
      formData.append('PlaylistId', playlistId || '0')

      fileList.forEach((file) => {
        formData.append('MusicFiles', file)
      })

      const response = await fetch('https://api.diavan-valuation.asia/content-management/music', {
        method: 'POST',
        body: formData,
        headers: {
          accept: '*/*'
        }
      })

      const result = await response.json()

      if (result.status === 1) {
        message.success('Thêm bài hát thành công')
        setVisible(false)
        form.resetFields()
        setFileList([])
        fetchPlaylistSongs()
        // Có thể thêm logic reload danh sách bài hát ở đây
      } else {
        message.error(result.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm bài hát')
    } finally {
      setAddLoading(false)
    }
  }

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e
    }
    return e && e.fileList
  }
  return (
    <Content className='p-6 max-w-7xl mx-auto'>
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} onEnded={() => setCurrentlyPlaying(null)} />
      <div className='flex justify-between items-center'>
        <Button
          type='primary'
          className='bg-[#FF1356] border-[#FF1356] font-bold hover:bg-pink-700 hover:border-pink-700 mb-5'
          icon={<ArrowLeftOutlined />}
        >
          Quay lại
        </Button>
        <Button
          type='primary'
          className='bg-[#FF1356] border-[#FF1356] font-bold hover:bg-pink-700 hover:border-pink-700 mb-5'
          onClick={() => {
            setVisible(true)
            setFileList([]) // Reset fileList khi mở modal
            form.resetFields() // Reset form fields
          }}
          icon={<PlusOutlined />}
        >
          Thêm bài hát
        </Button>
      </div>
      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Playlist Header - Left Side */}
        <Card
          loading={loading}
          className='lg:w-1/3 rounded-xl overflow-hidden shadow-md border-0 flex-shrink-0'
          cover={
            songs.length > 0 ? (
              <div className='h-64 flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 relative'>
                <div className='absolute inset-0 bg-black opacity-20'></div>
                <img
                  alt='Playlist cover'
                  src={songs[0].imageUrl}
                  className='w-48 h-48 object-cover rounded-xl shadow-xl border-4 border-white'
                />
              </div>
            ) : (
              <Skeleton.Image active className='!h-64 !w-full' />
            )
          }
        >
          <div className='p-6'>
            <Title level={2} className='m-0 text-2xl font-bold text-gray-800'>
              Danh sách phát #{playlistName}
            </Title>
            <Text type='secondary' className='text-lg block mb-4 text-gray-600'>
              {songs.length} {songs.length === 1 ? 'bài hát' : 'bài hát'}
            </Text>
          </div>
        </Card>

        {/* Songs List - Right Side */}
        <Card className='flex-1 rounded-xl shadow-md border-0 overflow-hidden'>
          <div className='p-4'>
            <Divider orientation='left' className='text-xl font-bold text-gray-800 before:bg-[#FF1356]'>
              Bài hát
            </Divider>

            <Table
              dataSource={songs}
              loading={loading}
              rowKey='musicId'
              className='rounded-lg shadow-sm'
              rowClassName={(record) => (currentlyPlaying === record.musicId ? 'bg-blue-50' : 'group hover:bg-gray-50')}
              //   onRow={(record) => ({
              //     onClick: () => handlePlay(record.musicId, record.musicUrl)
              //   })}
              columns={[
                {
                  title: '',
                  key: 'play',
                  width: 60,
                  render: (_, record) =>
                    currentlyPlaying === record.musicId ? (
                      <PauseCircleOutlined
                        className='text-2xl text-pink-600 cursor-pointer'
                        onClick={(e) => {
                          e.stopPropagation() // Ngăn sự kiện click lan ra hàng
                          handlePlay(record.musicId, record.musicUrl)
                        }}
                      />
                    ) : (
                      <div
                        className='flex items-center justify-center w-6 h-6'
                        onClick={(e) => {
                          e.stopPropagation() // Ngăn sự kiện click lan ra hàng
                          handlePlay(record.musicId, record.musicUrl)
                        }}
                      >
                        <span className='text-gray-400 group-hover:hidden'>{record.musicId}</span>
                        <PlayCircleOutlined className='text-xl text-pink-600 cursor-pointer hidden group-hover:block' />
                      </div>
                    )
                },
                {
                  title: 'Ảnh',
                  key: 'image',
                  width: 80,
                  render: (_, record) => (
                    <Avatar
                      src={
                        record.imageUrl ||
                        'https://www.turntablelab.com/cdn/shop/products/robertomusci-towerofsilence1_1000x1000.jpg?v=1571264660'
                      }
                      shape='square'
                      size={48}
                      className='rounded-lg shadow-sm'
                    />
                  )
                },
                {
                  title: 'Tên',
                  dataIndex: 'musicName',
                  key: 'name',
                  render: (text, record) => (
                    <Text strong className={currentlyPlaying === record.musicId ? 'text-pink-600' : 'text-gray-800'}>
                      {text || 'Không xác định'}
                    </Text>
                  )
                },
                {
                  title: 'Nghệ sĩ',
                  dataIndex: 'singer',
                  key: 'singer',
                  className: 'hidden md:table-cell'
                },
                {
                  title: 'Trạng thái',
                  key: 'status',

                  render: (_, record: Music) => {
                    let color = ''
                    let text = ''
                    switch (record.status) {
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

                    // return (
                    //   <Tag color={color} style={{ width: '100%', textAlign: 'center' }}>
                    //     {text}
                    //   </Tag>
                    // )

                    if (record.status === 'AdminDelete') {
                      return (
                        <Tag color={color} style={{ width: '100%', textAlign: 'center' }}>
                          {text}
                        </Tag>
                      )
                    }

                    return (
                      <Select
                        value={record.status}
                        style={{ width: 150 }}
                        onChange={(value) => handleStatusChange(record, value)}
                      >
                        <Option value='Active'>
                          <Tag color='green' style={{ width: '90%' }}>
                            Đang sử dụng
                          </Tag>
                        </Option>
                        <Option value='Inactive'>
                          <Tag color='orange' style={{ width: '90%' }}>
                            Ngưng sử dụng
                          </Tag>
                        </Option>
                      </Select>
                    )
                  }
                }
              ]}
              components={{
                body: {
                  row: (props: any) => (
                    <tr {...props} className={`${props.className} cursor-pointer transition-all duration-200`} />
                  )
                }
              }}
            />

            {/* Progress bar for currently playing song */}
            {currentlyPlaying && (
              <div className='w-full px-4 pb-2 mt-4'>
                <Progress
                  percent={(currentTime / duration) * 100 || 0}
                  showInfo={false}
                  strokeColor='#FF1356'
                  strokeWidth={2}
                />
              </div>
            )}
          </div>
        </Card>
      </div>

      <Modal
        title={
          <>
            <ExclamationCircleOutlined className='text-yellow-500 mr-2' />
            Xác nhận thay đổi trạng thái
          </>
        }
        open={!!currentMusic}
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
        {currentMusic &&
          (currentMusic.status === 'Inactive' ? (
            <p>
              Bạn có chắc chắn muốn ngưng sử dụng bài hát <strong>{currentMusic.musicName}</strong>? Hành động này sẽ
              khiến bài hát không khả dụng với người dùng.
            </p>
          ) : (
            <p>
              Bạn có chắc chắn muốn sử dụng bài hát <strong>{currentMusic.musicName}</strong>? Hành động này sẽ khiến
              bài hát khả dụng với tất cả người dùng.
            </p>
          ))}
      </Modal>

      <Modal
        title='Thêm bài hát mới'
        visible={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
        confirmLoading={addloading}
        width={600}
        okText='Thêm bài hát'
        cancelText='Hủy'
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='musicFiles'
            label='Chọn file nhạc'
            valuePropName='fileList'
            getValueFromEvent={normFile}
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một file nhạc' }]}
          >
            <Upload
              multiple
              beforeUpload={(file) => {
                setFileList((prev) => [...prev, file])
                return false
              }}
              onRemove={(file) => {
                setFileList((prev) => prev.filter((f) => f.uid !== file.uid))
              }}
              accept='audio/*'
            >
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  )
}

export default DetailMusicPage
