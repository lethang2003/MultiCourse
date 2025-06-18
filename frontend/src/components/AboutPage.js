import React from "react";
import {
  Layout,
  Typography,
  Row,
  Col,
  Card,
  Divider,
  Avatar,
  Space,
  Statistic,
  Timeline,
  Button,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  HistoryOutlined,
  RocketOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useTheme } from "./context/ThemeContext";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const AboutPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "Nguyen Pham Tien Dat",
      role: "Founder & CEO",
      avatar: "/dat.jpg",
      bio: "With over 15 years in education technology, Nguyen Van A founded MultiCourse to make quality education accessible to everyone.",
    },
    {
      name: "Ta Hoang Trong",
      role: "Chief Academic Officer",
      avatar: "/trong.jpg",
      bio: "Former university professor with a passion for innovative teaching methods and curriculum development.",
    },
    {
      name: "Khuu Anh Tuan",
      role: "Head of Technology",
      avatar: "/tuan.jpg",
      bio: "Tech enthusiast and full-stack developer specializing in creating intuitive and accessible learning platforms.",
    },
    {
      name: "Nguyen Hoang Viet",
      role: "Student Success Manager",
      avatar: "/viet.jpg",
      bio: "Dedicated to ensuring students have the support they need to succeed in their educational journey.",
    },
    {
      name: "Le Phan Hung Thang",
      role: "Student Success Manager",
      avatar: "/thang.jpg",
      bio: "Dedicated to ensuring students have the support they need to succeed in their educational journey.",
    },
  ];

  return (
    <Content
      style={{
        padding: "50px 50px",
        background: theme === "dark" ? "#141414" : "#f0f2f5",
      }}
    >
      {/* Hero Section */}
      <Row justify="center" align="middle" style={{ marginBottom: 60 }}>
        <Col xs={24} md={18} lg={16} style={{ textAlign: "center" }}>
          <Space align="center" direction="vertical" size="large">
            <img
              src="/MultiCourse-logo.png"
              alt="MultiCourse Logo"
              style={{ width: "180px", height: "180px" }}
            />
            <Title
              level={1}
              style={{
                margin: 0,
                color: theme === "dark" ? "#fff" : "#001529",
              }}
            >
              About MultiCourse
            </Title>
            <Paragraph
              style={{
                fontSize: "18px",
                color:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.85)"
                    : "rgba(0, 0, 0, 0.65)",
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              MultiCourse is a leading online education platform connecting
              passionate tutors with eager students. Our mission is to make
              quality education accessible, affordable, and engaging for
              everyone.
            </Paragraph>
          </Space>
        </Col>
      </Row>

      {/* Mission and Vision */}
      <Row gutter={[32, 32]} justify="center" style={{ marginBottom: 60 }}>
        <Col xs={24} md={12}>
          <Card
            style={{
              height: "100%",
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Title
                level={3}
                style={{
                  color: theme === "dark" ? "#fff" : "#001529",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <RocketOutlined style={{ marginRight: 12, color: "#1890ff" }} />{" "}
                Our Mission
              </Title>
              <Paragraph style={{ fontSize: "16px" }}>
                At MultiCourse, our mission is to democratize education by
                providing a platform where knowledge can be shared freely across
                boundaries. We believe that education is a fundamental right,
                and our platform empowers both tutors and students to connect,
                collaborate, and grow together.
              </Paragraph>
              <Paragraph style={{ fontSize: "16px" }}>
                We strive to create an ecosystem where passionate educators can
                share their expertise while students can access quality courses
                at affordable prices, all within a supportive community that
                fosters lifelong learning.
              </Paragraph>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            style={{
              height: "100%",
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Title
                level={3}
                style={{
                  color: theme === "dark" ? "#fff" : "#001529",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TrophyOutlined style={{ marginRight: 12, color: "#1890ff" }} />{" "}
                Our Vision
              </Title>
              <Paragraph style={{ fontSize: "16px" }}>
                We envision a world where geographic and economic barriers no
                longer limit access to quality education. MultiCourse aims to be
                the bridge connecting skilled tutors with motivated learners,
                regardless of their background or location.
              </Paragraph>
              <Paragraph style={{ fontSize: "16px" }}>
                By 2030, we aim to become the most comprehensive and trusted
                online learning platform in Southeast Asia, offering courses in
                every major field of study and professional development, while
                maintaining our core values of accessibility, quality, and
                community.
              </Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Statistics */}
      <Row justify="center" style={{ marginBottom: 60 }}>
        <Col span={24}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Title
              level={3}
              style={{
                color: theme === "dark" ? "#fff" : "#001529",
                textAlign: "center",
                marginBottom: 40,
              }}
            >
              MultiCourse Impact
            </Title>

            <Row gutter={[32, 32]} justify="center">
              <Col xs={12} sm={6}>
                <Statistic
                  title="Students"
                  value={15000}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Courses"
                  value={500}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Tutors"
                  value={200}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Certificates Issued"
                  value={7500}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: "#eb2f96" }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Our Story Timeline */}
      <Row justify="center" style={{ marginBottom: 60 }}>
        <Col xs={24} lg={20}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Title
              level={3}
              style={{
                color: theme === "dark" ? "#fff" : "#001529",
                display: "flex",
                alignItems: "center",
              }}
            >
              <HistoryOutlined style={{ marginRight: 12, color: "#1890ff" }} />{" "}
              Our Journey
            </Title>
            <Divider style={{ margin: "16px 0 32px" }} />

            <Timeline mode="alternate" style={{ marginTop: 32 }}>
              <Timeline.Item color="green">
                <div style={{ padding: "0 20px" }}>
                  <Title level={4}>2019 - The Beginning</Title>
                  <Paragraph>
                    MultiCourse was founded with a simple idea: create a
                    platform where tutors and students can connect without
                    barriers.
                  </Paragraph>
                </div>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <div style={{ padding: "0 20px" }}>
                  <Title level={4}>2020 - Growth Amidst Challenges</Title>
                  <Paragraph>
                    During the global pandemic, we enhanced our platform to
                    accommodate the surge in remote learning, helping thousands
                    of students continue their education uninterrupted.
                  </Paragraph>
                </div>
              </Timeline.Item>
              <Timeline.Item color="gold">
                <div style={{ padding: "0 20px" }}>
                  <Title level={4}>2021 - Expanding Horizons</Title>
                  <Paragraph>
                    We introduced new course categories and innovative features,
                    including interactive learning tools and an improved
                    certification system.
                  </Paragraph>
                </div>
              </Timeline.Item>
              <Timeline.Item color="red">
                <div style={{ padding: "0 20px" }}>
                  <Title level={4}>2022 - Community Focus</Title>
                  <Paragraph>
                    Launched student forums, tutor mentorship programs, and
                    community events to foster deeper connections within our
                    growing educational ecosystem.
                  </Paragraph>
                </div>
              </Timeline.Item>
              <Timeline.Item color="purple">
                <div style={{ padding: "0 20px" }}>
                  <Title level={4}>2023 - Innovation</Title>
                  <Paragraph>
                    Introduced advanced learning analytics and personalized
                    learning paths to enhance the educational experience for all
                    users.
                  </Paragraph>
                </div>
              </Timeline.Item>
              <Timeline.Item color="green">
                <div style={{ padding: "0 20px" }}>
                  <Title level={4}>2024 - Today & Beyond</Title>
                  <Paragraph>
                    Continuing to grow and innovate, with a focus on expanding
                    access to quality education throughout Southeast Asia and
                    beyond.
                  </Paragraph>
                </div>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* Core Values */}
      <Row justify="center" style={{ marginBottom: 60 }}>
        <Col xs={24}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Title
              level={3}
              style={{
                color: theme === "dark" ? "#fff" : "#001529",
                textAlign: "center",
                marginBottom: 40,
              }}
            >
              Our Core Values
            </Title>

            <Row gutter={[32, 32]}>
              <Col xs={24} sm={12} md={8}>
                <Card style={{ height: "100%", borderColor: "#1890ff" }}>
                  <Space
                    direction="vertical"
                    size="small"
                    align="center"
                    style={{ width: "100%", textAlign: "center" }}
                  >
                    <CheckCircleOutlined
                      style={{ fontSize: 36, color: "#1890ff" }}
                    />
                    <Title level={4}>Accessibility</Title>
                    <Paragraph>
                      We believe education should be available to everyone,
                      regardless of location or financial status.
                    </Paragraph>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card style={{ height: "100%", borderColor: "#52c41a" }}>
                  <Space
                    direction="vertical"
                    size="small"
                    align="center"
                    style={{ width: "100%", textAlign: "center" }}
                  >
                    <CheckCircleOutlined
                      style={{ fontSize: 36, color: "#52c41a" }}
                    />
                    <Title level={4}>Quality</Title>
                    <Paragraph>
                      We maintain high standards for our courses, tutors, and
                      platform to deliver exceptional learning experiences.
                    </Paragraph>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card style={{ height: "100%", borderColor: "#faad14" }}>
                  <Space
                    direction="vertical"
                    size="small"
                    align="center"
                    style={{ width: "100%", textAlign: "center" }}
                  >
                    <CheckCircleOutlined
                      style={{ fontSize: 36, color: "#faad14" }}
                    />
                    <Title level={4}>Innovation</Title>
                    <Paragraph>
                      We constantly evolve our platform and teaching methods to
                      meet the changing needs of our users.
                    </Paragraph>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card style={{ height: "100%", borderColor: "#eb2f96" }}>
                  <Space
                    direction="vertical"
                    size="small"
                    align="center"
                    style={{ width: "100%", textAlign: "center" }}
                  >
                    <CheckCircleOutlined
                      style={{ fontSize: 36, color: "#eb2f96" }}
                    />
                    <Title level={4}>Community</Title>
                    <Paragraph>
                      We foster meaningful connections between students and
                      tutors to create a supportive learning environment.
                    </Paragraph>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card style={{ height: "100%", borderColor: "#722ed1" }}>
                  <Space
                    direction="vertical"
                    size="small"
                    align="center"
                    style={{ width: "100%", textAlign: "center" }}
                  >
                    <CheckCircleOutlined
                      style={{ fontSize: 36, color: "#722ed1" }}
                    />
                    <Title level={4}>Integrity</Title>
                    <Paragraph>
                      We operate with transparency and honesty in all our
                      interactions and business practices.
                    </Paragraph>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card style={{ height: "100%", borderColor: "#13c2c2" }}>
                  <Space
                    direction="vertical"
                    size="small"
                    align="center"
                    style={{ width: "100%", textAlign: "center" }}
                  >
                    <CheckCircleOutlined
                      style={{ fontSize: 36, color: "#13c2c2" }}
                    />
                    <Title level={4}>Lifelong Learning</Title>
                    <Paragraph>
                      We promote continuous growth and development for all
                      members of our community.
                    </Paragraph>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Team Section */}
      <Row justify="center" style={{ marginBottom: 60 }}>
        <Col xs={24}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Title
              level={3}
              style={{
                color: theme === "dark" ? "#fff" : "#001529",
                textAlign: "center",
                marginBottom: 40,
              }}
            >
              Meet Our Team
            </Title>

            <Row
              gutter={[32, 32]}
              style={{ display: "flex", flexWrap: "nowrap" }}
            >
              {teamMembers.map((member, index) => (
                <Col flex="1" key={index}>
                  <Card
                    style={{
                      textAlign: "center",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      minHeight: "500px",
                    }}
                  >
                    <Space
                      direction="vertical"
                      size="middle"
                      align="center"
                      style={{
                        width: "100%",
                        flex: 1,
                        justifyContent: "space-between",
                        padding: "20px 0",
                      }}
                    >
                      <div style={{ width: "100%" }}>
                        <Avatar
                          size={100}
                          src={member.avatar}
                          style={{ border: "4px solid #f0f0f0" }}
                        />
                        <Title
                          level={4}
                          style={{
                            margin: "16px 0 4px",
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                            lineHeight: "1.4",
                            minHeight: "60px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {member.name}
                        </Title>
                        <Text
                          type="secondary"
                          strong
                          style={{
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                            lineHeight: "1.4",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {member.role}
                        </Text>
                      </div>
                      <Divider style={{ margin: "12px 0" }} />
                      <Paragraph
                        style={{
                          wordBreak: "break-word",
                          marginBottom: 0,
                          whiteSpace: "normal",
                          lineHeight: "1.4",
                          minHeight: "100px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {member.bio}
                      </Paragraph>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      <Row justify="center">
        <Col xs={24} md={16} style={{ textAlign: "center" }}>
          <Card
            style={{
              background: theme === "dark" ? "#1f1f1f" : "#fff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              padding: "20px",
            }}
          >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Title
                level={2}
                style={{ color: theme === "dark" ? "#fff" : "#001529" }}
              >
                Join Our Learning Community
              </Title>
              <Paragraph style={{ fontSize: "16px", marginBottom: 24 }}>
                Whether you're looking to learn new skills or share your
                expertise as a tutor, MultiCourse is the perfect platform to
                achieve your goals.
              </Paragraph>
              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate("/course-list")}
                >
                  Explore Courses
                </Button>
                <Button
                  size="large"
                  onClick={() =>
                    navigate("/signup", { state: { role: "Tutor" } })
                  }
                >
                  Become a Tutor
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

export default AboutPage;
