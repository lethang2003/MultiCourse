import {
  Dropdown,
  Table,
  Tag,
  Typography,
  Card,
  Spin,
  Alert,
  Space,
  Divider,
  Avatar,
  Button,
  message as antdMessage,
  Statistic,
  Row,
  Col,
  Modal,
  List,
  Tooltip,
} from "antd";
import { useEffect, useState } from "react";
import {
  EllipsisOutlined,
  CheckOutlined,
  StopOutlined,
  UserOutlined,
  TeamOutlined,
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserAddOutlined,
  UserSwitchOutlined,
  UserDeleteOutlined,
  IdcardOutlined,
  FileDoneOutlined,
  LockOutlined,
  EyeOutlined,
  CopyOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Paragraph from "antd/es/skeleton/Paragraph";

const { Title, Text, Link } = Typography;

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState(null);
  const [certificateModalVisible, setCertificateModalVisible] = useState(false);
  const [selectedCertificates, setSelectedCertificates] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "https://multicourse-q1mn.onrender.com/api/users/all-users",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        console.log(data);
        setUsers(data);
      } catch (err) {
        antdMessage.error("Error fetching users");
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center">
          <Spin size="large" tip="Loading user data..." />
          <p className="mt-4 text-gray-600">
            Please wait while we fetch the latest user information
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center">
        <Alert
          message="Error Loading Users"
          description={error}
          type="error"
          showIcon
          className="shadow-lg max-w-2xl"
        />
      </div>
    );

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleRoleFilter = (role) => {
    setFilterRole(role === filterRole ? null : role);
  };

  const resetFilters = () => {
    setSearchText("");
    setFilterRole(null);
  };

  const showCertificates = (certificates, userName) => {
    setSelectedCertificates(certificates);
    setSelectedUserName(userName);
    setCertificateModalVisible(true);
  };

  const filteredData = users
    .filter((user) => {
      if (!searchText) return true;
      return (
        user.fullname?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchText.toLowerCase())
      );
    })
    .filter((user) => {
      if (!filterRole) return true;
      return user.role === filterRole;
    })
    .map((user) => ({
      key: user._id,
      avatar: user.avatar,
      fullname: user.fullname,
      email: user.email,
      phone: user.phone || "N/A",
      role: user.role,
      status: user.status,
      tutor_certificates: user.tutor_certificates || [],
    }));

  // User statistics
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status).length;
  const inactiveUsers = totalUsers - activeUsers;

  const adminUsers = users.filter((user) => user.role === "Admin").length;
  const tutorUsers = users.filter((user) => user.role === "Tutor").length;
  const studentUsers = users.filter((user) => user.role === "Student").length;

  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      width: 80,
      render: (avatar) => (
        <div className="flex justify-center">
          <Avatar
            size={40}
            src={avatar || undefined}
            icon={!avatar && <UserOutlined />}
            className="border-2 border-blue-100 shadow-sm"
          />
        </div>
      ),
    },
    {
      title: "Full Name",
      dataIndex: "fullname",
      key: "fullname",
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
      render: (text) => (
        <Text strong className="text-gray-800">
          {text}
        </Text>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <Text
          copyable={{ tooltips: ["Copy email", "Email copied!"] }}
          className="text-blue-600 hover:text-blue-800"
        >
          {email}
        </Text>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => <Text className="text-gray-700">{phone}</Text>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filters: [
        { text: "Admin", value: "Admin" },
        { text: "Student", value: "Student" },
        { text: "Tutor", value: "Tutor" },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => {
        let color =
          role === "Admin" ? "purple" : role === "Tutor" ? "blue" : "green";
        let icon =
          role === "Admin" ? (
            <IdcardOutlined />
          ) : role === "Tutor" ? (
            <UserSwitchOutlined />
          ) : (
            <UserOutlined />
          );
        return (
          <Tag
            color={color}
            icon={icon}
            className="px-3 py-1 rounded-full font-semibold"
          >
            {role.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) =>
        status ? (
          <Tag
            color="success"
            icon={<CheckOutlined />}
            className="px-3 py-1 rounded-full"
          >
            Active
          </Tag>
        ) : (
          <Tag
            color="error"
            icon={<StopOutlined />}
            className="px-3 py-1 rounded-full"
          >
            Inactive
          </Tag>
        ),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (record) =>
        record.role !== "Admin" && (
          <DropDownMenu 
            record={record} 
            setUsers={setUsers} 
            users={users} 
            showCertificates={showCertificates}
          />
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Card
        className="shadow-2xl rounded-xl overflow-hidden border-0 mb-6"
        bordered={false}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <TeamOutlined className="text-blue-500 text-3xl mr-4" />
            <Title level={2} className="m-0 text-blue-800 font-bold">
              Manage Users
            </Title>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <SearchOutlined className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            <Dropdown
              menu={{
                items: [
                  {
                    key: "1",
                    label: "Admin",
                    onClick: () => handleRoleFilter("Admin"),
                  },
                  {
                    key: "2",
                    label: "Tutor",
                    onClick: () => handleRoleFilter("Tutor"),
                  },
                  {
                    key: "3",
                    label: "Student",
                    onClick: () => handleRoleFilter("Student"),
                  },
                ],
              }}
              placement="bottomRight"
            >
              <Button
                icon={<FilterOutlined />}
                className={filterRole ? "bg-blue-50 border-blue-200" : ""}
              >
                {filterRole || "Filter Role"}
              </Button>
            </Dropdown>

            {(searchText || filterRole) && (
              <Button
                icon={<ReloadOutlined />}
                onClick={resetFilters}
                className="text-gray-600 hover:text-blue-600 hover:border-blue-300"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* User Statistics Cards */}
        <div className="mb-8">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card className="border border-blue-100 shadow-md hover:shadow-lg transition-shadow rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                <Statistic
                  title={
                    <span className="text-blue-800 font-semibold">
                      Total Users
                    </span>
                  }
                  value={totalUsers}
                  prefix={<TeamOutlined className="text-blue-500 mr-2" />}
                  valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="border border-green-100 shadow-md hover:shadow-lg transition-shadow rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                <Statistic
                  title={
                    <span className="text-green-800 font-semibold">
                      Active Users
                    </span>
                  }
                  value={activeUsers}
                  prefix={<CheckOutlined className="text-green-500 mr-2" />}
                  valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="border border-red-100 shadow-md hover:shadow-lg transition-shadow rounded-lg bg-gradient-to-r from-red-50 to-red-100">
                <Statistic
                  title={
                    <span className="text-red-800 font-semibold">
                      Inactive Users
                    </span>
                  }
                  value={inactiveUsers}
                  prefix={<StopOutlined className="text-red-500 mr-2" />}
                  valueStyle={{ color: "#ff4d4f", fontWeight: "bold" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="border border-purple-100 shadow-md hover:shadow-lg transition-shadow rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="flex justify-between">
                  <Statistic
                    title={
                      <span className="text-purple-800 font-semibold">
                        Admin
                      </span>
                    }
                    value={adminUsers}
                    valueStyle={{ color: "#722ed1", fontSize: "16px" }}
                  />
                  <Statistic
                    title={
                      <span className="text-blue-800 font-semibold">Tutor</span>
                    }
                    value={tutorUsers}
                    valueStyle={{ color: "#1890ff", fontSize: "16px" }}
                  />
                  <Statistic
                    title={
                      <span className="text-green-800 font-semibold">
                        Student
                      </span>
                    }
                    value={studentUsers}
                    valueStyle={{ color: "#52c41a", fontSize: "16px" }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} users found`,
          }}
          className="shadow-sm rounded-lg overflow-hidden"
          rowClassName="hover:bg-blue-50 transition-colors"
          scroll={{ x: "max-content" }}
          footer={() => (
            <div className="flex justify-between items-center text-gray-500">
              <span>
                Showing {filteredData.length} of {totalUsers} users
              </span>
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
          )}
        />
      </Card>

      {/* Certificate Modal */}
      <Modal
      title={
        <div className="flex items-center gap-3">
          <TrophyOutlined className="text-yellow-500 text-xl" />
          <span className="text-lg font-medium">{selectedUserName}'s Achievements</span>
        </div>
      }
      open={certificateModalVisible}
      onCancel={() => setCertificateModalVisible(false)}
      footer={[
        <Button
          key="close"
          onClick={() => setCertificateModalVisible(false)}
          size="large"
          className="px-8"
        >
          Close
        </Button>,
      ]}
      width={700}
      className="certificate-modal"
      centered
      bodyStyle={{ padding: '20px 24px', maxHeight: '70vh', overflow: 'auto' }}
    >
      <List
        itemLayout="vertical"
        dataSource={selectedCertificates}
        renderItem={(certificate, index) => (
          <List.Item
            className="rounded-lg mb-4 bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all"
            key={certificate._id || index}
          >
            <div className="p-5 w-full">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Title level={4} className="m-0 text-blue-700">
                    {certificate.title}
                  </Title>
                  {certificate.issueDate && (
                    <Text type="secondary" className="text-sm mt-1 block">
                      Issued: {certificate.issueDate}
                    </Text>
                  )}
                </div>
                <Tag color="blue" className="rounded-full px-4 py-1 text-sm font-medium">
                  Certificate #{index + 1}
                </Tag>
              </div>
              
              {certificate.description && (
                <Paragraph className="text-gray-600 mt-2 mb-4" ellipsis={{ rows: 2, expandable: true }}>
                  {certificate.description}
                </Paragraph>
              )}
              
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  href={certificate.certificate_url}
                  target="_blank"
                  className="flex items-center"
                  size="middle"
                >
                  View Certificate
                </Button>
                
                <Tooltip title="Copy URL">
                  <Button 
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(certificate.certificate_url);
                      // You could add notification here
                    }}
                  >
                    Copy Link
                  </Button>
                </Tooltip>
                
                {certificate.verifyUrl && (
                  <Button
                    type="link"
                    href={certificate.verifyUrl}
                    target="_blank"
                    className="text-green-600"
                  >
                    <CheckOutlined /> Verify
                  </Button>
                )}
              </div>
            </div>
          </List.Item>
        )}
        locale={{
          emptyText: (
            <div className="text-center py-12">
              <FileDoneOutlined className="text-5xl text-gray-300 mb-3" />
              <p className="text-gray-500 text-lg">No certificates found</p>
              <Button type="primary" className="mt-4">Add Certificate</Button>
            </div>
          ),
        }}
      />
    </Modal>

      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  );
};

export default ManageUser;

const DropDownMenu = ({ record, setUsers, users, showCertificates }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const toggleUserStatus = async (id, status, message = "") => {
    try {
      const response = await fetch(
        `https://multicourse-q1mn.onrender.com/api/users/set-status-user/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ status, message }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      const updatedUsers = users.map((user) =>
        user._id === id ? { ...user, status: !user.status } : user
      );
      setUsers(updatedUsers);
      setIsModalOpen(false);
      setRejectReason("");
      antdMessage.success("User status updated successfully");
    } catch (err) {
      antdMessage.error("Error changing user status.");
    }
  };

  const handleStatusToggleClick = () => {
    if (record.status) {
      setIsModalOpen(true);
    } else {
      toggleUserStatus(record.key);
    }
  };
  
  // Build dropdown items based on user role and available data
  const getDropdownItems = () => {
    let items = [
      {
        key: "1",
        label: (
          <div
            onClick={handleStatusToggleClick}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors duration-150"
          >
            {record.status ? (
              <>
                <UserDeleteOutlined className="h-4 w-4 text-red-500" />
                <span>Ban User</span>
              </>
            ) : (
              <>
                <UserAddOutlined className="h-4 w-4 text-green-500" />
                <span>Activate User</span>
              </>
            )}
          </div>
        ),
      }
    ];
    
    // Add certificate view option for tutors with certificates
    if (record.role === "Tutor" && record.tutor_certificates?.length > 0) {
      items.push({
        key: "2",
        label: (
          <div
            onClick={() => showCertificates(record.tutor_certificates, record.fullname)}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors duration-150"
          >
            <FileDoneOutlined className="h-4 w-4 text-blue-500" />
            <span>View Certificates ({record.tutor_certificates.length})</span>
          </div>
        ),
      });
    }
    
    return items;
  };

  return (
    <div className="flex justify-center">
      <Dropdown menu={{ items: getDropdownItems() }} trigger={["click"]} placement="bottomRight">
        <Button
          type="text"
          icon={<EllipsisOutlined />}
          className="flex items-center justify-center hover:bg-gray-100 rounded-full w-8 h-8"
        />
      </Dropdown>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-96 border border-gray-100 dark:border-gray-700 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <UserDeleteOutlined className="text-red-500 mr-2" />
                Ban User
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
                <Avatar
                  size={40}
                  src={record.avatar || undefined}
                  icon={!record.avatar && <UserOutlined />}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-gray-800">{record.fullname}</p>
                  <p className="text-sm text-gray-500">{record.email}</p>
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Please provide a reason for banning this user:
              </label>
              <textarea
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white transition duration-300 resize-none"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter detailed reason..."
                rows="4"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                className="px-5 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                danger
                className="px-5 py-2 transition shadow-md"
                onClick={() => {
                  toggleUserStatus(record.key, "Rejected", rejectReason);
                }}
                disabled={!rejectReason.trim()}
              >
                Ban User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};