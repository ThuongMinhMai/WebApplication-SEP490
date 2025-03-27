import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, DatePicker, Form, Input, InputNumber, message, Select, Upload } from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const { TextArea } = Input
const { Option } = Select

const DoctorCreateForm: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: any) => {
    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('Gender', values.gender)
      formData.append('Specialization', values.specialization)
      formData.append('ExperienceYears', values.experienceYears)
      formData.append('ClinicAddress', values.clinicAddress)
      formData.append('Qualification', values.qualification)
      formData.append('Achievement', values.achievement)
      formData.append('PhoneNumber', values.phoneNumber)
      if (fileList.length > 0) {
        formData.append('Avatar', fileList[0].originFileObj as File)
      }
      formData.append('DateOfBirth', values.dateOfBirth.format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
      formData.append('FullName', values.fullName)
      formData.append('Password', values.password)
      formData.append('Email', values.email)
      formData.append('ConsultationFee', values.consultationFee)
      formData.append('Knowledge', values.knowledge)
      formData.append('Career', values.career)

      const response = await fetch('https://api.diavan-valuation.asia/account-management/professor-account', {
        method: 'POST',
        body: formData,
        headers: {
          accept: '*/*'
        }
      })

      const result = await response.json()

      if (result.status === 1) {
        message.success('Thêm bác sĩ thành công')
        navigate('/admin/doctors')
      } else {
        message.error(result.message || 'Thêm bác sĩ thất bại')
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi thêm bác sĩ')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e
    }
    return e?.fileList
  }

  return (
    <div className='p-6 bg-white rounded-lg '>
      <div className='flex justify-between items-center mb-5'>
        <h1 className='text-2xl font-bold text-[#FF1356] mb-6'>Thêm Bác Sĩ Mới</h1>
        <Button
          type='primary'
          className='bg-[#FF1356] border-[#FF1356] font-bold hover:bg-pink-700 hover:border-pink-700'
          onClick={() => navigate(`/admin/doctors`)}
          icon={<ArrowLeftOutlined />}
        >
          Quay lại
        </Button>
      </div>

      <Form form={form} layout='vertical' onFinish={onFinish} autoComplete='off'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Cột 1 */}
          <div>
            <Form.Item label='Họ và tên' name='fullName' rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
              <Input placeholder='Nhập họ và tên' />
            </Form.Item>

            <Form.Item
              label='Email'
              name='email'
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input placeholder='Nhập email' />
            </Form.Item>

            <Form.Item label='Mật khẩu' name='password' rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
              <Input.Password placeholder='Nhập mật khẩu' />
            </Form.Item>

            <Form.Item
              label='Số điện thoại'
              name='phoneNumber'
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                {
                  validator: (_, value) => {
                    if (!/^0\d{9}$/.test(value)) {
                      return Promise.reject('Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0')
                    }
                    return Promise.resolve()
                  }
                }
              ]}
            >
              <Input
                placeholder='Nhập số điện thoại'
                maxLength={10}
                onChange={(e) => {
                  // Chỉ cho phép nhập số
                  const value = e.target.value.replace(/\D/g, '')
                  // Đảm bảo luôn bắt đầu bằng 0
                  if (value && !value.startsWith('0')) {
                    e.target.value = '0' + value
                  } else {
                    e.target.value = value
                  }
                  return e
                }}
              />
            </Form.Item>
            <Form.Item
              label='Ngày sinh'
              name='dateOfBirth'
              rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
            >
              <DatePicker
                className='w-full'
                format='DD/MM/YYYY'
                placeholder='Chọn ngày sinh'
                disabledDate={(current) => {
                  // Disable tất cả các ngày trước năm 2001 (tức là từ 2000 trở về trước)
                  return current && current.year() > 2002
                }}
              />
            </Form.Item>

            <Form.Item label='Giới tính' name='gender' rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}>
              <Select placeholder='Chọn giới tính'>
                <Option value='Male'>Nam</Option>
                <Option value='Female'>Nữ</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label='Ảnh đại diện'
              name='avatar'
              rules={[{ required: true, message: 'Vui lòng chọn ảnh hồ sơ' }]}
              valuePropName='fileList'
              getValueFromEvent={normFile}
            >
              <Upload
                listType='picture'
                maxCount={1}
                beforeUpload={() => false}
                onChange={({ fileList }) => setFileList(fileList)}
              >
                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
              </Upload>
            </Form.Item>
          </div>

          {/* Cột 2 */}
          <div>
            <Form.Item
              label='Chuyên môn'
              name='specialization'
              rules={[{ required: true, message: 'Vui lòng nhập chuyên môn' }]}
            >
              <Input placeholder='Nhập chuyên môn' />
            </Form.Item>

            <Form.Item
              label='Số năm kinh nghiệm'
              name='experienceYears'
              rules={[{ required: true, message: 'Vui lòng nhập số năm kinh nghiệm' }]}
            >
              <InputNumber min={0} className='w-full' placeholder='Nhập số năm kinh nghiệm' />
            </Form.Item>

            <Form.Item
              label='Địa chỉ phòng khám'
              name='clinicAddress'
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ phòng khám' }]}
            >
              <TextArea rows={2} placeholder='Nhập địa chỉ phòng khám' />
            </Form.Item>

            <Form.Item
              label='Bằng cấp'
              name='qualification'
              rules={[{ required: true, message: 'Vui lòng nhập bằng cấp' }]}
            >
              <TextArea rows={2} placeholder='Nhập bằng cấp' />
            </Form.Item>

            <Form.Item label='Thành tích' name='achievement'>
              <TextArea rows={2} placeholder='Nhập thành tích (nếu có)' />
            </Form.Item>

            <Form.Item
              label='Phí tư vấn'
              name='consultationFee'
              rules={[{ required: true, message: 'Vui lòng nhập phí tư vấn' }]}
            >
              <InputNumber
                min={0}
                className='w-full'
                placeholder='Nhập phí tư vấn'
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>

            <Form.Item
              label='Kiến thức chuyên môn'
              name='knowledge'
              rules={[{ required: true, message: 'Vui lòng nhập kiến thức chuyên môn' }]}
            >
              <TextArea rows={2} placeholder='Nhập kiến thức chuyên môn' />
            </Form.Item>

            <Form.Item
              label='Sự nghiệp'
              name='career'
              rules={[{ required: true, message: 'Vui lòng nhập thông tin sự nghiệp' }]}
            >
              <TextArea rows={2} placeholder='Nhập thông tin sự nghiệp' />
            </Form.Item>
          </div>
        </div>

        <Form.Item className='mt-6'>
          <div className='flex justify-end space-x-4'>
            <Button onClick={() => navigate('/admin/doctors')} className='bg-gray-100 text-gray-700 hover:bg-gray-200'>
              Hủy bỏ
            </Button>
            <Button
              type='primary'
              htmlType='submit'
              loading={loading}
              className='bg-[#FF1356] hover:bg-pink-700 border-[#FF1356]'
            >
              Thêm bác sĩ
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  )
}

export default DoctorCreateForm
