import { ClockCircleOutlined, DeleteOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { Avatar, Button, Card, Divider, Layout, List, Progress, Skeleton, Table, Tag, Typography, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

const { Content } = Layout
const { Title, Text } = Typography

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

const PlayListMusicDetailPage = () => {
  const { id: playlistId } = useParams<{ id: string }>()
  const [songs, setSongs] = useState<Music[]>([])
  const [loading, setLoading] = useState(true)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [searchParams] = useSearchParams()
  const playlistName = searchParams.get('playlistname')
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
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <Content className='p-6 max-w-7xl mx-auto'>
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} onEnded={() => setCurrentlyPlaying(null)} />

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
            <Text type='secondary' className='block mb-4 text-gray-600'>
              {songs.length} {songs.length === 1 ? 'bài hát' : 'bài hát'}
            </Text>
          </div>
        </Card>

        {/* Songs List - Right Side */}
        <Card className='flex-1 rounded-xl shadow-md border-0 overflow-hidden'>
          <div className='p-4'>
            <Divider orientation='left' className='text-xl font-bold text-gray-800 before:bg-pink-500'>
              Bài hát
            </Divider>

            <Table
              dataSource={songs}
              loading={loading}
              rowKey='musicId'
              className='rounded-lg shadow-sm'
              rowClassName={(record) => (currentlyPlaying === record.musicId ? 'bg-blue-50' : 'group hover:bg-gray-50')}
              onRow={(record) => ({
                onClick: () => handlePlay(record.musicId, record.musicUrl)
              })}
              columns={[
                {
                  title: '',
                  key: 'play',
                  width: 60,
                  render: (_, record) =>
                    currentlyPlaying === record.musicId ? (
                      <PauseCircleOutlined className='text-2xl text-pink-600 cursor-pointer' />
                    ) : (
                      <div className='flex items-center justify-center w-6 h-6'>
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
                    <Avatar src={record.imageUrl} shape='square' size={48} className='rounded-lg shadow-sm' />
                  )
                },
                {
                  title: 'Tên',
                  dataIndex: 'musicName',
                  key: 'name',
                  render: (text, record) => (
                    <Text strong className={currentlyPlaying === record.musicId ? 'text-pink-600' : 'text-gray-800'}>
                      {text}
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
                  render: (_, record) =>
                    record.status === 'Active' ? (
                      <div className='flex items-center'>
                        <Tag color='green' className='mr-2'>
                          Đang sử dụng
                        </Tag>
                      </div>
                    ) : (
                      <Tag color='red'>Ngưng sử dụng</Tag>
                    )
                },

                {
                  title: 'Thời lượng',
                  key: 'duration',
                  render: (_, record) => (
                    <div className='w-24 flex justify-center'>
                      <Text type='secondary' className='text-sm'>
                        {formatTime(record.duration || 0)}
                      </Text>
                    </div>
                  )
                },

                {
                  title: '',
                  key: 'actions',
                  width: 100,
                  render: (_, record) =>
                    record.status === 'Active' && (
                      <Button
                        type='text'
                        icon={<DeleteOutlined className='text-red-500' />}
                        onClick={(e) => {
                          e.stopPropagation()
                          // handleDelete(record.musicId);
                        }}
                        className='opacity-0 group-hover:opacity-100'
                      />
                    )
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
                  strokeColor='#ec4899'
                  strokeWidth={2}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </Content>
  )
}

export default PlayListMusicDetailPage
