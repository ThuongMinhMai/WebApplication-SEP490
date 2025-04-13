import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import {
  Card,
  Avatar,
  Descriptions,
  Tag,
  Spin,
  Button,
  message,
  Row,
  Col,
  Divider,
  Typography,
  Image,
  Form,
  Input,
  DatePicker,
  Select,
  Upload,
  Space
} from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  UploadOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import type { RcFile } from 'antd/es/upload'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography
const { Option } = Select

interface ProfileData {
  accountId: number
  roleId: number
  email: string
  fullName: string
  avatar: string
  gender: string
  phoneNumber: string
  dateOfBirth: string
  createdDate: string
  status: string
}

interface ApiResponse {
  status: number
  message: string
  data: ProfileData
}

function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const navigate = useNavigate()
  useEffect(() => {
    fetchProfile()
  }, [user?.accountId])

  const fetchProfile = async () => {
    try {
      if (!user?.accountId) return

      setLoading(true)
      const response = await fetch(`https://api.diavan-valuation.asia/profile-management/${user.accountId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      setProfile(data.data)
      form.setFieldsValue({
        fullName: data.data.fullName,
        gender: data.data.gender,
        dateOfBirth: dayjs(data.data.dateOfBirth)
      })
      setPreviewImage(data.data.avatar)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      message.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
    form.setFieldsValue({
      fullName: profile?.fullName,
      gender: profile?.gender,

      dateOfBirth: profile?.dateOfBirth ? dayjs(profile.dateOfBirth) : null
    })
  }

  const handleCancel = () => {
    setEditing(false)
    form.resetFields()
  }

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('AccountId', String(profile?.accountId))
      formData.append('FullName', values.fullName)
      formData.append('Gender', values.gender)
      formData.append('Dob', values.dateOfBirth.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'))
      if (avatarFile) {
        formData.append('Avatar', avatarFile)
      }
      //  else if (profile?.avatar) {
      //   formData.append('Avatar', profile.avatar)
      // }

      const response = await fetch('https://api.diavan-valuation.asia/profile-management', {
        method: 'PUT',
        headers: {
          accept: '*/*'
        },
        body: formData
      })

      const data = await response.json()

      if (data.status === 1) {
        message.success('Cập nhật hồ sơ thành công')
        setEditing(false)
        fetchProfile()
      } else {
        message.error(data.message || 'Cập nhật hồ sơ thất bại')
      }
    } catch (err) {
      message.error('Đã xảy ra lỗi khi cập nhật hồ sơ')
    } finally {
      setLoading(false)
    }
  }

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file)
      const newFileList = fileList.slice()
      newFileList.splice(index, 1)
      setFileList(newFileList)
    },
    beforeUpload: (file) => {
      setFileList([file])
      return false
    },
    fileList,
    maxCount: 1
  }
  const handleImageChange = (info: any) => {
    const file = info.file
    if (!file) return

    if (!file.type.match('image.*')) {
      message.error('Vui lòng chọn file ảnh (jpg, png, v.v.)')
      return
    }

    // Hiển thị preview ngay lập tức
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Lưu file ảnh để gửi kèm khi submit
    setAvatarFile(file)
  }
  const getRoleName = (roleId: number) => {
    switch (roleId) {
      case 1:
        return 'Administrator'
      case 2:
        return 'Người già'
      case 3:
        return 'Người hỗ trợ'
      case 4:
        return 'Bác sĩ'
      case 5:
        return 'Nhà cung cấp nội dung'
      default:
        return 'Guest'
    }
  }

  const getStatusTag = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Tag color='green'>Đang hoạt động</Tag>
      case 'inactive':
        return <Tag color='orange'>Đã ngưng hoạt động</Tag>
      case 'pending':
        return <Tag color='blue'>Pending</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  const getGenderTag = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male':
        return <Tag color='blue'>Nam</Tag>
      case 'female':
        return <Tag color='pink'>Nữ</Tag>
      default:
        return <Tag>{gender}</Tag>
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size='large' />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Card style={{ width: 400 }}>
          <Title level={4} type='danger'>
            Lỗi tải hồ sơ
          </Title>
          <Text>{error}</Text>
          <Button type='primary' onClick={() => window.location.reload()} style={{ marginTop: 16 }}>
            Thử lại
          </Button>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Card style={{ width: 400 }}>
          <Title level={4}>Không có dữ liệu hồ sơ</Title>
          <Text>Thông tin hồ sơ không có sẵn</Text>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Space style={{ marginBottom: 24 }}>
        <Button type='text' icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 16 }}>
          Trở lại
        </Button>
      </Space>
      <Card
        bordered={false}
        style={{
          boxShadow:
            '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
        }}
      >
        {/* Cover Image */}
        <div
          style={{
            height: '200px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '8px 8px 8px 8px',
            marginBottom: '80px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Image
            src='https://as1.ftcdn.net/jpg/05/61/98/56/1000_F_561985677_wLIQuBCcKfWM2w78Mi9poRKRoJ0qjIjM.jpg'
            alt='Cover'
            preview={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px 8px 8px 8px' }}
          />
        </div>

        {/* Avatar and Basic Info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '-120px',
            marginBottom: '24px'
          }}
        >
          {editing ? (
            <Upload
              name='avatar'
              showUploadList={false}
              onChange={handleImageChange} // Chỉ dùng onChange thay vì customRequest
              beforeUpload={() => false}
              accept='image/*'
            >
              <Avatar
                size={200}
                src={previewImage}
                icon={<UploadOutlined />}
                className='cursor-pointer border-2 border-dashed border-gray-300'
              />
            </Upload>
          ) : (
            <Avatar
              size={160}
              src={profile.avatar}
              icon={<UserOutlined />}
              style={{
                backgroundColor: 'white',
                border: '4px solid #fff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
            />
          )}

          {editing ? (
            <div></div>
          ) : (
            <>
              <Title level={3} style={{ marginTop: '16px', marginBottom: '8px' }}>
                {profile.fullName}
              </Title>
              <Text type='secondary' style={{ marginBottom: '16px' }}>
                {getRoleName(profile.roleId)}
              </Text>
            </>
          )}

          <div style={{ marginBottom: '24px' }}>
            {editing ? <div></div> : getStatusTag(profile.status)}
            {editing ? <div></div> : getGenderTag(profile.gender)}
          </div>
        </div>

        {editing ? (
          <Form form={form} onFinish={handleSubmit} style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            <Form.Item
              name='fullName'
              label='Họ và tên'
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              style={{ marginBottom: 16 }}
            >
              <Input size='large' />
            </Form.Item>

            <Form.Item name='gender' label='Giới tính' style={{ marginBottom: 16 }}>
              <Select style={{ width: '100%' }} value={form.getFieldValue('gender') || profile.gender.toLowerCase()}>
                <Select.Option value='Male'>Nam</Select.Option>
                <Select.Option value='Female'>Nữ</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name='dateOfBirth'
              label='Ngày sinh'
              rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
              style={{ marginBottom: 24 }}
            >
              <DatePicker style={{ width: '100%' }} format='DD/MM/YYYY' />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <Button
                onClick={() => {
                  handleCancel()
                  setPreviewImage(profile?.avatar || null)
                }}
              >
                Hủy bỏ
              </Button>
              <Button type='primary' htmlType='submit' loading={loading}>
                Lưu thay đổi
              </Button>
            </div>
          </Form>
        ) : (
          <>
            {/* Profile Details - Vertical Layout */}
            <Descriptions
              column={1}
              labelStyle={{
                fontWeight: '600',
                width: '200px',
                padding: '12px 0'
              }}
              contentStyle={{
                padding: '12px 0'
              }}
            >
              <Descriptions.Item
                label={
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <MailOutlined style={{ marginRight: '8px' }} />
                    Email
                  </span>
                }
              >
                {profile.email}
              </Descriptions.Item>

              <Divider style={{ margin: '8px 0' }} />

              <Descriptions.Item
                label={
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneOutlined style={{ marginRight: '8px' }} />
                    Số điện thoại
                  </span>
                }
              >
                {profile.phoneNumber || 'N/A'}
              </Descriptions.Item>

              <Divider style={{ margin: '8px 0' }} />

              <Descriptions.Item
                label={
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarOutlined style={{ marginRight: '8px' }} />
                    Ngày sinh
                  </span>
                }
              >
                {dayjs(profile.dateOfBirth).format('DD [tháng] MM [năm] YYYY')}
              </Descriptions.Item>

              <Divider style={{ margin: '8px 0' }} />

              <Descriptions.Item
                label={
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <SafetyCertificateOutlined style={{ marginRight: '8px' }} />
                    Đã tạo tài khoản
                  </span>
                }
              >
                {dayjs(profile.createdDate).format('HH:mm [ngày] DD [tháng] MM [năm] YYYY')}
              </Descriptions.Item>
            </Descriptions>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '32px',
                gap: '16px'
              }}
            >
              <Button type='primary' onClick={handleEdit}>
                Chỉnh sửa hồ sơ
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export default ProfilePage
