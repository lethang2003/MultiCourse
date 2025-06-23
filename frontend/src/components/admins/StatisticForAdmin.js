import React, { useEffect, useState } from "react";
import { 
  Table, 
  Card, 
  Statistic, 
  Layout, 
  Typography, 
  Spin, 
  Divider,
  DatePicker,
  Select,
  Input,
  Button,
  Space,
  Row,
  Col,
  Badge,
  message
} from "antd";
import { 
  DollarOutlined, 
  CalendarOutlined, 
  LineChartOutlined,
  ShoppingCartOutlined,
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined,
  RiseOutlined,
  TrophyOutlined,
  TeamOutlined,
  CreditCardOutlined,
  ArrowUpOutlined
} from "@ant-design/icons";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const StatisticForAdmin = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [revenueYear, setRevenueYear] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [dateRange, setDateRange] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [sortField, setSortField] = useState('order_date');
  const [sortDirection, setSortDirection] = useState('descend');

  const fetchData = async (url, setState) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setState(data);
    } catch (error) {
      message.error("Error fetching data");
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchData("https://multicourse-q1mn.onrender.com/api/orders/revenue", (data) =>
          setTotalRevenue(data.totalRevenue)
        ),
        fetchData("https://multicourse-q1mn.onrender.com/api/orders/revenue-day", (data) =>
          setRevenueToday(data.totalRevenueToday)
        ),
        fetchData("https://multicourse-q1mn.onrender.com/api/orders/revenue-year", (data) =>
          setRevenueYear(data.totalRevenueThisYear)
        ),
        fetchData("https://multicourse-q1mn.onrender.com/api/orders/revenue-each-month", setMonthlyRevenue),
        fetchData("https://multicourse-q1mn.onrender.com/api/orders/all-orders", (data) => {
          setOrders(data);
          setFilteredOrders(data);
        })
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [dateRange, searchText, priceRange, orders, sortField, sortDirection]);

  const extractPriceValue = (priceString) => {
    if (!priceString) return 0;
    return parseInt(priceString.replace(/[^\d]/g, ''));
  };

  const applyFilters = () => {
    let result = [...orders];
    
    // Apply date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day').valueOf();
      const endDate = dateRange[1].endOf('day').valueOf();
      result = result.filter(order => {
        const orderDate = new Date(order.order_date).valueOf();
        return orderDate >= startDate && orderDate <= endDate;
      });
    }
    
    // Apply search filter (on buyer name)
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter(order => 
        (order.user?.fullname || "Anonymous").toLowerCase().includes(lowerSearchText)
      );
    }
    
    // Apply price range filter
    if (priceRange) {
      result = result.filter(order => {
        const price = order.total_price;
        switch(priceRange) {
          case 'under100k':
            return price < 100000;
          case '100k-500k':
            return price >= 100000 && price <= 500000;
          case '500k-1m':
            return price >= 500000 && price <= 1000000;
          case 'over1m':
            return price > 1000000;
          case 'all':
          default:
            return true; // Không lọc nếu là 'all'
        }
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'buyer':
          const nameA = (a.user?.fullname || "Anonymous").toLowerCase();
          const nameB = (b.user?.fullname || "Anonymous").toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;
        case 'total_price':
          comparison = a.total_price - b.total_price;
          break;
        case 'order_date':
        default:
          comparison = new Date(a.order_date) - new Date(b.order_date);
          break;
      }
      
      return sortDirection === 'ascend' ? comparison : -comparison;
    });
    
    setFilteredOrders(result);
  };

  const resetFilters = () => {
    setDateRange(null);
    setSearchText('');
    setPriceRange('all'); // Thay vì setPriceRange(null)
    setSortField('order_date');
    setSortDirection('descend');
    setFilteredOrders(orders);
  };

  // Calculate additional statistics
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 
    ? Math.round(totalRevenue / totalOrders) 
    : 0;
  
  // Find top month
  const topMonth = monthlyRevenue.length > 0 
    ? monthlyRevenue.reduce((max, current) => 
        current.revenue > max.revenue ? current : max, 
        monthlyRevenue[0]
      ) 
    : { month: 'N/A', revenue: 0 };

  // This month revenue (assuming the monthlyRevenue is sorted)
  const currentMonthRevenue = monthlyRevenue.length > 0 
    ? monthlyRevenue[monthlyRevenue.length - 1].revenue 
    : 0;
  
  // Previous month revenue
  const previousMonthRevenue = monthlyRevenue.length > 1 
    ? monthlyRevenue[monthlyRevenue.length - 2].revenue 
    : 0;
  
  // Calculate growth percentage
  let monthlyGrowth;
  if (previousMonthRevenue === 0) {
    if (currentMonthRevenue > 0) {
      monthlyGrowth = 100; // Hoặc hiển thị "∞" nếu muốn thể hiện tăng trưởng vô hạn
    } else {
      monthlyGrowth = 0;
    }
  } else {
    monthlyGrowth = Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <Spin 
            size="large" 
            className="text-6xl mb-4"
            indicator={
              <LineChartOutlined 
                spin 
                className="text-blue-600 text-4xl animate-pulse" 
              />
            } 
          />
          <p className="text-gray-600 mt-4">Loading financial data...</p>
        </div>
      </div>
    );
  }

  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter) {
      setSortField(sorter.field);
      setSortDirection(sorter.order || 'descend');
    }
  };

  const columns = [
    {
      title: 'Buyer',
      dataIndex: 'buyer',
      key: 'buyer',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (text) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
            <span className="text-blue-600 font-bold">
              {text.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium text-gray-800">{text}</span>
        </div>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (text) => (
        <div className="text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full inline-block shadow-sm">
          {text}
        </div>
      )
    },
    {
      title: 'Order Date',
      dataIndex: 'order',
      key: 'order',
      sorter: true,
      defaultSortOrder: 'descend',
      sortDirections: ['ascend', 'descend'],
      render: (text) => (
        <div className="text-gray-600 bg-gray-50 px-3 py-1 rounded-full inline-block border border-gray-200">
          <CalendarOutlined className="mr-1 text-gray-500" />
          {text}
        </div>
      )
    }
  ];

  const data = filteredOrders.map((order) => ({
    key: order._id,
    buyer: order.user?.fullname || "Anonymous",
    amount: `${order.total_price.toLocaleString()} VND`,
    order: new Date(order.order_date).toLocaleDateString(),
    rawData: order // keeping the raw data for sorting
  }));

  // Price range options for select
  const priceRangeOptions = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under 100,000 VND', value: 'under100k' },
    { label: '100,000 - 500,000 VND', value: '100k-500k' },
    { label: '500,000 - 1,000,000 VND', value: '500k-1m' },
    { label: 'Over 1,000,000 VND', value: 'over1m' }
  ];

  // Format currency function
  const formatCurrency = (value) => {
    return value.toLocaleString() + ' VND';
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Content className="max-w-7xl mx-auto w-full">
        <div className="mb-8 flex justify-between items-center">
          <Title 
            level={2} 
            className="text-gray-800 flex items-center gap-3 m-0"
          >
            <LineChartOutlined className="text-blue-600" />
            Revenue Dashboard
          </Title>
          <div className="flex items-center space-x-2">
            <Text type="secondary" className="text-sm">
              Last Updated: {new Date().toLocaleString()}
            </Text>
          </div>
        </div>

        {/* Enhanced Revenue Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue Card */}
          <Card 
            className="shadow-lg border-blue-200 border-1 rounded-2xl transform transition-all hover:-translate-y-1 hover:shadow-xl overflow-hidden"
            bodyStyle={{ padding: '20px' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <Text className="text-gray-500 text-sm">Total Revenue</Text>
                <div className="flex items-baseline mt-1">
                  <Title level={3} className="m-0 text-gray-800">{formatCurrency(totalRevenue)}</Title>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                <DollarOutlined className="text-white text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full h-1 bg-gray-100 rounded-full">
                <div className="h-1 bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-gray-500">Lifetime revenue</span>
                <span className="text-blue-500 font-medium">{totalOrders} orders</span>
              </div>
            </div>
          </Card>

          {/* Today's Revenue Card */}
          <Card 
            className="shadow-lg border-purple-200 border-1 bg-purple-100 rounded-2xl transform transition-all hover:-translate-y-1 hover:shadow-xl overflow-hidden"
            bodyStyle={{ padding: '20px' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <Text className="text-gray-500 text-sm">Today's Revenue</Text>
                <div className="flex items-baseline mt-1">
                  <Title level={3} className="m-0 text-gray-800">{formatCurrency(revenueToday)}</Title>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center shadow-md">
                <CalendarOutlined className="text-white text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <Badge status="processing" color="#9333ea" />
                <Text className="text-gray-500 text-xs ml-2">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </Text>
              </div>
              <div className="mt-2 text-xs text-purple-500 font-medium">
                {orders.filter(order => {
                  const today = new Date();
                  const orderDate = new Date(order.order_date);
                  return orderDate.toDateString() === today.toDateString();
                }).length} orders today
              </div>
            </div>
          </Card>

          {/* Average Order Value */}
          <Card 
            className="shadow-lg border-green-200 border-1 bg-green-100 rounded-2xl transform transition-all hover:-translate-y-1 hover:shadow-xl overflow-hidden"
            bodyStyle={{ padding: '20px' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <Text className="text-gray-500 text-sm">Average Order</Text>
                <div className="flex items-baseline mt-1">
                  <Title level={3} className="m-0 text-gray-800">{formatCurrency(averageOrderValue)}</Title>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                <CreditCardOutlined className="text-white text-xl" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center">
                {/* <Text className="text-xs text-gray-500">Avg per order</Text>
                <Button 
                  type="text" 
                  className="p-0 h-auto text-green-500 text-xs hover:text-green-600"
                  onClick={() => setPriceRange([averageOrderValue * 0.8, averageOrderValue * 1.2])}
                >
                  View orders →
                </Button> */}
              </div>
              <div className="mt-2 text-xs text-green-500 font-medium">
                Based on {totalOrders} total orders
              </div>
            </div>
          </Card>

          {/* Growth Rate Card */}
          <Card 
            className="shadow-lg border-red-200 bg-red-100 rounded-2xl transform transition-all hover:-translate-y-1 hover:shadow-xl border-1 overflow-hidden"
            bodyStyle={{ padding: '20px' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <Text className="text-gray-500 text-sm"> Top month</Text>
                <div className="flex items-baseline mt-1">
                  <Title level={3} className={`m-0 ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {topMonth.month} 
                  </Title> 
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full ${monthlyGrowth >= 0 ? 'bg-red-500' : 'bg-red-500'} flex items-center justify-center shadow-md`}>
                <RiseOutlined className="text-white text-xl" />
              </div>
            </div>
            <div className="mt-6">
              {/* <div className="flex justify-between text-xs">
                <Text className="text-gray-500">
                  vs last month
                </Text>
                <Text className={monthlyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {formatCurrency(currentMonthRevenue - previousMonthRevenue)}
                </Text>
              </div> */}
              <div className="mt-2 text-xs">
                <Text className="text-red-500 text-xs font-medium">
                  Revenue: {formatCurrency(topMonth.revenue)}
                  {/* <span className="font-medium text-blue-500">{topMonth.month}</span>  */}
            
                </Text>
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Distribution Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-3">
            {/* Monthly Revenue Chart */}
            <Card 
              title={
                <div className="flex items-center">
                  <LineChartOutlined className="mr-2 text-blue-500" />
                  <span>Monthly Revenue Trend</span>
                </div>
              }
              className="shadow-lg rounded-2xl overflow-hidden"
              headStyle={{ 
                backgroundColor: '#f8fafc', 
                borderBottom: '1px solid #e2e8f0',
                fontWeight: 600,
                color: '#2d3748',
                padding: '12px 16px'
              }}
            >
              <div style={{ height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={monthlyRevenue}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false} 
                      stroke="#f0f0f0"
                    />
                    <XAxis 
                      dataKey="month" 
                      stroke="#718096" 
                      tickLine={false}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <YAxis 
                      stroke="#718096" 
                      tickLine={false}
                      axisLine={{ stroke: '#E2E8F0' }}
                      width={80}
                      tickFormatter={(value) => `${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value.toLocaleString()} VND`, 'Revenue']}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ fontWeight: 600, color: '#2D3748' }}
                      cursor={{ fill: 'rgba(237, 242, 247, 0.8)' }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="#3182ce" 
                      barSize={40} 
                      radius={[6, 6, 0, 0]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            {/* Key Stats Card */}
            <Card
  title={
    <div className="flex items-center">
      <TrophyOutlined className="mr-2 text-yellow-500" />
      <span>Key Stats</span>
    </div>
  }
  className="shadow-lg rounded-2xl overflow-visible"
  headStyle={{ 
    backgroundColor: '#f8fafc', 
    borderBottom: '1px solid #e2e8f0',
    fontWeight: 600,
    color: '#2d3748',
    padding: '12px 16px'
  }}
>
  <div style={{ minHeight: '320px' }}>
    <div className="space-y-4">
      <div>
        <Text className="text-gray-500 text-sm">Best Month</Text>
        <div className="flex items-center mt-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 flex items-center justify-center mr-3 shadow-md">
            <TrophyOutlined className="text-white text-lg" />
          </div>
          <div>
            <Text className="font-bold text-gray-800 text-xl">{topMonth.month}</Text>
            <div className="text-sm text-yellow-600">{formatCurrency(topMonth.revenue)}</div>
          </div>
        </div>
      </div>
      
      <div>
        <Text className="text-gray-500 text-sm">Total Orders</Text>
        <div className="flex items-center mt-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center mr-3 shadow-md">
            <ShoppingCartOutlined className="text-white text-lg" />
          </div>
          <div>
            <Text className="font-bold text-gray-800 text-xl">{totalOrders}</Text>
            <div className="text-sm text-blue-600">Average value: {formatCurrency(averageOrderValue)}</div>
          </div>
        </div>
      </div>
      
      <div className="pb-4">
        <Text className="text-gray-500 text-sm">Revenue This Year</Text>
        <div className="mt-1">
          <div className="flex items-center">
            <div className="w-[70px] h-10 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center mr-3 shadow-md">
              <DollarOutlined className="text-white text-lg" />
            </div>
            <div>
              <Text className="font-bold text-gray-800 text-xl">{formatCurrency(revenueYear)}</Text>
              <div className="text-sm text-purple-600">Total revenue since the beginning of the year</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</Card>

          </div>
        </div>

        {/* Order List with Filters */}
        <Card 
          title={
            <div className="flex items-center">
              <ShoppingCartOutlined className="mr-2 text-blue-500" />
              <span>Recent Orders</span>
            </div>
          }
          className="shadow-lg rounded-2xl mb-8"
          headStyle={{ 
            backgroundColor: '#f8fafc', 
            borderBottom: '1px solid #e2e8f0',
            fontWeight: 600,
            color: '#2d3748',
            padding: '16px 24px'
          }}
          extra={
            <div className="flex items-center">
              <Badge status="processing" className="mr-2" />
              <Text type="secondary">
                {filteredOrders.length} of {orders.length} orders
              </Text>
            </div>
          }
        >
          {/* Filter Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center mb-3">
              <FilterOutlined className="mr-2 text-blue-600" />
              <Text strong>Filter Orders</Text>
            </div>
            
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} md={8}>
                <div className="mb-2">
                  <Text type="secondary">Date Range</Text>
                </div>
                <RangePicker 
                  style={{ width: '100%' }}
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                  placeholder={['Start Date', 'End Date']}
                />
              </Col>
              
              <Col xs={24} md={8}>
                <div className="mb-2">
                  <Text type="secondary">Search by Buyer</Text>
                </div>
                <Input 
                  placeholder="Search buyer name" 
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined className="text-gray-400" />}
                  allowClear
                />
              </Col>
              
              <Col xs={24} md={8}>
                <div className="mb-2">
                  <Text type="secondary">Price Range</Text>
                </div>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select price range"
                  value={priceRange}
                  onChange={(value) => setPriceRange(value)}
                  allowClear
                >
                  {priceRangeOptions.map((option, index) => (
                    <Option key={index} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
            
            <div className="flex justify-end">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={resetFilters}
                className="bg-gray-200 hover:bg-gray-300 border-none shadow-sm"
              >
                Reset Filters
              </Button>
            </div>
          </div>
          
          <Table 
            columns={columns} 
            dataSource={data} 
            pagination={{ 
              pageSize: 5, 
              showSizeChanger: true,
              style: { marginTop: '16px' },
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} orders`
            }}
            className="w-full"
            scroll={{ x: 600 }}
            onChange={handleTableChange}
            rowClassName="hover:bg-blue-50 transition-colors"
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default StatisticForAdmin;