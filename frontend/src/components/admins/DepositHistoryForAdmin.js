import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  DatePicker,
  Card,
  Typography,
  message,
  Spin,
  Space,
  Statistic,
  Button,
  Tag,
  Tooltip
} from "antd";
import {
  SearchOutlined,
  UpOutlined,
  DownOutlined,
  FilterOutlined,
  WalletOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Search } = Input;

const DepositHistoryForAdmin = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5
  });
  const [sortConfig, setSortConfig] = useState({
    columnKey: "payment_date",
    order: "descend"
  });

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/wallet/all-deposit-history",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch deposit history");
        }

        const data = await response.json();
        setDeposits(data.deposits);
      } catch (error) {
        console.error("Error fetching deposit history:", error);
        message.error("Failed to load deposit history");
      } finally {
        setLoading(false);
      }
    };

    fetchDeposits();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredDeposits = deposits.filter((deposit) => {
    const matchesOrderCode = deposit.order_code
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesUser = deposit.user
      .toLowerCase()
      .includes(userSearchTerm.toLowerCase());
    const matchesDate = dateFilter
      ? dayjs(deposit.payment_date).format('YYYY-MM-DD') === dateFilter.format('YYYY-MM-DD')
      : true;
    return matchesOrderCode && matchesUser && matchesDate;
  });

  const totalAmount = filteredDeposits.reduce(
    (sum, deposit) => sum + deposit.payment_amount,
    0
  );

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    if (sorter && sorter.columnKey) {
      setSortConfig({
        columnKey: sorter.columnKey,
        order: sorter.order
      });
    }
  };

  const columns = [
    {
      title: "Order Code",
      dataIndex: "order_code",
      key: "order_code",
      sorter: (a, b) => a.order_code.localeCompare(b.order_code),
      sortOrder: sortConfig.columnKey === "order_code" ? sortConfig.order : null,
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      sorter: (a, b) => a.user.localeCompare(b.user),
      sortOrder: sortConfig.columnKey === "user" ? sortConfig.order : null,
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Amount",
      dataIndex: "payment_amount",
      key: "payment_amount",
      sorter: (a, b) => a.payment_amount - b.payment_amount,
      sortOrder: sortConfig.columnKey === "payment_amount" ? sortConfig.order : null,
      render: (amount) => (
        <Text strong style={{ color: "#1890ff" }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: "Date",
      dataIndex: "payment_date",
      key: "payment_date",
      sorter: (a, b) => new Date(a.payment_date) - new Date(b.payment_date),
      sortOrder: sortConfig.columnKey === "payment_date" ? sortConfig.order : null,
      render: (date) => (
        <span>
          {dayjs(date).format("DD/MM/YYYY HH:mm:ss")}
        </span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
      sortOrder: sortConfig.columnKey === "description" ? sortConfig.order : null,
    },
  ];

  const resetFilters = () => {
    setSearchTerm("");
    setUserSearchTerm("");
    setDateFilter(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card bordered={false} style={{ borderRadius: '8px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Title level={2} style={{ margin: 0 }}>
            <WalletOutlined style={{ marginRight: '12px' }} />
            Deposit History
          </Title>
        </div>

        <Space style={{ marginBottom: '24px' }} wrap>
          <Card style={{ background: '#e6f7ff', borderColor: '#91d5ff' }}>
            <Statistic
              title="Total Deposits"
              value={filteredDeposits.length}
              suffix="records"
            />
          </Card>
          <Card style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
            <Statistic
              title="Total Amount"
              value={formatCurrency(totalAmount)}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Space>

        <Space style={{ marginBottom: '24px' }} wrap>
          <Search
            placeholder="Search by order code"
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          <Search
            placeholder="Search by user"
            allowClear
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          <DatePicker
            placeholder="Filter by date"
            value={dateFilter}
            onChange={(date) => setDateFilter(date)}
            style={{ width: 200 }}
          />
          <Button type="default" onClick={resetFilters}>
            Reset Filters
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredDeposits.map(deposit => ({ ...deposit, key: deposit.order_code }))}
          pagination={pagination}
          onChange={handleTableChange}
          loading={loading}
          bordered
          size="middle"
          style={{ marginTop: '16px' }}
          scroll={{ x: 'max-content' }}
          summary={(pageData) => {
            if (pageData.length === 0) return null;
            
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <Text strong>Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <Text strong style={{ color: "#1890ff" }}>
                      {formatCurrency(
                        pageData.reduce((sum, row) => sum + row.payment_amount, 0)
                      )}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} colSpan={2}></Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default DepositHistoryForAdmin;