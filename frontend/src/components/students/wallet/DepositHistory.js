import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Select,
  DatePicker,
  Spin,
  Alert,
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Space,
  Layout,
  Tag,
  Empty,
  Divider,
  Badge,
  Tooltip,
  Breadcrumb
} from "antd";
import moment from "moment";
import { 
  SwapOutlined, 
  DollarCircleOutlined, 
  HistoryOutlined, 
  FilterOutlined, 
  CalendarOutlined, 
  SortAscendingOutlined, 
  SortDescendingOutlined,
  ClockCircleOutlined,
  BankOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  HomeOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { Content } = Layout;

const DepositHistory = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchDepositHistory();
  }, []);

  const fetchDepositHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        "https://multicourse-q1mn.onrender.com/api/wallet/deposit-history",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setDeposits(response.data.deposits);
      } else {
        setError("Không thể lấy lịch sử nạp tiền");
      }
    } catch (error) {
      setError("Lỗi khi lấy lịch sử nạp tiền");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        gap: 16 
      }}>
        <Alert 
          message="Đã xảy ra lỗi" 
          description={error} 
          type="error" 
          showIcon 
          style={{ maxWidth: 500 }}
        />
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => window.location.reload()}
        >
          Tải lại trang
        </Button>
      </div>
    );
  }

  let filteredDeposits = [...deposits];

  if (selectedDate) {
    filteredDeposits = filteredDeposits.filter((d) =>
      moment(d.payment_date).isSameOrAfter(selectedDate, "day")
    );
  }

  if (sortOrder === "asc") {
    filteredDeposits.sort((a, b) => a.payment_amount - b.payment_amount);
  } else if (sortOrder === "desc") {
    filteredDeposits.sort((a, b) => b.payment_amount - a.payment_amount);
  }

  const totalDeposits = filteredDeposits.length;
  const totalPaymentAmount = filteredDeposits.reduce(
    (total, deposit) => total + deposit.payment_amount,
    0
  );

  const columns = [
    { 
      title: "ID", 
      dataIndex: "order_code", 
      key: "order_code",
      render: (text) => (
        <Tag color="blue">{text}</Tag>
      ),
      width: 150
    },
    { 
      title: "Description", 
      dataIndex: "description", 
      key: "description",
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 250 }}>
            {text}
          </Text>
        </Tooltip>
      ),
      width: '40%'
    },
    {
      title: "Amount",
      dataIndex: "payment_amount",
      key: "payment_amount",
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          {amount.toLocaleString()} VNĐ
        </Text>
      ),
      sorter: (a, b) => a.payment_amount - b.payment_amount,
      width: 150,
      align: 'right'
    },
    {
      title: "Date",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (date) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#1890ff' }} />
          {moment(date).format("DD/MM/YYYY HH:mm")}
        </Space>
      ),
      sorter: (a, b) => moment(a.payment_date) - moment(b.payment_date),
      width: 180
    },
  ];

  const sortOptions = [
    { value: 'all', label: 'Default Order', icon: <FilterOutlined /> },
    { value: 'asc', label: 'Amount (Low to High)', icon: <SortAscendingOutlined /> },
    { value: 'desc', label: 'Amount (High to Low)', icon: <SortDescendingOutlined /> },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Sử dụng Card thay thế cho PageHeader */}
          <Card
            style={{ 
              marginBottom: 24, 
              borderRadius: 8, 
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Breadcrumb items={[
                  { title: <HomeOutlined /> },
                  { title: 'Wallet' },
                  { title: 'Deposit History' }
                ]} />
                <Title level={2} style={{ margin: '16px 0 0 0' }}>Deposit History</Title>
                <Text type="secondary">Track all your deposit transactions</Text>
              </div>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchDepositHistory}
              >
                Refresh
              </Button>
            </div>
          </Card>

          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12}>
              <Card 
                hoverable 
                bordered={false}
                style={{ borderRadius: 8, overflow: 'hidden', height: '100%' }}
              >
                <Statistic
                  title={
                    <Space>
                      <SwapOutlined style={{ color: '#1890ff' }} />
                      <span>Total Transactions</span>
                    </Space>
                  }
                  value={totalDeposits}
                  prefix={<Badge status="processing" />}
                  valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card 
                hoverable 
                bordered={false}
                style={{ borderRadius: 8, overflow: 'hidden', height: '100%' }}
              >
                <Statistic
                  title={
                    <Space>
                      <DollarCircleOutlined style={{ color: '#52c41a' }} />
                      <span>Total Deposit Amount</span>
                    </Space>
                  }
                  value={totalPaymentAmount}
                  suffix="VNĐ"
                  valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                  precision={0}
                  formatter={(value) => `${value.toLocaleString()}`}
                />
              </Card>
            </Col>
          </Row>

          <Card 
            title={
              <Space>
                <HistoryOutlined />
                <span>Transaction Details</span>
              </Space>
            }
            extra={
              <Space size="middle">
                <DatePicker
                  onChange={(date) => setSelectedDate(date)}
                  placeholder="Filter by date"
                  allowClear
                  style={{ width: 180 }}
                  format="DD/MM/YYYY"
                  suffixIcon={<CalendarOutlined />}
                />
                <Select
                  value={sortOrder}
                  onChange={setSortOrder}
                  style={{ width: 220 }}
                  placeholder="Sort by"
                >
                  {sortOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      <Space>
                        {option.icon}
                        {option.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 8, overflow: 'hidden' }}
          >
            {filteredDeposits.length > 0 ? (
              <Table
                columns={columns}
                dataSource={filteredDeposits}
                pagination={{
                  pageSize: 10,
                  current: currentPage,
                  onChange: setCurrentPage,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '15', '20', '50'],
                  style: { marginTop: 16 }
                }}
                rowKey="_id"
                bordered
                size="middle"
                scroll={{ x: 800 }}
                expandable={{
                  expandedRowRender: record => (
                    <div style={{ padding: '0 20px' }}>
                      <Divider orientation="left" plain style={{ margin: '8px 0' }}>
                        <Text type="secondary">Transaction Details</Text>
                      </Divider>
                      <Row gutter={[16, 8]}>
                        <Col span={8}>
                          <Text type="secondary">Order Code:</Text>
                          <div><Tag color="blue">{record.order_code}</Tag></div>
                        </Col>
                        <Col span={8}>
                          <Text type="secondary">Payment Date:</Text>
                          <div>{moment(record.payment_date).format("DD/MM/YYYY HH:mm:ss")}</div>
                        </Col>
                        <Col span={8}>
                          <Text type="secondary">Amount:</Text>
                          <div>
                            <Text strong style={{ color: 'green' }}>
                              {record.payment_amount.toLocaleString()} VNĐ
                            </Text>
                          </div>
                        </Col>
                      </Row>
                      <Row style={{ marginTop: 8 }}>
                        <Col span={24}>
                          <Text type="secondary">Description:</Text>
                          <div>{record.description}</div>
                        </Col>
                      </Row>
                    </div>
                  ),
                }}
              />
            ) : (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="Không tìm thấy giao dịch nào"
              />
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default DepositHistory;