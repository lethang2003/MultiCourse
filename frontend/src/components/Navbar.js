import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { useTheme } from "./context/ThemeContext";
import LogoMultiCourse from "../assets/MultiCourse-logo.png";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Divider,
  Badge,
  Switch,
  message,
  Tooltip,
  Tag
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  BookOutlined,
  DashboardOutlined,
  ContactsOutlined,
  InfoCircleOutlined,
  WalletOutlined,
  SettingOutlined,
  BellOutlined,
  DollarOutlined,
  RiseOutlined,
  BankOutlined
} from "@ant-design/icons";
import Cookies from "js-cookie";

const { Header } = Layout;
const { Title, Text } = Typography;

const Navbar = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("User");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [balance, setBalance] = useState(0);
  const [totalEarning, setTotalEarning] = useState(0);
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isHome = location.pathname === "/";
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [errorWallet, setErrorWallet] = useState(null);
  const [walletData, setWalletData] = useState(null);

  // Function to determine the active key based on current pathname
  const getActiveKey = () => {
    const path = location.pathname;

    if (path === "/") return "home";
    if (path === "/contact") return "contact";
    if (path === "/about") return "about";

    // Course List paths based on role
    if (role === "Admin" && path.includes("/statistic-for-admin"))
      return "courses";
    if (role === "Tutor" && path.includes("/courses-list-tutor"))
      return "courses";
    if (path.includes("/course-list")) return "courses";

    return "";
  };

  useEffect(() => {
    const fetchWalletData = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(
          "https://multicourse-q1mn.onrender.com/api/wallet/show-wallet-admin",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setWalletData(response.data);
      } catch (err) {
        setErrorWallet("Error loading wallet information");
      } finally {
        setLoadingWallet(false);
      }
    };

    if (role === "Admin") {
      fetchWalletData();
    }
  }, []);

  // Debounce function to delay navigation
  const debounce = (func, delay) => {
    let debounceTimer;
    return function (...args) {
      const context = this;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const debouncedNavigate = useCallback(
    debounce((path) => navigate(path), 300),
    [navigate]
  );

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("You are not logged in. Please log in again.");
      return;
    }

    try {
      const response = await axios.get(
        "https://multicourse-q1mn.onrender.com/api/users/get-user-by-token",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserData(response.data);
      localStorage.setItem("role", response.data.role);
      setRole(response.data.role);

      // Handle avatar URL from Google
      if (response.data.avatar) {
        const googleAvatarUrl = `${
          response.data.avatar
        }?${new Date().getTime()}`;
        setAvatarUrl(googleAvatarUrl);
        localStorage.setItem("avatarUrl", googleAvatarUrl);
      } else {
        const defaultAvatar =
          "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
        setAvatarUrl(defaultAvatar);
        localStorage.setItem("avatarUrl", defaultAvatar);
      }

      setFullname(response.data.fullname || "User");
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Your session has expired. Please log in again.");
      localStorage.removeItem("authToken");
      debouncedNavigate("/login");
    }
  };

  useEffect(() => {
    const savedAvatar = localStorage.getItem("avatarUrl");
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return;
      }
      const role = localStorage.getItem("role");
      if (role === "Admin") {
        return;
      }
      const response = await axios.get(
        "https://multicourse-q1mn.onrender.com/api/wallet/show-balance",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBalance(response.data.current_balance);
      
      // Nếu có total_earning trong response, cập nhật state
      if (response.data.total_earning !== undefined) {
        setTotalEarning(response.data.total_earning);
      }
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  useEffect(() => {
    let token = localStorage.getItem("authToken");
    if (!token) {
      token = Cookies.get("Token");
      if (token) {
        localStorage.setItem("authToken", token);
      }
    }

    if (token) {
      setIsLoggedIn(true);
      fetchUserProfile();
      fetchBalance();
    } else {
      setIsLoggedIn(false);
    }

    const protectedRoutes = ["/userprofile", "/cart"];
    if (protectedRoutes.includes(location.pathname) && !token) {
      debouncedNavigate("/login");
    }
  }, [debouncedNavigate, location.pathname]);

  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost; secure; SameSite=None;`;
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (token) {
        await axios.post(
          "https://multicourse-q1mn.onrender.com/api/users/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
             withCredentials: true,
            
          }
        );
      }

      // Clear token and info from localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("fullname");
      localStorage.removeItem("role");
      localStorage.removeItem("avatarUrl");
      localStorage.removeItem("userId");

      // Delete Token cookie
      deleteCookie("Token");

      // Trigger storage event to update Sidebar immediately
      window.dispatchEvent(new Event("storage"));

      // Update state to re-render component
      setIsLoggedIn(false);
      setUserData(null);
      setFullname("User");
      setAvatarUrl("");
      setRole("Student");

      // Navigate to login page
      debouncedNavigate("/");
      message.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      message.error("Error during logout. Please try again!");
    }
  };

  // Routes where navbar should be hidden
  const hideNavbarRoutes = ["/login", "/signup", "/uploadtutorcertificate"];

  // Check if current path starts with any route in the list
  if (hideNavbarRoutes.some((route) => location.pathname.startsWith(route))) {
    return null; // Don't render Navbar
  }

  // Menu items for navigation
  const navMenuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Home Pages",
      onClick: () => debouncedNavigate("/"),
    },
    {
      key: "courses",
      icon: <BookOutlined />,
      label: "Course List",
      onClick: () => {
        if (role === "Admin") {
          debouncedNavigate("/statistic-for-admin");
        } else if (role === "Tutor") {
          debouncedNavigate("/courses-list-tutor");
        } else {
          debouncedNavigate("/course-list");
        }
      },
    },
    {
      key: "contact",
      icon: <ContactsOutlined />,
      label: "Contact",
      onClick: () => debouncedNavigate("/contact"),
    },
    {
      key: "about",
      icon: <InfoCircleOutlined />,
      label: "About",
      onClick: () => debouncedNavigate("/about"),
    },
  ];

  // Dropdown menu for user
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => debouncedNavigate("/userprofile"),
    },
    ...(role === "Student"
      ? [
          {
            key: "cart",
            icon: <ShoppingCartOutlined />,
            label: "Cart",
            onClick: () => debouncedNavigate("/cart"),
          },
        ]
      : []),
    // {
    //   key: 'theme',
    //   icon: <SettingOutlined />,
    //   label: (
    //     <div className="flex items-center justify-between">
    //       <span>Dark Mode</span>
    //       <Switch
    //         checked={theme === 'dark'}
    //         onChange={toggleTheme}
    //         size="small"
    //       />
    //     </div>
    //   ),
    // },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: logout,
    },
  ];

  // Get current active key for menu
  const activeKey = getActiveKey();

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <Header
      style={{
        background: isHome
          ? "transparent"
          : theme === "dark"
          ? "#001529"
          : "#fff",
        position: isHome ? "fixed" : "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: isHome ? "none" : "0 2px 8px rgba(0, 0, 0, 0.15)",
        transition: "all 0.3s",
      }}
    >
      {/* Logo */}
      <div
        className="logo"
        onClick={() => debouncedNavigate("/")}
        style={{ cursor: "pointer" }}
      >
        <img
          src={LogoMultiCourse}
          alt="MultiCourse Logo"
          style={{
            width: "100px",
            height: "100px",
            marginRight: "10px",
            marginTop: "10px",
            marginLeft: "30px",
          }}
        />
      </div>

      {/* Navigation Menu - Always visible with active underline */}
      <Menu
        mode="horizontal"
        selectedKeys={[activeKey]}
        style={{
          background: "transparent",
          border: "none",
          color: isHome ? "#fff" : theme === "dark" ? "#fff" : "#001529",
          flex: "1 1 500px",
          display: "flex",
          justifyContent: "center",
        }}
        theme={isHome || theme === "dark" ? "dark" : "light"}
      >
        <Menu.Item
          key="home"
          icon={<HomeOutlined />}
          onClick={() => debouncedNavigate("/")}
          style={{
            borderBottom: activeKey === "home" ? "#1890ff" : "none",
            background:
              activeKey === "home" ? "rgba(24, 144, 255, 0.1)" : "transparent",
          }}
        >
          Home Page
        </Menu.Item>
        <Menu.Item
          key="courses"
          icon={<BookOutlined />}
          onClick={() => {
            if (role === "Admin") {
              debouncedNavigate("/statistic-for-admin");
            } else if (role === "Tutor") {
              debouncedNavigate("/courses-list-tutor");
            } else {
              debouncedNavigate("/course-list");
            }
          }}
          style={{
            borderBottom: activeKey === "courses" ? "#1890ff" : "none",
            background:
              activeKey === "courses"
                ? "rgba(24, 144, 255, 0.1)"
                : "transparent",
          }}
        >
          {role === "Admin" ? "Dashboard" : "Course List"}
        </Menu.Item>
        <Menu.Item
          key="contact"
          icon={<ContactsOutlined />}
          onClick={() => debouncedNavigate("/contact")}
          style={{
            borderBottom: activeKey === "contact" ? "#1890ff" : "none",
            background:
              activeKey === "contact"
                ? "rgba(24, 144, 255, 0.1)"
                : "transparent",
          }}
        >
          Contact
        </Menu.Item>
        <Menu.Item
          key="about"
          icon={<InfoCircleOutlined />}
          onClick={() => debouncedNavigate("/about")}
          style={{
            borderBottom: activeKey === "about" ? "#1890ff" : "none",
            background:
              activeKey === "about" ? "rgba(24, 144, 255, 0.1)" : "transparent",
          }}
        >
          About
        </Menu.Item>
      </Menu>

      {/* User Profile + Balance */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Balance Display */}
        {(role === "Tutor" || role === "Student" || role === "Admin") && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* Balance/Wallet Card */}
            <Tooltip title="Current Balance">
              <div
                style={{
                  padding: "4px 12px",
                  background:
                    theme === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.03)",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <WalletOutlined />
                <Text
                  strong
                  style={{ color: isHome || theme === "dark" ? "#fff" : "inherit" }}
                >
                  {role === "Admin" ? formatNumber(walletData?.current_balance || 0) : formatNumber(balance)} VND
                </Text>
              </div>
            </Tooltip>
            
            {/* Total Earning for Admin*/}
            {(role === "Admin") && (
              <Tooltip title="Total Earning">
                <div
                  style={{
                    padding: "4px 12px",
                    background: "rgba(82, 196, 26, 0.1)",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <RiseOutlined style={{ color: "#52c41a" }} />
                  <Text strong style={{ color: "#52c41a" }}>
                    {role === "Admin" 
                      ? formatNumber(walletData?.total_earning || 0) 
                      : formatNumber(totalEarning)} VND
                  </Text>
                </div>
              </Tooltip>
            )}

            {role === "Student" && (
              <Button
                type="primary"
                icon={<DollarOutlined />}
                size="small"
                onClick={() => debouncedNavigate("/deposit")}
              >
                Deposit
              </Button>
            )}
          </div>
        )}

        {/* User profile dropdown */}
        {isLoggedIn ? (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
            trigger={["click"]}
          >
            <Space style={{ cursor: "pointer" }}>
              <Avatar
                src={avatarUrl}
                icon={<UserOutlined />}
                size="large"
                style={{
                  border: `2px solid ${
                    theme === "dark" ? "#1890ff" : "#f0f0f0"
                  }`,
                  cursor: "pointer",
                }}
                onError={(e) => {
                  if (!e || !e.target) return;

                  console.log("Image failed to load, trying alternative URL");
                  e.target.onerror = null;

                  // Kiểm tra avatarUrl có tồn tại không
                  if (avatarUrl) {
                    try {
                      const alternativeUrl = avatarUrl.replace("=s96-c", "");
                      e.target.src = alternativeUrl;
                      e.target.onerror = () => {
                        if (e.target) {
                          e.target.src =
                            "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                        }
                      };
                    } catch (error) {
                      e.target.src =
                        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                    }
                  } else {
                    e.target.src =
                      "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                  }
                }}
                referrerPolicy="no-referrer"
              />
              <Text
                strong
                style={{
                  color: isHome || theme === "dark" ? "#fff" : "inherit",
                  "@media (max-width: 768px)": {
                    display: "none",
                  },
                }}
              >
                {fullname}
              </Text>
            </Space>
          </Dropdown>
        ) : (
          <Button type="primary" onClick={() => debouncedNavigate("/login")}>
            Login
          </Button>
        )}
      </div>
    </Header>
  );
};

export default Navbar;