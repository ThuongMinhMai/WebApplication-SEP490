import {
  ArrowLeftOutlined,
  // BriefcaseOutlined,
  CalendarOutlined,
  CloseOutlined,
  CrownOutlined,
  DollarOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  ReadOutlined,
  SaveOutlined,
  StarFilled,
  TrophyOutlined,
  UploadOutlined
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  List,
  message,
  Row,
  Spin,
  Tag,
  Typography,
  Upload
} from 'antd'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const { TextArea } = Input
const { Title, Text } = Typography

interface ProfessorData {
  accountId: number
  professorId: number
  fullName: string
  avatar: string
  dateTime: string | null
  specialization: string[]
  clinicAddress: string
  consultationFee: number
  experienceYears: number
  rating: number
  qualification: string[]
  knowledge: string[]
  career: string[]
  achievement: string[]
}

const DetailDoctorPage = () => {
  const { id: professorId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [professor, setProfessor] = useState<ProfessorData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchProfessor = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`https://api.diavan-valuation.asia/api/Professor/by-account/${professorId}`)
        setProfessor(response.data.data)
        setPreviewImage(response.data.data.avatar)
        form.setFieldsValue({
          ...response.data.data,
          specialization: response.data.data.specialization?.join('\n') || '',
          qualification: response.data.data.qualification?.join('\n') || '',
          knowledge: response.data.data.knowledge?.join('\n') || '',
          career: response.data.data.career?.join('\n') || '',
          achievement: response.data.data.achievement?.join('\n') || ''
        })
      } catch (err) {
        message.error('Failed to load doctor information')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfessor()
  }, [professorId, form])

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
  const handleSubmit = async (values: ProfessorData) => {
    console.log('Form values:', JSON.stringify(values, null, 2))

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append('accountId', professorId ?? '0')
      formData.append('specialization', values.specialization.toString())
      formData.append('qualification', values.qualification.toString())
      formData.append('knowledge', values.knowledge.toString())
      formData.append('career', values.career.toString())
      formData.append('achievement', values.achievement.toString())

      formData.append('clinicAddress', values.clinicAddress)
      formData.append('consultationFee', values.consultationFee.toString())
      formData.append('experienceYears', values.experienceYears.toString())

      // Xử lý avatar file
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      } else if (professor?.avatar) {
        formData.append('avatar', professor.avatar)
      }

      // Debug: Log nội dung FormData
      console.log('FormData contents:')
      for (const [key, value] of formData.entries()) {
        console.log(key, value)
      }

      const response = await axios.put(`https://api.diavan-valuation.asia/api/Professor/professor-detail`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.status === 1) {
        setIsEditing(false)
        setProfessor(response.data.data)
        setPreviewImage(response.data.data.avatar)
        message.success('Cập nhật hồ sơ thành công')
      } else {
        throw new Error(response.data.message || 'Cập nhật hồ sơ thất bại')
      }
    } catch (err) {
      console.error('Update error:', err)
      if (axios.isAxiosError(err)) {
        console.error('API response:', err.response?.data)
      }
      message.error('Cập nhật hồ sơ thất bại' + err)
    } finally {
      setIsUploading(false)
    }
  }
  const renderEditForm = () => (
    <Form form={form} layout='vertical' onFinish={handleSubmit} initialValues={professor || {}}>
      <Row gutter={24}>
        <Col span={8}>
          <Card
            className='flex flex-col justify-center items-center'
            cover={
              <div className='flex justify-center p-4'>
                <Upload
                  name='avatar'
                  showUploadList={false}
                  onChange={handleImageChange} // Chỉ dùng onChange thay vì customRequest
                  beforeUpload={() => false}
                  accept='image/*'
                >
                  <Avatar
                    size={300}
                    src={previewImage}
                    icon={<UploadOutlined />}
                    className='cursor-pointer border-2 border-dashed border-gray-300'
                  />
                </Upload>
              </div>
            }
          >
            <div className='text-center mb-4'>
              <Title level={4} className='mb-0'>
                {professor?.fullName}
              </Title>
            </div>
          </Card>
        </Col>

        <Col span={16}>
          <Card>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name='clinicAddress' label='Địa chỉ phòng khám' rules={[{ required: true }]}>
                  <Input prefix={<EnvironmentOutlined />} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name='consultationFee' label='Phí tư vấn' rules={[{ required: true }]}>
                  <InputNumber min={0} prefix={<DollarOutlined />} className='w-full' />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name='experienceYears' label='Kinh nghiệm (Years)' rules={[{ required: true }]}>
                  <InputNumber min={0} max={50} prefix={<CalendarOutlined />} className='w-full' />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name='specialization' label='Chuyên ngành' rules={[{ required: true }]}>
              <TextArea placeholder='Nhập từng chuyên ngành vào một dòng mới' autoSize={{ minRows: 2, maxRows: 6 }} />
            </Form.Item>
            <Form.Item name='qualification' label='Bằng cấp' rules={[{ required: true }]}>
              <TextArea placeholder='Nhập từng bằng cấp vào một dòng mới' autoSize={{ minRows: 2, maxRows: 6 }} />
            </Form.Item>

            <Form.Item name='knowledge' label='Kiến thức chuyên môn' rules={[{ required: true }]}>
              <TextArea
                placeholder='Nhập từng kiến ​​thức chuyên môn trên một dòng mới'
                autoSize={{ minRows: 2, maxRows: 6 }}
              />
            </Form.Item>

            <Form.Item name='career' label='Sự nghiệp' rules={[{ required: true }]}>
              <TextArea
                placeholder='Nhập từng điểm nổi bật trong sự nghiệp vào một dòng mới'
                autoSize={{ minRows: 2, maxRows: 6 }}
              />
            </Form.Item>

            <Form.Item name='achievement' label='Thành tích'>
              <TextArea placeholder='Nhập mỗi thành tích vào một dòng mới' autoSize={{ minRows: 2, maxRows: 6 }} />
            </Form.Item>

            <Divider />
            <div className='flex justify-end space-x-4'>
              <Button
                icon={<CloseOutlined />}
                onClick={() => {
                  setIsEditing(false)
                  setPreviewImage(professor?.avatar || null)
                  form.resetFields()
                }}
              >
                Hủy
              </Button>
              <Button type='primary' htmlType='submit' icon={<SaveOutlined />} loading={isUploading}>
                Lưu thay đổi
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Form>
  )

  const renderProfileView = () => (
    <Row gutter={24}>
      <Col span={8}>
        <Card
          className='flex flex-col justify-center items-center'
          cover={
            <div className='flex justify-center p-4 items-center'>
              <div
                className='w-[350px] h-[450px] bg-cover bg-center rounded-lg'
                style={{ backgroundImage: `url(${professor?.avatar})` }}
              />
            </div>
          }
          actions={[
            <Button type='primary' icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
              Chỉnh sửa hồ sơ
            </Button>
          ]}
        >
          <Title level={3} className='text-center'>
            {professor?.fullName}
          </Title>
          <div className='flex justify-center items-center mb-4'>
            <StarFilled className='text-yellow-400 mr-1' />
            <Text strong className='mr-2'>
              {professor?.rating}
            </Text>
            <Text type='secondary'>({professor?.experienceYears} năm kinh nghiệm)</Text>
          </div>
        </Card>
      </Col>

      <Col span={16}>
        <Card>
          <Descriptions title='Thông tin bác sĩ' column={1} bordered>
            <Descriptions.Item label='Địa chỉ phòng khám'>{professor?.clinicAddress}</Descriptions.Item>
            <Descriptions.Item label='Phí tư vấn'>{professor?.consultationFee}</Descriptions.Item>
          </Descriptions>

          <Divider orientation='left' className='mt-6 text-gray-800 before:bg-[#FF1356]'>
            <ExperimentOutlined /> Chuyên ngành
          </Divider>
          <div className='mb-6 ml-4'>
            {professor?.specialization?.map((item, index) => (
              <Tag color='blue' key={index} className='mb-2'>
                {item}
              </Tag>
            ))}
          </div>

          <Divider orientation='left' className='text-gray-800 before:bg-[#FF1356]'>
            <MedicineBoxOutlined /> Trình độ chuyên môn
          </Divider>
          <List
            size='small'
            dataSource={professor?.qualification}
            renderItem={(item) => <List.Item>{item}</List.Item>}
            className='mb-6'
          />

          <Divider orientation='left' className='text-gray-800 before:bg-[#FF1356]'>
            <ReadOutlined /> Kiến thức chuyên môn
          </Divider>
          <List
            size='small'
            dataSource={professor?.knowledge}
            renderItem={(item) => <List.Item>{item}</List.Item>}
            className='mb-6'
          />

          <Divider orientation='left' className='text-gray-800 before:bg-[#FF1356]'>
            <CrownOutlined /> Sự nghiệp
          </Divider>
          <List
            size='small'
            dataSource={professor?.career}
            renderItem={(item) => <List.Item>{item}</List.Item>}
            className='mb-6'
          />

          <Divider orientation='left' className='text-gray-800 before:bg-[#FF1356]'>
            <TrophyOutlined /> Thành tích
          </Divider>
          <List size='small' dataSource={professor?.achievement} renderItem={(item) => <List.Item>{item}</List.Item>} />
        </Card>
      </Col>
    </Row>
  )

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spin size='large' />
      </div>
    )
  }

  return (
    <div className='p-6'>
      <Button
        type='primary'
        className='bg-[#FF1356] border-[#FF1356] font-bold hover:bg-pink-700 hover:border-pink-700'
        onClick={() => navigate(`/admin/doctors`)}
        icon={<ArrowLeftOutlined />}
      >
        Quay lại
      </Button>
      <div className='mt-6'>{isEditing ? renderEditForm() : renderProfileView()}</div>
    </div>
  )
}

export default DetailDoctorPage
