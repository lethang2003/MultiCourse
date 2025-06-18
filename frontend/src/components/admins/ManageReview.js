import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Dropdown, 
  Table, 
  Tag, 
  Card, 
  Space, 
  Typography, 
  Button, 
  Input, 
  Select, 
  Row, 
  Col, 
  message,
  Collapse
} from 'antd';
import { toast, ToastContainer } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import { 
  EllipsisOutlined, 
  CheckOutlined, 
  StopOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  StarFilled,
  FilterOutlined,
  SortAscendingOutlined,
  CommentOutlined,
  BookOutlined,
  ReadOutlined,
  LikeOutlined,
  DislikeOutlined,
  DownOutlined,
  UpOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

export default function ManageReview() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    rating: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null
  });
  const token = localStorage.getItem('authToken');
  const { theme } = useTheme();

  useEffect(() => {
    fetchComments();
  }, [token]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'http://localhost:3000/api/comments/show-all-comments', 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(response.data.comments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      message.error('Failed to load comments');
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply filters
  const filteredData = comments.filter((comment) => {
    // Text search filter
    const matchesSearch = 
      comment.author.toLowerCase().includes(searchText.toLowerCase()) ||
      (comment.type === 'course' ? comment.courseTitle : comment.lessonTitle)
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      comment.comment.toLowerCase().includes(searchText.toLowerCase());

    // Type filter
    const matchesType = filters.type === 'all' || comment.type === filters.type;

    // Status filter
    const matchesStatus = 
      filters.status === 'all' || 
      (filters.status === 'active' && comment.status) || 
      (filters.status === 'inactive' && !comment.status);

    // Rating filter
    const matchesRating = 
      filters.rating === 'all' || 
      (filters.rating === '5' && comment.rating === 5) ||
      (filters.rating === '4' && comment.rating === 4) ||
      (filters.rating === '3' && comment.rating === 3) ||
      (filters.rating === '2' && comment.rating === 2) ||
      (filters.rating === '1' && comment.rating === 1);

    return matchesSearch && matchesType && matchesStatus && matchesRating;
  });

  // Apply sorting
  const sortedData = sortConfig.key
    ? [...filteredData].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      })
    : filteredData;

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <SortAscendingOutlined className="opacity-30" />;
    }
    return sortConfig.direction === 'asc' ? (
      <SortAscendingOutlined />
    ) : (
      <SortAscendingOutlined className="rotate-180" />
    );
  };

  // Calculate review statistics
  const totalReviews = comments.length;
  const activeReviews = comments.filter(comment => comment.status).length;
  const inactiveReviews = totalReviews - activeReviews;
  
  const courseReviews = comments.filter(comment => comment.type === 'course').length;
  const lessonReviews = comments.filter(comment => comment.type === 'lesson').length;
  
  // Calculate star ratings
  const fiveStarReviews = comments.filter(comment => comment.rating === 5).length;
  const fourStarReviews = comments.filter(comment => comment.rating === 4).length;
  const threeStarReviews = comments.filter(comment => comment.rating === 3).length;
  const twoStarReviews = comments.filter(comment => comment.rating === 2).length;
  const oneStarReviews = comments.filter(comment => comment.rating === 1).length;
  const lowStarReviews = twoStarReviews + oneStarReviews;
  
  // Calculate average rating
  const totalRatingSum = comments.reduce((sum, comment) => sum + comment.rating, 0);
  const averageRating = totalReviews > 0 ? (totalRatingSum / totalReviews).toFixed(1) : 0;

  const toggleExpandRow = (record) => {
    const key = record.commentId;
    if (expandedRowKeys.includes(key)) {
      setExpandedRowKeys(expandedRowKeys.filter(k => k !== key));
    } else {
      setExpandedRowKeys([...expandedRowKeys, key]);
    }
  };

  const columns = [
    {
      title: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort('type')}>
          Type 
          {/* {getSortIcon('type')} */}
        </div>
      ),
      dataIndex: 'type',
      key: 'type',
      sorter: true,
      render: (type) => (
        <Tag color={type === 'course' ? 'blue' : 'purple'} className="capitalize px-3 py-1">
          {type}
        </Tag>
      ),
    },
    {
      title: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort('author')}>
          Full Name 
          {/* {getSortIcon('author')} */}
        </div>
      ),
      dataIndex: 'author',
      key: 'author',
      sorter: true,
      render: (author) => <Text strong>{author}</Text>,
    },
    {
      title: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort('courseTitle')}>
          Course Name 
          {/* {getSortIcon('courseTitle')} */}
        </div>
      ),
      dataIndex: 'courseTitle',
      key: 'courseTitle',
      sorter: true,
      render: (title) => (
        <Text className="max-w-xs line-clamp-1">
          {title}
        </Text>
      ),
    },
    {
      title: 'Feedback',
      key: 'feedback',
      render: (_, record) => (
        <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => toggleExpandRow(record)}>
          <div className="flex items-center">
            {/* <div className="flex mr-3">
              {[...Array(5)].map((_, i) => (
                <StarFilled 
                  key={i} 
                  className={`text-lg ${i < record.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div> */}
            {/* <Text className="line-clamp-1 max-w-[150px]">
              {record.comment}
            </Text> */}
              <Button 
            type="text" 
            icon={expandedRowKeys.includes(record.commentId) ? <UpOutlined /> : <DownOutlined />}
            className="ml-2" 
          />
          </div>
        
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort('status')}>
          Status 
          {/* {getSortIcon('status')} */}
        </div>
      ),
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (status) => (
        status 
          ? <Tag color="success" icon={<CheckOutlined />} className="px-3 py-1">Active</Tag>
          : <Tag color="error" icon={<StopOutlined />} className="px-3 py-1">Inactive</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <DropDownMenu record={record} fetchComments={fetchComments} />
      ),
    },
  ];

  const data = sortedData.map((comment) => ({
    key: comment.commentId,
    author: comment.author,
    courseTitle: comment.type === 'course' ? comment.courseTitle : comment.lessonTitle,
    comment: comment.comment,
    rating: comment.rating,
    status: comment.status,
    type: comment.type,
    commentId: comment.commentId,
  }));

  const expandedRowRender = (record) => {
    return (
      <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="flex mb-2">
          <div className="flex mr-3">
            {[...Array(5)].map((_, i) => (
              <StarFilled 
                key={i} 
                className={`text-lg ${i < record.rating ? 'text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <Text strong className={theme === 'dark' ? 'text-white' : ''}>
            {record.rating}/5
          </Text>
        </div>
        <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          {record.comment}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} p-6`}>
      <Card 
        className={`shadow-lg rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}
        bordered={false}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <Title level={2} className={`m-0 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Manage Reviews
          </Title>
          <div className="flex items-center mt-4 sm:mt-0 space-x-4 w-full sm:w-auto">
            <Input
              placeholder="Search reviews..."
              prefix={<SearchOutlined className="text-gray-400" />}
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-md w-full sm:w-64"
              allowClear
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchComments}
              className={`flex items-center ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Review Statistics */}
        <div className="mb-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6} md={4}>
              <Card className={`text-center p-3 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border border-blue-100'}`}>
                <CommentOutlined className={`text-2xl mb-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-700'}`}>
                  {totalReviews}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>
                  Total
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Card className={`text-center p-3 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border border-green-100'}`}>
                <LikeOutlined className={`text-2xl mb-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-green-700'}`}>
                  {activeReviews}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-green-700'}`}>
                  Active
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Card className={`text-center p-3 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-red-50 border border-red-100'}`}>
                <DislikeOutlined className={`text-2xl mb-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
                <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-red-700'}`}>
                  {inactiveReviews}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-red-700'}`}>
                  Inactive
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Card className={`text-center p-3 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-indigo-50 border border-indigo-100'}`}>
                <BookOutlined className={`text-2xl mb-1 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-500'}`} />
                <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-indigo-700'}`}>
                  {courseReviews}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-indigo-700'}`}>
                  Course
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Card className={`text-center p-3 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-purple-50 border border-purple-100'}`}>
                <ReadOutlined className={`text-2xl mb-1 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
                <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-purple-700'}`}>
                  {lessonReviews}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-purple-700'}`}>
                  Lesson
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Card className={`text-center p-3 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-yellow-50 border border-yellow-100'}`}>
                <StarFilled className={`text-2xl mb-1 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
                <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-yellow-700'}`}>
                  {averageRating}/5
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-yellow-700'}`}>
                  Avg Rating
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Star Rating Distribution */}
        <div className="mb-6">
          <div className={`flex justify-between items-center p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-amber-50 border border-amber-100'}`}>
            <div className="flex space-x-6">
              <div className="text-center">
                <div className="flex">
                  <StarFilled className="text-yellow-400" />
                  <StarFilled className="text-yellow-400" />
                  <StarFilled className="text-yellow-400" />
                  <StarFilled className="text-yellow-400" />
                  <StarFilled className="text-yellow-400" />
                </div>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-amber-700'}`}>
                  {fiveStarReviews}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-amber-600'}`}>
                  {totalReviews > 0 ? ((fiveStarReviews/totalReviews)*100).toFixed(1) : 0}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex">
                  <StarFilled className="text-yellow-400" />
                  <StarFilled className="text-yellow-400" />
                  <StarFilled className="text-yellow-400" />
                  <StarFilled className="text-yellow-400" />
                  <StarFilled className="text-gray-300" />
                </div>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-amber-700'}`}>
                  {fourStarReviews}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-amber-600'}`}>
                  {totalReviews > 0 ? ((fourStarReviews/totalReviews)*100).toFixed(1) : 0}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex">
                  <StarFilled className="text-yellow-400" />
                  <StarFilled className="text-yellow-400" />
                  <StarFilled className="text-yellow-400" />
                  <StarFilled className="text-gray-300" />
                  <StarFilled className="text-gray-300" />
                </div>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-amber-700'}`}>
                  {threeStarReviews}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-amber-600'}`}>
                  {totalReviews > 0 ? ((threeStarReviews/totalReviews)*100).toFixed(1) : 0}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex">
                  <StarFilled className="text-yellow-400" />
                  <StarFilled className="text-yellow-400" />
                  <StarFilled className="text-gray-300" />
                  <StarFilled className="text-gray-300" />
                  <StarFilled className="text-gray-300" />
                </div>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-amber-700'}`}>
                  {twoStarReviews}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-amber-600'}`}>
                  {totalReviews > 0 ? ((twoStarReviews/totalReviews)*100).toFixed(1) : 0}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex">
                  <StarFilled className="text-yellow-400" />
                  <StarFilled className="text-gray-300" />
                  <StarFilled className="text-gray-300" />
                  <StarFilled className="text-gray-300" />
                  <StarFilled className="text-gray-300" />
                </div>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-amber-700'}`}>
                  {oneStarReviews}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-amber-600'}`}>
                  {totalReviews > 0 ? ((oneStarReviews/totalReviews)*100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
            
            <div className={`flex items-center px-4 py-2 rounded-full ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border border-amber-200'}`}>
              <StarFilled className="text-yellow-400 text-xl mr-2" />
              <div>
                <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-amber-700'}`}>
                  {averageRating}
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-amber-700'}`}>
                  out of 5
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Area */}
        <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex items-center mb-2">
            <FilterOutlined className="mr-2" />
            <Text strong className={theme === 'dark' ? 'text-white' : ''}>
              Filters
            </Text>
          </div>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8} md={6}>
              <div className="mb-2">
                <Text className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Review Type
                </Text>
                <Select
                  value={filters.type}
                  onChange={(value) => handleFilterChange('type', value)}
                  style={{ width: '100%' }}
                  className="rounded-md"
                >
                  <Option value="all">All Types</Option>
                  <Option value="course">Course</Option>
                  <Option value="lesson">Lesson</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <div className="mb-2">
                <Text className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Status
                </Text>
                <Select
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  style={{ width: '100%' }}
                  className="rounded-md"
                >
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <div className="mb-2">
                <Text className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  Rating
                </Text>
                <Select
                  value={filters.rating}
                  onChange={(value) => handleFilterChange('rating', value)}
                  style={{ width: '100%' }}
                  className="rounded-md"
                >
                  <Option value="all">All Ratings</Option>
                  <Option value="5">5 Stars</Option>
                  <Option value="4">4 Stars</Option>
                  <Option value="3">3 Stars</Option>
                  <Option value="2">2 Stars</Option>
                  <Option value="1">1 Star</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={8} md={6} className="mt-[26px] items-end">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => setFilters({ type: 'all', status: 'all', rating: 'all' })}
                className={`w-full ${theme === 'dark' ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Reset Filters
              </Button>
            </Col>
          </Row>
        </div>

        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading}
          expandable={{
            expandedRowKeys: expandedRowKeys,
            expandedRowRender: expandedRowRender,
            onExpand: (expanded, record) => toggleExpandRow(record),
            expandRowByClick: false
          }}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            className: `${theme === 'dark' ? 'text-white' : 'text-gray-800'}`
          }}
          className={`${theme === 'dark' ? 'ant-table-dark' : ''}`}
          rowClassName={(record) => !record.status ? 'opacity-60 ' + (theme === 'dark' ? 'bg-red-900 bg-opacity-20' : 'bg-red-50') : ''}
          scroll={{ x: 'max-content' }}
          footer={() => (
            <div className="flex justify-between items-center text-gray-500">
              <span>Showing {filteredData.length} of {totalReviews} reviews</span>
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
          )}
        />
      </Card>
      <ToastContainer theme={theme === "dark" ? "dark" : "light"} />
    </div>
  );
}

const DropDownMenu = ({ record, fetchComments }) => {
  const token = localStorage.getItem('authToken');
  const { theme } = useTheme();

  const toggleCommentStatus = async (type, commentId) => {
    try {
      const url = type === 'course' 
        ? `http://localhost:3000/api/comments/change-course-comment-status/${commentId}`
        : `http://localhost:3000/api/comments/change-lesson-comment-status/${commentId}`;
      
      await axios.put(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      fetchComments();
      message.success('Comment status updated successfully');
    } catch (error) {
      console.error('Error updating comment status:', error);
      message.error('Error updating comment status');
    }
  };

  const items = [
    {
      key: '1',
      label: (
        <div 
          onClick={() => toggleCommentStatus(record.type, record.commentId)}
          className={`flex items-center gap-2 px-4 py-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-md transition-colors duration-150`}
        >
          {record.status ? (
            <>
              <StopOutlined className="text-red-500" />
              <span>Ban</span>
            </>
          ) : (
            <>
              <CheckOutlined className="text-green-500" />
              <span>Unban</span>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
      <Button
        type="text"
        icon={<EllipsisOutlined className="text-lg" />}
        className={`flex items-center justify-center w-8 h-8 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
      />
    </Dropdown>
  );
};