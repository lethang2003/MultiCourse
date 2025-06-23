import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spin, Alert, Button, Input, Tag, Tooltip, Statistic, Card, DatePicker, message } from "antd";
import { DownloadOutlined, ReloadOutlined, SearchOutlined, CalendarOutlined, DollarOutlined, ShoppingOutlined, UserOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

const { RangePicker } = DatePicker;

const PurchaseHistoryForAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchText, dateRange, orders]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("authToken");
    setLoading(true);
    try {
      const response = await axios.get(
        "https://multicourse-q1mn.onrender.com/api/orders/all-orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (err) {
      message.error("Error loading order list.");
      setError("Error loading order list.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Apply search text filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          (order.user?.fullname || "").toLowerCase().includes(searchLower) ||
          (order.user?.email || "").toLowerCase().includes(searchLower) ||
          order.order_items.some((item) =>
            (item.course?.title || "").toLowerCase().includes(searchLower)
          )
      );
    }

    // Apply date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day').valueOf();
      const endDate = dateRange[1].endOf('day').valueOf();
      
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.order_date).getTime();
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    setFilteredOrders(filtered);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredOrders.map((order) => ({
        Buyer: order.user?.fullname || "N/A",
        Email: order.user?.email || "N/A",
        Course: order.order_items.map((item) => item.course?.title).join(", ") || "N/A",
        Total: order.total_price.toLocaleString() + " VND",
        "Order Date": new Date(order.order_date).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase History");
    XLSX.writeFile(workbook, "purchase_history.xlsx");
  };

  // Calculate total sales
  const totalSales = filteredOrders.reduce((sum, order) => sum + order.total_price, 0);
  const uniqueBuyers = [...new Set(filteredOrders.map(order => order.user?._id))].length;
  const totalCoursesSold = filteredOrders.reduce((sum, order) => sum + order.order_items.length, 0);

  const columns = [
    {
      title: "Buyer",
      dataIndex: "buyer",
      key: "buyer",
      render: (buyer) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2 text-blue-500" />
          <span className="font-medium text-gray-800">{buyer}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => <span className="text-gray-600">{email}</span>,
    },
    {
      title: "Course",
      dataIndex: "course",
      key: "course",
      render: (course) => (
        <Tooltip title={course}>
          <span className="text-gray-800 line-clamp-1">{course}</span>
        </Tooltip>
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      sorter: (a, b) => {
        const aValue = parseFloat(a.total.replace(/[^\d.-]/g, ''));
        const bValue = parseFloat(b.total.replace(/[^\d.-]/g, ''));
        return aValue - bValue;
      },
      render: (total) => <span className="font-medium text-emerald-600">{total}</span>,
    },
    {
      title: "Order Date",
      dataIndex: "order_date",
      key: "order_date",
      sorter: (a, b) => new Date(a.order_date_raw) - new Date(b.order_date_raw),
      render: (date, record) => (
        <Tooltip title={new Date(record.order_date_raw).toLocaleString()}>
          <span className="text-gray-600">{date}</span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: () => <Tag className="px-3 py-1" color="green">Completed</Tag>,
    },
  ];

  const data = filteredOrders.map((order, index) => ({
    key: order._id || index,
    buyer: order.user?.fullname || "N/A",
    email: order.user?.email || "N/A",
    course: order.order_items.map((item) => item.course?.title).join(", ") || "N/A",
    total: order.total_price.toLocaleString() + " VND",
    order_date: new Date(order.order_date).toLocaleDateString(),
    order_date_raw: order.order_date,
  }));

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading purchase history...</p>
        </div>
      </div>
    );
  }

  if (error && !refreshing) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="max-w-md shadow-md"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm mb-6 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
              Purchase History
            </h1>
            <div className="flex space-x-3">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={refreshing}
                className="flex items-center"
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={exportToExcel}
                className="bg-blue-500 hover:bg-blue-600 flex items-center"
              >
                Export to Excel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="shadow-sm bg-green-100">
              <Statistic
                title="Total Sales"
                value={totalSales.toLocaleString() + " VND"}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
            <Card className="shadow-sm bg-blue-100">
              <Statistic
                title="Unique Buyers"
                value={uniqueBuyers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
            <Card className="shadow-sm bg-purple-100">
              <Statistic
                title="Courses Sold"
                value={totalCoursesSold}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </div>

          <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
            <div className="w-full md:w-1/3">
              <Input
                placeholder="Search by buyer name, email or course"
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div>
              <RangePicker
                onChange={(dates) => setDateRange(dates)}
                format="DD/MM/YYYY"
                placeholder={['Start Date', 'End Date']}
                className="w-full md:w-auto"
                suffixIcon={<CalendarOutlined className="text-gray-400" />}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <Table
            columns={columns}
            dataSource={data}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
            }}
            bordered={false}
            loading={refreshing}
            className="custom-table"
            rowClassName="hover:bg-gray-50 transition-colors"
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <strong>Total</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong className="text-emerald-600">
                      {totalSales.toLocaleString()} VND
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={2}></Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
      </div>

      <style jsx global>{`
        .custom-table .ant-table-thead > tr > th {
          background-color: #f9fafb;
          color: #4b5563;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f3f4f6;
        }
        
        .ant-table-summary {
          background-color: #f9fafb;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default PurchaseHistoryForAdmin;