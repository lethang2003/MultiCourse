import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BookOutlined,
  WalletOutlined,
  HistoryOutlined,
  DollarOutlined,
  FileTextOutlined,
  LineChartOutlined,
  ShoppingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Menu, Button, Layout, Typography } from "antd";
import { Link } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";

const { Sider } = Layout;
const { Title } = Typography;

function Sidebar() {
  const { theme } = useTheme();
  const [current, setCurrent] = useState("1");
  const [role, setRole] = useState(localStorage.getItem("role") || "Guest");
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const updateRole = () => {
      const currentRole = localStorage.getItem("role") || "Guest";
      setRole(currentRole);
      console.log("Updated Role:", currentRole);
    };

    // Listen for roleChanged event
    window.addEventListener("roleChanged", updateRole);

    // Listen for storage event
    window.addEventListener("storage", updateRole);

    // Check token and role when component mounts
    const token = localStorage.getItem("authToken");
    if (token) {
      fetch("https://multicourse-q1mn.onrender.com/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          localStorage.setItem("role", data.role);
          setRole(data.role);
        })
        .catch((error) => console.error("Error fetching user profile:", error));
    }

    return () => {
      window.removeEventListener("roleChanged", updateRole);
      window.removeEventListener("storage", updateRole);
    };
  }, []);

  const onClick = (e) => {
    setCurrent(e.key);
  };

  // Define menu items based on role
  let items = [];
  if (role === "Student") {
    items = [
      {
        key: "sub1",
        label: "Student Navigation",
        icon: <BookOutlined />,
        children: [
          { key: "1", label: <Link to="/course-list">Courses List</Link>, icon: <AppstoreOutlined /> },
          { key: "24", label: <Link to="/my-courses">My Courses</Link>, icon: <BookOutlined /> },
          {
            key: "2",
            label: <Link to="/my-certificate">My Certificates</Link>,
            icon: <FileTextOutlined />
          },
          { key: "3", label: <Link to="/deposit">Deposit</Link>, icon: <DollarOutlined /> },
          {
            key: "4",
            label: <Link to="/deposit-history">Deposit History</Link>,
            icon: <HistoryOutlined />
          },
          { key: "22", label: <Link to="/wallet">My Wallet</Link>, icon: <WalletOutlined /> },
          {
            key: "23",
            label: <Link to="/withdrawal-history">Withdrawal History</Link>,
            icon: <HistoryOutlined />
          },
        ],
      },
    ];
  } else if (role === "Tutor") {
    items = [
      {
        key: "sub2",
        label: "Manage Courses",
        icon: <BookOutlined />,
        children: [
          { key: "5", label: <Link to="courses-list-tutor">Course List</Link>, icon: <AppstoreOutlined /> },
          { key: "6", label: <Link to="/createcourse">Create Course</Link>, icon: <FileTextOutlined /> },
        ],
      },
      {
        key: "sub3",
        icon: <MailOutlined />,
        label: <Link to="/request-list">Request List</Link>,
      },
      {
        key: "sub4",
        label: "Manage Wallet",
        icon: <WalletOutlined />,
        children: [
          {
            key: "10",
            label: <Link to="/withdrawal-history">Withdrawal History</Link>,
            icon: <HistoryOutlined />
          },
          { key: "11", label: <Link to="/wallet">My Wallet</Link>, icon: <DollarOutlined /> },
        ],
      },
      {
        key: "sub7",
        icon: <HistoryOutlined />,
        label: <Link to="/activity-history-tutor">Activity History</Link>,
      },
      {
        key: "sub8",
        icon: <ShoppingOutlined />,
        label: <Link to="/buyer-history-tutor">Buyer History</Link>,
      },
      {
        key: "sub5",
        label: <Link to="/statistic-tutor">Statistics</Link>,
        icon: <LineChartOutlined />,
      },
    ];
  } else if (role === "Admin") {
    items = [
      {
        key: "sub6",
        label: "Admin Navigation",
        icon: <SettingOutlined />,
        children: [
          {
            key: "12",
            label: <Link to="/statistic-for-admin">Statistics</Link>,
            icon: <LineChartOutlined />
          },
          {
            key: "13",
            label: <Link to="/course-list-for-admin">Manage Courses</Link>,
            icon: <BookOutlined />
          },
          {
            key: "16",
            label: <Link to="/wallet-manage-for-admin">Manage Wallet</Link>,
            icon: <WalletOutlined />
          },
          {
            key: "17",
            label: <Link to="/purchase-history-for-admin">Purchase History</Link>,
            icon: <ShoppingOutlined />
          },
          {
            key: "18",
            label: <Link to="/manage-review-for-admin">Manage Reviews</Link>,
            icon: <FileTextOutlined />
          },
          {
            key: "19",
            label: <Link to="/manage-request-list">Manage Requests</Link>,
            icon: <MailOutlined />
          },
          {
            key: "20",
            label: <Link to="/activities-history-list">Activities History</Link>,
            icon: <HistoryOutlined />
          },
          {
            key: "21",
            label: <Link to="/buyer-history-list">Buyer History</Link>,
            icon: <ShoppingOutlined />
          },
          {
            key: "22",
            label: <Link to="/manage-users">Manage Users</Link>,
            icon: <TeamOutlined />
          },
          {
            key: "23",
            label: <Link to="/deposit-history-for-admin">Deposit History</Link>,
            icon: <HistoryOutlined />
          },
        ],
      },
    ];
  }

  // Routes where navbar should be hidden
  const hideNavbarRoutes = ["/login", "/signup", "/uploadtutorcertificate"];

  // Check if current path starts with any route in the list
  if (hideNavbarRoutes.some((route) => location.pathname.startsWith(route))) {
    return null; // Don't render Navbar
  }

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Sider
      width={256}
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      trigger={null}
      theme={theme === "dark" ? "dark" : "light"}
      className="min-h-screen"
      style={{ 
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        zIndex: 10
      }}
    >
      <div className="logo p-4 text-center">
        {!collapsed && (
          <Title level={4} style={{ margin: 0, color: theme === "dark" ? "#fff" : "#001529" }}>
            MultiCourse
          </Title>
        )}
      </div>
      
      <Menu
        theme={theme === "dark" ? "dark" : "light"}
        onClick={onClick}
        defaultOpenKeys={["sub1"]}
        selectedKeys={[current]}
        mode="inline"
        items={items}
        style={{ 
          borderRight: 0,
          height: "calc(100vh - 64px)",
          overflow: "auto"
        }}
      />
      
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={toggleCollapsed}
        style={{
          position: "absolute",
          bottom: "20px",
          left: collapsed ? "16px" : "110px",
          color: theme === "dark" ? "#fff" : "#001529",
          border: "none",
          background: "transparent",
          transition: "all 0.3s"
        }}
      />
    </Sider>
  );
}

export default Sidebar;