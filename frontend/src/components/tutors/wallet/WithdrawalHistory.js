import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Select,
  DatePicker,
  Button,
  Statistic,
  Space,
  Badge,
  Divider,
  Tooltip,
  Typography,
  Spin,
  Tag,
  Switch,
  Radio,
  Row,
  Col,
  Empty,
  message
} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import {
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ReloadOutlined,
  AreaChartOutlined,
  DownloadOutlined,
  DollarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const WithdrawalHistory = () => {
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("descend");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [showChart, setShowChart] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [amountRange, setAmountRange] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [chartType, setChartType] = useState("status");

  useEffect(() => {
    const fetchWithdrawalHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://multicourse-q1mn.onrender.com/api/wallet/requests-history",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch withdrawal history");
        }

        const data = await response.json();
        setWithdrawalHistory(data.withdrawals || []);
        setTotalWithdrawals(data.withdrawals.length);
        setLoading(false);
      } catch (err) {
        message.error("Error fetching withdrawal history");
        setError(err.message);
        setLoading(false);
      }
    };

    fetchWithdrawalHistory();
  }, []);

  // Filter data based on all filters
  const filteredData = withdrawalHistory.filter((item) => {
    // Filter by status
    if (filterStatus && item.status !== filterStatus) return false;
    
    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const itemDate = new Date(item.date);
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      if (itemDate < startDate || itemDate > endDate) return false;
    }
    
    // Filter by transaction ID search
    if (searchText && !item._id.toLowerCase().includes(searchText.toLowerCase())) return false;
    
    // Filter by amount range (if implemented)
    if (amountRange) {
      const [min, max] = amountRange;
      if (item.amount < min || item.amount > max) return false;
    }
    
    return true;
  });

  // Generate chart data
  const getChartData = () => {
    if (chartType === "status") {
      return [
        {
          name: "Approved",
          amount: filteredData
            .filter((item) => item.status === "Approved")
            .reduce((acc, item) => acc + item.amount, 0),
          count: filteredData.filter((item) => item.status === "Approved").length
        },
        {
          name: "Rejected",
          amount: filteredData
            .filter((item) => item.status === "Rejected")
            .reduce((acc, item) => acc + item.amount, 0),
          count: filteredData.filter((item) => item.status === "Rejected").length
        },
        {
          name: "Pending",
          amount: filteredData
            .filter((item) => item.status === "Pending")
            .reduce((acc, item) => acc + item.amount, 0),
          count: filteredData.filter((item) => item.status === "Pending").length
        }
      ];
    } else {
      // Group by date
      const dateMap = new Map();
      filteredData.forEach(item => {
        const date = new Date(item.date).toLocaleDateString();
        if (!dateMap.has(date)) {
          dateMap.set(date, { date, amount: 0, count: 0 });
        }
        const entry = dateMap.get(date);
        entry.amount += item.amount;
        entry.count += 1;
      });
      return Array.from(dateMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  };

  // Get summary statistics
  const getSummaryStats = () => {
    const approvedAmount = filteredData
      .filter(item => item.status === "Approved")
      .reduce((acc, item) => acc + item.amount, 0);
    
    const rejectedAmount = filteredData
      .filter(item => item.status === "Rejected")
      .reduce((acc, item) => acc + item.amount, 0);
    
    const pendingAmount = filteredData
      .filter(item => item.status === "Pending")
      .reduce((acc, item) => acc + item.amount, 0);
    
    const totalAmount = filteredData.reduce((acc, item) => acc + item.amount, 0);
    
    return {
      approvedAmount,
      rejectedAmount,
      pendingAmount,
      totalAmount,
      approvedCount: filteredData.filter(item => item.status === "Approved").length,
      rejectedCount: filteredData.filter(item => item.status === "Rejected").length,
      pendingCount: filteredData.filter(item => item.status === "Pending").length,
      totalCount: filteredData.length
    };
  };

  const stats = getSummaryStats();

  // Reset all filters
  const resetFilters = () => {
    setFilterStatus("");
    setDateRange(null);
    setSearchText("");
    setAmountRange(null);
    setSortField("date");
    setSortOrder("descend");
    setCurrentPage(1);
  };

  // Handle table change for sorting
  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    
    if (sorter && sorter.order) {
      setSortField(sorter.field);
      setSortOrder(sorter.order);
    }
  };

  // Download CSV
  const downloadCSV = () => {
    const headers = ["Date", "Amount (VND)", "Status", "Transaction ID"];
    const rows = filteredData.map(item => [
      new Date(item.date).toLocaleString(),
      item.amount,
      item.status,
      item._id
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `withdrawal_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Configure table columns
  const columns = [
    {
      title: "Date & Time",
      dataIndex: "date",
      key: "date",
      render: (text) => (
        <Space>
          <CalendarOutlined className="text-gray-500" />
          <Text>{new Date(text).toLocaleString("vi-VN")}</Text>
        </Space>
      ),
      sorter: true,
      sortOrder: sortField === "date" ? sortOrder : null,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => (
        <Space>
          <DollarOutlined className="text-green-500" />
          <Text strong className="text-gray-800">
            {text.toLocaleString("vi-VN")} VNĐ
          </Text>
        </Space>
      ),
      sorter: true,
      sortOrder: sortField === "amount" ? sortOrder : null,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        let color = "default";
        let icon = null;
        
        switch (text) {
          case "Approved":
            color = "success";
            icon = <CheckCircleOutlined />;
            break;
          case "Rejected":
            color = "error";
            icon = <CloseCircleOutlined />;
            break;
          case "Pending":
            color = "warning";
            icon = <ClockCircleOutlined />;
            break;
        }
        
        return (
          <Tag color={color} icon={icon} className="px-3 py-1">
            {text}
          </Tag>
        );
      },
      filters: [
        { text: "Approved", value: "Approved" },
        { text: "Rejected", value: "Rejected" },
        { text: "Pending", value: "Pending" },
      ],
      filteredValue: filterStatus ? [filterStatus] : null,
      onFilter: (value, record) => record.status === value,
    },
    // {
    //   title: "Transaction ID",
    //   dataIndex: "_id",
    //   key: "_id",
    //   render: (text) => (
    //     <Tooltip title={text}>
    //       <Text className="text-gray-600 text-sm font-mono">{text.substring(0, 16)}...</Text>
    //     </Tooltip>
    //   ),
    // },
  ];

  // Prepare data for the table
  const tableData = filteredData.map(item => ({
    key: item._id,
    date: item.date,
    amount: item.amount,
    status: item.status,
    _id: item._id
  }));

  // Custom style for the chart
  const chartColors = {
    Approved: "#52c41a",
    Rejected: "#f5222d",
    Pending: "#faad14",
    Total: "#1890ff"
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" tip="Loading withdrawal history..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Card className="w-full max-w-md text-center">
          <CloseCircleOutlined className="text-red-500 text-4xl mb-4" />
          <Title level={4}>Error Loading Data</Title>
          <Text type="danger">{error}</Text>
          <Button 
            type="primary" 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 hover:bg-blue-600"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <Title level={3} className="flex items-center m-0">
            <DollarOutlined className="mr-2 text-blue-500" />
            Withdrawal History
          </Title>
          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={downloadCSV}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Export CSV
            </Button>
          </Space>
        </div>

        {/* Summary statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card bordered={false} className="shadow-sm bg-blue-50">
            <Statistic
              title="Total Transactions"
              value={stats.totalCount}
              suffix={<Text type="secondary">orders</Text>}
              valueStyle={{ color: "#1890ff" }}
            />
            <div className="mt-2">
              <Text type="secondary">Amount: </Text>
              <Text strong>{stats.totalAmount.toLocaleString("vi-VN")} VNĐ</Text>
            </div>
          </Card>
          <Card bordered={false} className="shadow-sm bg-green-50">
            <Statistic
              title="Approved"
              value={stats.approvedCount}
              suffix={<Text type="secondary">orders</Text>}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
            <div className="mt-2">
              <Text type="secondary">Amount: </Text>
              <Text strong className="text-green-600">
                {stats.approvedAmount.toLocaleString("vi-VN")} VNĐ
              </Text>
            </div>
          </Card>
          <Card bordered={false} className="shadow-sm bg-yellow-50">
            <Statistic
              title="Pending"
              value={stats.pendingCount}
              suffix={<Text type="secondary">orders</Text>}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
            />
            <div className="mt-2">
              <Text type="secondary">Amount: </Text>
              <Text strong className="text-yellow-600">
                {stats.pendingAmount.toLocaleString("vi-VN")} VNĐ
              </Text>
            </div>
          </Card>
          <Card bordered={false} className="shadow-sm bg-red-50">
            <Statistic
              title="Rejected"
              value={stats.rejectedCount}
              suffix={<Text type="secondary">orders</Text>}
              valueStyle={{ color: "#f5222d" }}
              prefix={<CloseCircleOutlined />}
            />
            <div className="mt-2">
              <Text type="secondary">Amount: </Text>
              <Text strong className="text-red-600">
                {stats.rejectedAmount.toLocaleString("vi-VN")} VNĐ
              </Text>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card 
          title={<div className="flex items-center"><FilterOutlined className="mr-2" /> Filters</div>}
          className="mb-6"
          size="small"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Text className="text-gray-500 mb-2 block">Status</Text>
              <Select
                placeholder="Select status"
                style={{ width: '100%' }}
                value={filterStatus || undefined}
                onChange={setFilterStatus}
                allowClear
              >
                <Option value="Approved">Approved</Option>
                <Option value="Rejected">Rejected</Option>
                <Option value="Pending">Pending</Option>
              </Select>
            </div>
            <div>
              <Text className="text-gray-500 mb-2 block">Date Range</Text>
              <RangePicker 
                style={{ width: '100%' }}
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
            <div>
              <Text className="text-gray-500 mb-2 block">Transaction ID</Text>
              <Input 
                placeholder="Search by transaction ID"
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              icon={<ReloadOutlined />}
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden rounded-lg shadow-md">
          <div className="mb-4 flex justify-between items-center">
            <Text className="text-gray-500">
              {filteredData.length} of {withdrawalHistory.length} withdrawal orders
            </Text>
            <Space>
              <Text className="text-gray-500">Sort by:</Text>
              <Select
                value={sortField}
                onChange={setSortField}
                style={{ width: 120 }}
              >
                <Option value="date">Date</Option>
                <Option value="amount">Amount</Option>
              </Select>
              <Button
                icon={sortOrder === "ascend" ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                onClick={() => setSortOrder(sortOrder === "ascend" ? "descend" : "ascend")}
              />
            </Space>
          </div>
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredData.length,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, pageSize) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              },
            }}
            onChange={handleTableChange}
            loading={loading}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="text-gray-500">
                      No withdrawal history found
                    </span>
                  }
                />
              ),
            }}
            className="overflow-x-auto"
          />
        </Card>

        {/* Chart Controls */}
        <div className="flex justify-between items-center mt-8 mb-4">
          <Title level={4} className="m-0">Withdrawal Summary</Title>
          <Space>
            <Radio.Group
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="status">By Status</Radio.Button>
              <Radio.Button value="date">By Date</Radio.Button>
            </Radio.Group>
            <Switch
              checkedChildren="Show Chart"
              unCheckedChildren="Hide Chart"
              checked={showChart}
              onChange={setShowChart}
            />
          </Space>
        </div>

        {/* Chart */}
        {showChart && (
          <Card className="rounded-lg shadow-md mb-8">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey={chartType === "status" ? "name" : "date"} 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value.toLocaleString()}`}
                    tickLine={false}
                  />
                  <RechartsTooltip 
                    formatter={(value) => [`${value.toLocaleString()} VNĐ`, "Amount"]}
                    labelFormatter={(value) => `${value}`}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #d9d9d9",
                      borderRadius: "4px",
                      padding: "10px"
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    name="Amount" 
                    fill="#1890ff"
                    radius={[8, 8, 0, 0]}
                    barSize={chartType === "date" ? 20 : 60}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Count" 
                    fill="#52c41a" 
                    radius={[8, 8, 0, 0]}
                    barSize={chartType === "date" ? 20 : 60}
                  />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
};

// Add this dummy Input component to fix the code
const Input = ({ placeholder, allowClear, value, onChange }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border rounded-md"
      style={{ outline: "none" }}
    />
  );
};

export default WithdrawalHistory;