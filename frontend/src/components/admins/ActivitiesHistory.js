import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Space,
  Table,
  Card,
  Typography,
  Tag,
  Input,
  Button,
  Empty,
  Skeleton,
  Alert,
  DatePicker,
  message,
  Badge,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  HistoryOutlined,
  ReloadOutlined,
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  BookOutlined,
  WalletOutlined,
  StarOutlined,
  AuditOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useTheme } from "../context/ThemeContext";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function ActivitiesHistory() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [activityCounts, setActivityCounts] = useState({
    total: 0,
    request: 0,
    user: 0,
    course: 0,
    review: 0,
    wallet: 0,
    other: 0,
  });
  const token = localStorage.getItem("authToken");
  const { theme } = useTheme();

  const fetchActivities = () => {
    setLoading(true);
    axios
      .get("http://localhost:3000/api/activities/admin/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setActivities(res.data);
        countActivityTypes(res.data);
        // message.success("Activities fetched successfully");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        message.error("Failed to fetch activities");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchActivities();
  }, [token]);

  // Determine activity type for styling
  const getActivityType = (activity) => {
    const lowerActivity = activity.toLowerCase();
    if (lowerActivity.includes("changed")) {
      return "course";
    } else if (
      lowerActivity.includes("approved") ||
      lowerActivity.includes("rejected")
    ) {
      return "request";
    } else if (lowerActivity.includes("change")) {
      return "review";
    } else if (lowerActivity.includes("withdrawal")) {
      return "wallet";
    } else if (
      lowerActivity.includes("banned") ||
      lowerActivity.includes("unbanned")
    ) {
      return "user";
    } else {
      return "other";
    }
  };

  // Count activity types
  const countActivityTypes = (activityData) => {
    const counts = {
      total: activityData.length,
      request: 0,
      user: 0,
      course: 0,
      review: 0,
      wallet: 0,
      other: 0,
    };

    activityData.forEach((activity) => {
      const type = getActivityType(activity.description);
      counts[type]++;
    });

    setActivityCounts(counts);
  };

  // Get activity badge color
  const getActivityColor = (type) => {
    switch (type) {
      case "course":
        return "green";
      case "request":
        return "blue";
      case "review":
        return "red";
      case "wallet":
        return "cyan";
      case "user":
        return "orange";
      case "login":
        return "geekblue";
      default:
        return "default";
    }
  };

  // Get activity icon
  const getActivityIcon = (type) => {
    return <Badge color={getActivityColor(type)} />;
  };

  // Get counter icon
  const getCounterIcon = (type) => {
    switch (type) {
      case "course":
        return <BookOutlined />;
      case "request":
        return <AuditOutlined />;
      case "review":
        return <StarOutlined />;
      case "wallet":
        return <WalletOutlined />;
      case "user":
        return <UserOutlined />;
      case "other":
        return <FileTextOutlined />;
      default:
        return <HistoryOutlined />;
    }
  };

  // Filter data by search text and date range
  const filteredData = activities
    .filter((activity) =>
      activity.description.toLowerCase().includes(searchText.toLowerCase())
    )
    .filter((activity) => {
      if (!dateRange) return true;
      const activityDate = new Date(activity.entry_date);
      return (
        activityDate >= dateRange[0].startOf("day") &&
        activityDate <= dateRange[1].endOf("day")
      );
    })
    .map((activity, index) => {
      const activityType = getActivityType(activity.description);
      return {
        key: activity._id || index,
        activity: activity.description,
        type: activityType,
        time: new Date(activity.entry_date),
        rawTime: activity.entry_date,
      };
    });

  useEffect(() => {
    // Update counters when filtered data changes
    const counts = {
      total: filteredData.length,
      request: 0,
      user: 0,
      course: 0,
      review: 0,
      wallet: 0,
      other: 0,
    };

    filteredData.forEach((activity) => {
      counts[activity.type]++;
    });

    setActivityCounts(counts);
  }, [filteredData.length, searchText, dateRange]);

  const columns = [
    {
      title: "Activity",
      dataIndex: "activity",
      key: "activity",
      render: (text, record) => (
        <div className="flex items-center gap-2">
          {getActivityIcon(record.type)}
          <Text
            className={`${theme === "dark" ? "text-gray-100" : ""}`}
            style={{ maxWidth: 500 }}
            ellipsis={{ tooltip: text }}
          >
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const color = getActivityColor(type);
        return (
          <Tag color={color} className="capitalize px-2 py-1">
            {type}
          </Tag>
        );
      },
      filters: [
        { text: "Request", value: "request" },
        { text: "User", value: "user" },
        { text: "Course", value: "course" },
        { text: "Review", value: "review" },
        { text: "Wallet", value: "wallet" },
        { text: "Other", value: "other" },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Date",
      dataIndex: "time",
      key: "date",
      render: (time) => time.toLocaleDateString(),
      sorter: (a, b) => new Date(a.rawTime) - new Date(b.rawTime),
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      render: (time) => time.toLocaleTimeString(),
    },
  ];

  const handleReset = () => {
    setSearchText("");
    setDateRange(null);
    fetchActivities();
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
      <Skeleton active paragraph={{ rows: 1 }} />
      <Skeleton active paragraph={{ rows: 1 }} />
      <Skeleton active paragraph={{ rows: 1 }} />
      <Skeleton active paragraph={{ rows: 1 }} />
    </div>
  );

  // Counter cards
  const renderActivityCounters = () => (
    <div className={`mb-6 ${loading ? "hidden" : ""}`}>
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`${
              theme === "dark" ? "bg-gray-700 text-white" : "bg-blue-50"
            } rounded-lg shadow-md h-full border-none`}
          >
            <Statistic
              title={
                <span
                  className={`${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  } font-medium`}
                >
                  Total Activities
                </span>
              }
              value={activityCounts.total}
              prefix={
                <HistoryOutlined
                  className={`${
                    theme === "dark" ? "text-blue-400" : "text-blue-500"
                  }`}
                />
              }
              valueStyle={{ color: theme === "dark" ? "#fff" : "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`${
              theme === "dark" ? "bg-gray-700 text-white" : "bg-blue-50"
            } rounded-lg shadow-md h-full border-none`}
          >
            <Statistic
              title={
                <span
                  className={`${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  } font-medium`}
                >
                  Requests
                </span>
              }
              value={activityCounts.request}
              prefix={getCounterIcon("request")}
              valueStyle={{ color: theme === "dark" ? "#5cadff" : "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`${
              theme === "dark" ? "bg-gray-700 text-white" : "bg-green-50"
            } rounded-lg shadow-md h-full border-none`}
          >
            <Statistic
              title={
                <span
                  className={`${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  } font-medium`}
                >
                  Courses
                </span>
              }
              value={activityCounts.course}
              prefix={getCounterIcon("course")}
              valueStyle={{ color: theme === "dark" ? "#8fdb96" : "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`${
              theme === "dark" ? "bg-gray-700 text-white" : "bg-red-50"
            } rounded-lg shadow-md h-full border-none`}
          >
            <Statistic
              title={
                <span
                  className={`${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  } font-medium`}
                >
                  Reviews
                </span>
              }
              value={activityCounts.review}
              prefix={getCounterIcon("review")}
              valueStyle={{ color: theme === "dark" ? "#ff7875" : "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`${
              theme === "dark" ? "bg-gray-700 text-white" : "bg-cyan-50"
            } rounded-lg shadow-md h-full border-none`}
          >
            <Statistic
              title={
                <span
                  className={`${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  } font-medium`}
                >
                  Wallet
                </span>
              }
              value={activityCounts.wallet}
              prefix={getCounterIcon("wallet")}
              valueStyle={{ color: theme === "dark" ? "#5cdbd3" : "#13c2c2" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            className={`${
              theme === "dark" ? "bg-gray-700 text-white" : "bg-orange-50"
            } rounded-lg shadow-md h-full border-none`}
          >
            <Statistic
              title={
                <span
                  className={`${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  } font-medium`}
                >
                  Users
                </span>
              }
              value={activityCounts.user}
              prefix={getCounterIcon("user")}
              valueStyle={{ color: theme === "dark" ? "#ffc069" : "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gray-900"
          : "bg-gradient-to-br from-blue-50 to-indigo-100"
      } p-6`}
    >
      <Card
        className={`shadow-lg rounded-lg ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
        }`}
        bordered={false}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <HistoryOutlined
              className={`text-2xl mr-3 ${
                theme === "dark" ? "text-blue-400" : "text-blue-500"
              }`}
            />
            <Title
              level={2}
              className={`m-0 ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              Activities History
            </Title>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Input
              placeholder="Search activities..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="rounded-md w-full sm:w-64"
              allowClear
            />

            <RangePicker
              className="w-full sm:w-auto"
              onChange={(dates) => setDateRange(dates)}
              placeholder={["Start date", "End date"]}
            />

            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              className={`flex items-center justify-center ${
                theme === "dark"
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Reset
            </Button>
          </div>
        </div>

        {renderActivityCounters()}

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <div className="overflow-x-auto">
          {loading ? (
            renderSkeleton()
          ) : (
            <Table
              columns={columns}
              dataSource={filteredData}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} activities`,
              }}
              rowClassName={(record) =>
                record.type === "delete"
                  ? theme === "dark"
                    ? "bg-red-900 bg-opacity-20"
                    : "bg-red-50"
                  : record.type === "create"
                  ? theme === "dark"
                    ? "bg-green-900 bg-opacity-20"
                    : "bg-green-50"
                  : ""
              }
              locale={{
                emptyText: (
                  <Empty
                    description="No activities found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
              className={`${theme === "dark" ? "ant-table-dark" : ""}`}
              summary={(pageData) => {
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={4} className="text-right">
                      <Text
                        className={`${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Total activities: {filteredData.length}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <CalendarOutlined className="mr-1" />
          <span>Activities are sorted by most recent first</span>
        </div>
      </Card>
    </div>
  );
}
