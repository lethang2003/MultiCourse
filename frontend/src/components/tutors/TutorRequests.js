import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Modal, Typography, Tag, Tooltip, Dropdown, Space, Input, Select, DatePicker, Row, Col, Card, List, message } from 'antd';
import { 
  ExclamationCircleOutlined, 
  ReloadOutlined, 
  EyeOutlined, 
  StopOutlined,
  MoreOutlined,
  FilterOutlined,
  SearchOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';


const { Title, Text } = Typography;
const { confirm } = Modal;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Add these styles at the top of your component file
const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  card: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    border: 'none',
    padding: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  titleContainer: {
    marginBottom: 0
  },
  table: {
    backgroundColor: '#ffffff'
  },
  filterCard: {
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    borderRadius: '8px'
  },
  filterRow: {
    marginBottom: '16px'
  },
  changeIcon: {
    cursor: 'pointer',
    fontSize: '20px',
    color: '#1890ff',
    transition: 'all 0.3s'
  },
  modalTag: {
    marginBottom: '8px',
    fontSize: '14px',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    maxWidth: '100%'
  },
  modalItem: {
    marginBottom: '8px',
    wordBreak: 'break-word'
  }
};

const TutorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChanges, setSelectedChanges] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedRequestType, setSelectedRequestType] = useState('');

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateRange, setDateRange] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Sorting states
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, searchText, statusFilter, typeFilter, dateRange]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:3000/api/requests/requests-by-user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Request list:", response.data);
      setRequests(response.data);
      setFilteredRequests(response.data);
    } catch (error) {
      message.error('Failed to fetch requests: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...requests];

    // Apply search filter to course title
    if (searchText) {
      result = result.filter(request => 
        request.course_title.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(request => request.status === statusFilter);
    }

    // Apply request type filter
    if (typeFilter !== 'All') {
      result = result.filter(request => request.request_type === typeFilter);
    }

    // Apply date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day').valueOf();
      const endDate = dateRange[1].endOf('day').valueOf();
      
      result = result.filter(request => {
        const requestDate = new Date(request.request_date).getTime();
        return requestDate >= startDate && requestDate <= endDate;
      });
    }

    setFilteredRequests(result);
  };

  const resetFilters = () => {
    setSearchText('');
    setStatusFilter('All');
    setTypeFilter('All');
    setDateRange(null);
  };

  const handleCancel = (requestId) => {
    confirm({
      title: 'Are you sure you want to cancel this request?',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: 'This action cannot be undone.',
      okText: 'Yes, Cancel',
      okType: 'danger',
      cancelText: 'No',
      async onOk() {
        try {
          console.log("req id:", requestId);
          const token = localStorage.getItem('authToken');
          await axios.post(`http://localhost:3000/api/requests/cancel-request/${requestId}`, 
            { request_id: requestId },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          message.success('Request cancelled successfully');
          fetchRequests();
        } catch (error) {
          message.error('Failed to cancel request: ' + (error.response?.data?.message || error.message));
        }
      }
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { status: 'processing', color: 'blue' },
      'Approved': { status: 'success', color: 'green' },
      'Rejected': { status: 'error', color: 'red' },
      'Canceled': { status: 'default', color: 'gray' }
    };
    
    const config = statusConfig[status] || statusConfig['Pending'];
    
    return <Badge status={config.status} text={status} />;
  };

  // Show change details in modal
  const showChangeDetails = (content, course_title, request_type) => {
    setSelectedChanges(content || []);
    setSelectedCourse(course_title);
    setSelectedRequestType(request_type);
    setModalVisible(true);
  };

  const renderContentIcon = (content, record) => {
    if (!content || !Array.isArray(content) || content.length === 0) {
      return <Text type="secondary">No content</Text>;
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Tooltip title="View change details">
          <EyeOutlined 
            style={styles.changeIcon} 
            onClick={() => showChangeDetails(content, record.course_title, record.request_type)}
            className="changes-icon"
          />
        </Tooltip>
      </div>
    );
  };

  const getRowClassName = (record) => {
    switch(record.status) {
      case 'Pending':
        return 'ant-table-row-pending';
      case 'Approved':
        return 'ant-table-row-approved';
      case 'Rejected':
        return 'ant-table-row-rejected';
      default:
        return '';
    }
  };

  const getActionMenu = (record) => {
    const items = [];
    
    if (record.status === 'Pending') {
      items.push({
        key: 'cancel',
        icon: <StopOutlined />,
        label: 'Cancel Request',
        danger: true,
        onClick: () => handleCancel(record._id)
      });
    }
    
    return items;
  };

  // Get unique request types for filter
  const getRequestTypes = () => {
    if (!requests.length) return [];
    const types = [...new Set(requests.map(r => r.request_type))];
    return types;
  };

  const columns = [
    {
      title: 'Course',
      dataIndex: 'course_title',
      key: 'course_title',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.course_title.localeCompare(b.course_title)
    },
    {
      title: 'Request Type',
      dataIndex: 'request_type',
      key: 'request_type',
      render: (type) => (
        <Tag color={type.includes('Created') ? 'green' : 'blue'}>
          {type}
        </Tag>
      ),
      sorter: (a, b) => a.request_type.localeCompare(b.request_type)
    },
    {
      title: 'Changes',
      dataIndex: 'content',
      key: 'content',
      render: (content, record) => renderContentIcon(content, record),
      align: 'center',
      width: '100px'
    },
    {
      title: 'Date',
      dataIndex: 'request_date',
      key: 'request_date',
      render: (date) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </Tooltip>
      ),
      sorter: (a, b) => new Date(a.request_date) - new Date(b.request_date)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusBadge(status),
      sorter: (a, b) => a.status.localeCompare(b.status)
    },
    // {
    //   title: 'Actions',
    //   key: 'actions',
    //   width: '80px',
    //   render: (_, record) => (
    //     <Dropdown
    //       menu={{ items: getActionMenu(record) }}
    //       placement="bottomRight"
    //       trigger={['click']}
    //     >
    //       <Button type="text" icon={<MoreOutlined />} />
    //     </Dropdown>
    //   )
    // }
  ];

  // Custom styles to add to your CSS file
  const customStyles = `
    .ant-table-row-pending {
      background-color: #e6f7ff1a;
    }
    
    .ant-table-row-approved {
      background-color: #f6ffed1a;
    }
    
    .ant-table-row-rejected {
      background-color: #fff2f01a;
    }
    
    .changes-icon:hover {
      color: #40a9ff;
      transform: scale(1.2);
    }
    
    .ant-modal-body {
      max-height: 60vh;
      overflow-y: auto;
    }
  `;

  // Get appropriate color for change value based on its type
  const getChangeValueColor = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('add') || lowerTitle.includes('create'))
      return 'green';
    if (lowerTitle.includes('remove') || lowerTitle.includes('delete'))
      return 'red';
    if (lowerTitle.includes('update') || lowerTitle.includes('change'))
      return 'blue';
    return 'default';
  };

  return (
    <div style={styles.container}>
      {/* Include the custom styles */}
      <style>{customStyles}</style>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <Title level={3} style={styles.titleContainer}>Requests List</Title>
            <Text type="secondary">Manage your course requests</Text>
          </div>
          <Space>
            <Button 
              icon={<FilterOutlined />} 
              onClick={() => setShowFilters(!showFilters)}
              type={showFilters ? "primary" : "default"}
            >
              Filters
            </Button>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={fetchRequests}
            >
              Refresh
            </Button>
          </Space>
        </div>
        
        {/* Filters Card */}
        {showFilters && (
          <Card style={styles.filterCard}>
            <Row gutter={16} style={styles.filterRow}>
              <Col xs={24} sm={12} md={6}>
                <Input
                  placeholder="Search by course title"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Filter by status"
                  style={{ width: '100%' }}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                >
                  <Option value="All">All Statuses</Option>
                  <Option value="Pending">Pending</Option>
                  <Option value="Approved">Approved</Option>
                  <Option value="Rejected">Rejected</Option>
                  <Option value="Canceled">Canceled</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Filter by type"
                  style={{ width: '100%' }}
                  value={typeFilter}
                  onChange={(value) => setTypeFilter(value)}
                >
                  <Option value="All">All Types</Option>
                  {getRequestTypes().map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <RangePicker
                  style={{ width: '100%' }}
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                />
              </Col>
            </Row>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button onClick={resetFilters}>Reset Filters</Button>
              </Col>
            </Row>
          </Card>
        )}
        
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={filteredRequests}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} requests`
            }}
            style={styles.table}
            rowClassName={getRowClassName}
            onChange={(pagination, filters, sorter) => {
              if (sorter.field && sorter.order) {
                setSortField(sorter.field);
                setSortOrder(sorter.order);
              } else {
                setSortField(null);
                setSortOrder(null);
              }
            }}
          />
        </div>
      </div>
      
      {/* Modal for displaying change details */}
      <Modal
        title={
          <div>
            <Space>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
              <span>Change Details</span>
            </Space>
            <Text strong style={{ display: 'block', marginTop: '8px' }}>
              {selectedCourse} - {selectedRequestType && 
                <Tag color={selectedRequestType.includes('Created') ? 'green' : 'blue'}>
                  {selectedRequestType}
                </Tag>
              }
            </Text>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        <List
          itemLayout="vertical"
          dataSource={selectedChanges}
          renderItem={(item) => (
            <List.Item style={styles.modalItem}>
              <div style={{ marginBottom: '8px' }}>
                <Tag 
                  color="default" 
                  style={{ fontWeight: 'bold', fontSize: '14px' }}
                >
                  {item.title}
                </Tag>
              </div>
              <div>
                <Tag 
                  color={getChangeValueColor(item.title)} 
                  style={styles.modalTag}
                >
                  {item.value}
                </Tag>
              </div>
            </List.Item>
          )}
          locale={{ emptyText: 'No changes to display' }}
          style={{ width: '100%' }}
        />
      </Modal>
      
      <ToastContainer />
    </div>
  );
};

export default TutorRequests;