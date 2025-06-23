import { Space, Table, Tag, Spin, Alert, Card, Typography, message } from 'antd';
import React from 'react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

const { Title } = Typography;

export default function BuyerHistoryTutor() {
  const [buyerHistoryData, setBuyerHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('authToken');
  
  const fetchBuyerHistory = async () => {
    try {
      const response = await fetch('https://multicourse-q1mn.onrender.com/api/orders/buyers-history-tutor', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch buyer history');
      }
      
      const data = await response.json();
      setBuyerHistoryData(data);
      setLoading(false);
    }
    catch (error) {
      // console.error('Error fetching history:', error);
      message.error('Unable to load buyer history data. Please try again later.');
      setError(error.message || 'An error occurred');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBuyerHistory();
  }, []);

  // Transform the API data to match table columns
  // We need to flatten the nested structure for the table
  const tableData = [];
  
  buyerHistoryData.forEach(item => {
    const courseName = item.course?.title || 'N/A';
    const courseId = item.course?._id || 'unknown';
    
    if (item.buyers && item.buyers.length > 0) {
      item.buyers.forEach(buyer => {
        tableData.push({
          key: `${courseId}-${buyer._id}`,
          courseName: courseName,
          buyerName: buyer.fullname || 'N/A',
          buyerEmail: buyer.email || 'N/A',
          purchaseDate: buyer.order_date ? format(new Date(buyer.order_date), 'dd/MM/yyyy HH:mm') : 'N/A',
        });
      });
    }
  });

  const columns = [
    {
      title: 'Course Name',
      dataIndex: 'courseName',
      key: 'courseName',
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
    },
    {
      title: 'Buyer Name',
      dataIndex: 'buyerName',
      key: 'buyerName',
      sorter: (a, b) => a.buyerName.localeCompare(b.buyerName),
    },
    {
      title: 'Email',
      dataIndex: 'buyerEmail',
      key: 'buyerEmail',
      ellipsis: true,
    },
    {
      title: 'Purchase Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      sorter: (a, b) => {
        const dateA = new Date(a.purchaseDate);
        const dateB = new Date(b.purchaseDate);
        return dateB - dateA; // Sort in descending order (newest first)
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag color="green">Purchased</Tag>
      ),
    }
  ];
  
  if (loading) {
    return (
      <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <Spin size="large" tip="Loading buyer history..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
        <Alert
          message="Error Loading Buyer History"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }
  
  return (
    <Card 
      style={{ 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
        overflow: 'hidden'
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
        Buyer History
      </Title>
      
      <Table 
        columns={columns} 
        dataSource={tableData}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Total ${total} purchases` 
        }}
        rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
        className="buyer-history-table"
        locale={{
          emptyText: 'No purchase history found'
        }}
      />
      
      <style jsx="true">{`
        .buyer-history-table .table-row-light {
          background-color: #fff;
        }
        .buyer-history-table .table-row-dark {
          background-color: #f9f9f9;
        }
        .buyer-history-table .ant-table-row:hover {
          background-color: #e6f7ff !important;
        }
        .buyer-history-table .ant-pagination {
          margin-top: 16px;
        }
      `}</style>
    </Card>
  );
}