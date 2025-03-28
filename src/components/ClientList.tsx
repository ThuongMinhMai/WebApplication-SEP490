import React, { PureComponent } from 'react'
import { Layout, Table, Input, InputRef, Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnType, TablePaginationConfig } from 'antd/es/table'

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

interface State {
  data: User[]
  filteredData: User[]
  pagination: TablePaginationConfig
  tableLoading: boolean
  searchText: string
}

class ClientList extends PureComponent<{}, State> {
  state: State = {
    data: [],
    filteredData: [],
    pagination: {},
    tableLoading: false,
    searchText: ''
  }

  searchInput: React.RefObject<InputRef> = React.createRef()

  componentDidMount() {
    this.fetch()
  }

  getColumnSearchProps = (dataIndex: keyof User): ColumnType<User> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={this.searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0] as string}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type='primary'
          onClick={() => this.handleSearch(selectedKeys as string[], confirm, dataIndex)}
          icon={<SearchOutlined />}
          size='small'
          style={{ width: 90, marginRight: 8 }}
        >
          Tìm kiếm
        </Button>
        <Button onClick={() => this.handleReset(clearFilters)} size='small' style={{ width: 90 }}>
          Đặt lại
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
        setTimeout(() => this.searchInput.current?.focus(), 100)
      }
    }
  })

  columns: ColumnType<User>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.first.localeCompare(b.name.first),
      render: (_, record) => `${record.name.first} ${record.name.last}`,
      width: '30%',
      ...this.getColumnSearchProps('name')
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
      ...this.getColumnSearchProps('email')
    }
  ]

  handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: keyof User) => {
    confirm()
    const searchText = selectedKeys[0].toLowerCase()
    const filteredData = this.state.data.filter((item) => {
      if (dataIndex === 'name') {
        return item.name.first.toLowerCase().includes(searchText) || item.name.last.toLowerCase().includes(searchText)
      }
      return item[dataIndex]?.toString().toLowerCase().includes(searchText)
    })
    this.setState({ filteredData })
  }

  handleReset = (clearFilters?: () => void) => {
    clearFilters?.()
    this.setState({ filteredData: this.state.data })
  }

  handleTableChange = (pagination: TablePaginationConfig) => {
    this.setState({ pagination })
  }

  fetch = async () => {
    this.setState({ tableLoading: true })
    try {
      const response = await fetch('https://randomuser.me/api/?results=10')
      const result = await response.json()
      this.setState({
        data: result.results,
        filteredData: result.results,
        pagination: { total: result.results.length },
        tableLoading: false
      })
    } catch (error) {
      console.error('Fetch error:', error)
      this.setState({ tableLoading: false })
    }
  }

  render() {
    return (
      <Content style={{ padding: '50px 50px' }}>
        <Table
          columns={this.columns}
          rowKey={(record) => record?.login?.uuid || record?.email}
          dataSource={this.state.filteredData}
          pagination={this.state.pagination}
          loading={this.state.tableLoading}
          onChange={this.handleTableChange}
        />
      </Content>
    )
  }
}

export default ClientList
