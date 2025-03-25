import React, { useState, useEffect, useRef } from 'react'
import { Table, Input, Button, Layout } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { TablePaginationConfig, ColumnType } from 'antd/es/table'
import type { InputRef } from 'antd'

const { Content } = Layout

interface Name {
  first: string
  last: string
}

interface User {
  login: {
    uuid: string
  }
  name: Name
  gender: string
  email: string
}

const DoctorsPage = () => {
  const [data, setData] = useState<User[]>([])
  const [filteredData, setFilteredData] = useState<User[]>([])
  const [pagination, setPagination] = useState<TablePaginationConfig>({})
  const [tableLoading, setTableLoading] = useState(false)
  const searchInput = useRef<InputRef>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setTableLoading(true)
    try {
      const response = await fetch('https://randomuser.me/api/?results=10')
      const result = await response.json()
      setData(result.results)
      setFilteredData(result.results)
      setPagination({ total: result.results.length })
      setTableLoading(false)
    } catch (error) {
      console.error('Fetch error:', error)
      setTableLoading(false)
    }
  }

  const getColumnSearchProps = (dataIndex: keyof User): ColumnType<User> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0] as string}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type='primary'
          onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          icon={<SearchOutlined />}
          size='small'
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button onClick={() => handleReset(clearFilters)} size='small' style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      const searchValue = value.toString().toLowerCase()
      if (dataIndex === 'name') {
        return (
          record.name.first.toLowerCase().includes(searchValue) || record.name.last.toLowerCase().includes(searchValue)
        )
      }
      return record[dataIndex]?.toString().toLowerCase().includes(searchValue)
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.focus(), 100)
      }
    }
  })

  const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: keyof User) => {
    confirm()
    const searchText = selectedKeys[0].toLowerCase()
    const filtered = data.filter((item) => {
      if (dataIndex === 'name') {
        return item.name.first.toLowerCase().includes(searchText) || item.name.last.toLowerCase().includes(searchText)
      }
      return item[dataIndex]?.toString().toLowerCase().includes(searchText)
    })
    setFilteredData(filtered)
  }

  const handleReset = (clearFilters?: () => void) => {
    clearFilters?.()
    setFilteredData(data)
  }

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPagination(pagination)
  }
  const components = {
    header: {
      cell: (props: any) => (
        <th
          {...props}
          style={{
            backgroundColor: '#ffd6e7', // Màu hồng nhạt
            fontWeight: 'bold',
            color: '#ec4899'
          }}
        />
      )
    }
  }
  const columns: ColumnType<User>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.first.localeCompare(b.name.first),
      render: (_, record) => `${record.name.first} ${record.name.last}`,
      width: '30%',
      ...getColumnSearchProps('name')
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      filters: [
        { text: 'Male', value: 'male' },
        { text: 'Female', value: 'female' }
      ],
      onFilter: (value, record) => record.gender === value,
      width: '20%'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: '50%',
      ...getColumnSearchProps('email')
    }
  ]

  return (
    <Content style={{ padding: '50px 50px' }}>
      <Table
        columns={columns}
        rowKey={(record) => record?.login?.uuid || record?.email}
        dataSource={filteredData}
        pagination={pagination}
        loading={tableLoading}
        onChange={handleTableChange}
        components={components}
      />
    </Content>
  )
}

export default DoctorsPage
