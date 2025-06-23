import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Table, Spin, Alert, Card, Typography, Tag, Badge, Empty, message } from 'antd';

const { Title } = Typography;

function ActivityHistoryTutor() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        const response = await axios.get('https://multicourse-q1mn.onrender.com/api/activities/tutor', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setActivities(response.data);
        setLoading(false);
      } catch (error) {
        // console.error('Error fetching activity history:', error);
        message.error('Unable to load activity history data. Please try again later.');
        setError('Unable to load activity history data. Please try again later.');
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Function to detect and place tags at the beginning of the description
  const processDescription = (text) => {
    if (!text) return null;
    
    // Keywords to highlight and their corresponding colors
    const keywords = {
      'create': 'green',
      'update': 'blue',
      'delete': 'red',
      'created': 'green',
      'updated': 'blue',
      'deleted': 'red',
      'add': 'green',
      'added': 'green',
      'remove': 'red',
      'removed': 'red',
      'modify': 'blue',
      'modified': 'blue',
      'change': 'blue',
      'changed': 'blue',
      'image': 'purple',
      'course': 'orange',
      'requested': 'pink',

    };
    
    // Create regex pattern from keywords
    const pattern = new RegExp(`\\b(${Object.keys(keywords).join('|')})\\b`, 'gi');
    
    // Find all keyword matches
    const matches = [...new Set(text.match(pattern) || [])];
    
    // Create tags for the beginning of the description
    const tags = matches.map((keyword, index) => {
      const lowercaseKeyword = keyword.toLowerCase();
      const color = keywords[lowercaseKeyword];
      return (
        <Tag 
          key={`tag-${index}`} 
          color={color}
          style={{ margin: '0 3px 0 0', padding: '0 5px' }}
        >
          {keyword}
        </Tag>
      );
    });
    
    // Return tags followed by the original text
    return (
      <div>
        <div style={{ marginBottom: '8px' }}>
          {tags.length > 0 ? tags : <Tag color="default">Info</Tag>}
        </div>
        <div>{text}</div>
      </div>
    );
  };

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <div style={{ lineHeight: '1.5em' }}>{processDescription(text)}</div>,
      width: '70%',
    },
    {
      title: 'Date',
      dataIndex: 'entry_date',
      key: 'entry_date',
      render: (text) => (
        <Badge status="processing" text={format(new Date(text), 'dd/MM/yyyy HH:mm')} />
      ),
      sorter: (a, b) => new Date(b.entry_date) - new Date(a.entry_date),
      width: '30%',
    },
  ];

  if (loading) {
    return (
      <Card className="activity-history-card" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Spin size="large" tip="Loading data..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="activity-history-card" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card 
      className="activity-history-card" 
      style={{ 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.09)' 
      }}
    >
      <Title 
        level={3} 
        style={{ 
          marginBottom: '24px', 
          borderBottom: '1px solid #f0f0f0', 
          paddingBottom: '16px',
          color: '#1890ff'
        }}
      >
        Activity History
      </Title>
      
      <Table
        dataSource={activities}
        columns={columns}
        rowKey="_id"
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Total ${total} activities` 
        }}
        locale={{
          emptyText: <Empty description="No activity data available" />
        }}
        rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
        style={{ 
          backgroundColor: '#fff',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
        className="activity-table"
      />
      
      <style jsx="true">{`
        .activity-table .table-row-light {
          background-color: #fff;
        }
        .activity-table .table-row-dark {
          background-color: #f9f9f9;
        }
        .activity-table .ant-table-row:hover {
          background-color: #e6f7ff !important;
        }
        .activity-table .ant-pagination {
          margin-top: 16px;
        }
      `}</style>
    </Card>
  );
}

export default ActivityHistoryTutor;