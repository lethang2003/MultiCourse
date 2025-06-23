import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Card,
  Spin,
  Alert,
  Typography,
  Tag,
  Space,
  Divider,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Statistic,
  message,
} from "antd";
import {
  ShoppingCartOutlined,
  HistoryOutlined,
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  DollarOutlined,
  BookOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function BuyerHistory() {
  const [buyerHistory, setBuyerHistory] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");

  // Summary statistics
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalBuyers: 0,
    totalRevenue: 0,
    uniqueCourses: 0,
  });

  // Filter states
  const [searchEmail, setSearchEmail] = useState("");
  const [searchCourseName, setSearchCourseName] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    const fetchBuyerHistory = async () => {
      try {
        const res = await axios.get(
          "https://multicourse-q1mn.onrender.com/api/orders/all-purchase-course",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setBuyerHistory(res.data);
        setFilteredData(res.data);
        calculateStatistics(res.data);
        // message.success("Fetched buyer history successfully");
        console.log("Buyer:", res.data);

        setLoading(false);
      } catch (error) {
        setError(error);
        message.error("Failed to fetch buyer history");
        setLoading(false);
      }
    };
    fetchBuyerHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchEmail, searchCourseName, priceRange, dateRange]);

  const calculateStatistics = (data) => {
    // Calculate total orders
    const totalOrders = data.length;

    // Calculate unique buyers
    const uniqueBuyerEmails = new Set();
    data.forEach((order) => {
      order.buyers.forEach((buyer) => {
        uniqueBuyerEmails.add(buyer.email);
      });
    });
    const totalBuyers = uniqueBuyerEmails.size;

    // Calculate total revenue
    let totalRevenue = 0;
    data.forEach((order) => {
      const price = parseFloat(order.course.price);
      if (!isNaN(price)) {
        totalRevenue += price * order.buyers.length;
      }
    });

    // Calculate unique courses
    const uniqueCourseIds = new Set();
    data.forEach((order) => {
      uniqueCourseIds.add(order.course._id);
    });
    const uniqueCourses = uniqueCourseIds.size;

    setStatistics({
      totalOrders,
      totalBuyers,
      totalRevenue,
      uniqueCourses,
    });
  };

  const applyFilters = () => {
    let filtered = buyerHistory;

    // Filter by email
    if (searchEmail) {
      filtered = filtered.filter((order) =>
        order.buyers.some((buyer) =>
          buyer.email.toLowerCase().includes(searchEmail.toLowerCase())
        )
      );
    }

    // Filter by course name
    if (searchCourseName) {
      filtered = filtered.filter((order) =>
        order.course.title
          .toLowerCase()
          .includes(searchCourseName.toLowerCase())
      );
    }

    // Filter by price range
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter((order) => {
        const price = parseFloat(order.course.price);
        if (max) {
          return price >= min && price <= max;
        } else {
          return price >= min;
        }
      });
    }

    // Filter by date range
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.course.date);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    setFilteredData(filtered);
    calculateStatistics(filtered);
  };

  const resetFilters = () => {
    setSearchEmail("");
    setSearchCourseName("");
    setPriceRange("all");
    setDateRange(null);
    setFilteredData(buyerHistory);
    calculateStatistics(buyerHistory);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Loading data..." />
      </div>
    );

  if (error)
    return (
      <div className="p-4">
        <Alert
          message="Error"
          description={error.message}
          type="error"
          showIcon
        />
      </div>
    );

  const columns = [
    {
      title: "Buyer Email",
      dataIndex: "buyerEmail",
      key: "buyerEmail",
      sorter: (a, b) => a.buyerEmail[0].localeCompare(b.buyerEmail[0]),
      render: (emails) => (
        <Space direction="vertical" size="small">
          {emails.map((email, idx) => (
            <Tag color="blue" key={idx} className="px-2 py-1 text-sm">
              {email}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Course Name",
      dataIndex: "courseName",
      key: "courseName",
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => {
        const priceA = parseFloat(a.price.replace(" VND", ""));
        const priceB = parseFloat(b.price.replace(" VND", ""));
        return priceA - priceB;
      },
      render: (price) => (
        <Tag color="green" className="px-3 py-1">
          {price}
        </Tag>
      ),
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
      render: (date) => (
        <Text type="secondary" className="text-sm">
          {date}
        </Text>
      ),
    },
  ];

  const data = filteredData.map((order, index) => ({
    key: index,
    buyerEmail: order.buyers.map((buyer) => buyer.email),
    courseName: order.course.title,
    price: order.course.price + " VND",
    orderDate: new Date(order.course.date).toLocaleDateString(),
    rawDate: order.course.date, // For sorting
  }));

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Card className="shadow-xl rounded-lg overflow-hidden" bordered={false}>
        <div className="flex items-center justify-center mb-6">
          <HistoryOutlined className="text-blue-500 text-3xl mr-4" />
          <Title level={2} className="m-0 text-blue-800">
            Buyer History
          </Title>
        </div>

        {/* Statistics Counters */}
        <div className="mb-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card className="bg-blue-50 border-blue-200 shadow-md h-full">
                <Statistic
                  title={
                    <div className="text-blue-800 font-medium flex items-center">
                      <ShoppingCartOutlined className="mr-2" />
                      Total order
                    </div>
                  }
                  value={statistics.totalOrders}
                  valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="bg-green-50 border-green-200 shadow-md h-full">
                <Statistic
                  title={
                    <div className="text-green-800 font-medium flex items-center">
                      <UserOutlined className="mr-2" /> Total buyers
                    </div>
                  }
                  value={statistics.totalBuyers}
                  valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="bg-red-50 border-red-200 shadow-md h-full">
                <Statistic
                  title={
                    <div className="text-red-800 font-medium flex items-center">
                      <DollarOutlined className="mr-2" /> Total revenue
                    </div>
                  }
                  value={formatCurrency(statistics.totalRevenue)}
                  valueStyle={{ color: "#f5222d", fontWeight: "bold" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="bg-purple-50 border-purple-200 shadow-md h-full">
                <Statistic
                  title={
                    <div className="text-purple-800 font-medium flex items-center">
                      <BookOutlined className="mr-2" /> Number of courses
                    </div>
                  }
                  value={statistics.uniqueCourses}
                  valueStyle={{ color: "#722ed1", fontWeight: "bold" }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        <Divider className="mb-6" />

        {/* Filter section */}
        <Card className="mb-6 bg-gray-50">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Input
                placeholder="Search buyer email"
                prefix={<SearchOutlined />}
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} md={12}>
              <Input
                placeholder="Search course name"
                prefix={<SearchOutlined />}
                value={searchCourseName}
                onChange={(e) => setSearchCourseName(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                style={{ width: "100%" }}
                placeholder="Filter by price"
                value={priceRange}
                onChange={(value) => setPriceRange(value)}
              >
                <Option value="all">All prices</Option>
                <Option value="0-500000">0 - 500,000 VND</Option>
                <Option value="500000-1000000">500,000 - 1,000,000 VND</Option>
                <Option value="1000000-2000000">
                  1,000,000 - 2,000,000 VND
                </Option>
                <Option value="2000000">Over 2,000,000 VND</Option>
              </Select>
            </Col>
            <Col xs={24} md={10}>
              <RangePicker
                style={{ width: "100%" }}
                onChange={(dates) => setDateRange(dates)}
                value={dateRange}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} md={6}>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={resetFilters}
                style={{ width: "100%" }}
              >
                Refresh
              </Button>
            </Col>
          </Row>
        </Card>

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={data}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} buyers`,
            }}
            className="shadow-md"
            scroll={{ x: "max-content" }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <div className="flex items-center">
                      <CalendarOutlined className="mr-2" />
                      <Text type="secondary">
                        {statistics.totalOrders > 0
                          ? `Showing ${filteredData.length} orders (from total ${buyerHistory.length})`
                          : "No orders"}
                      </Text>
                    </div>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
      </Card>
    </div>
  );
}
