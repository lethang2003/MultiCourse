import React, { useEffect, useState } from "react";
import { 
  Table, 
  Input, 
  Button, 
  Tag, 
  Pagination, 
  message, 
  Card, 
  Typography, 
  Space, 
  Divider, 
  Empty, 
  Spin, 
  Badge
} from "antd";
import { 
  SearchOutlined, 
  CopyOutlined, 
  CalendarOutlined, 
  ReloadOutlined, 
  FileDoneOutlined, 
  LinkOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Certificate() {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterName, setFilterName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const certificatesPerPage = 6;
  const token = localStorage.getItem("authToken");

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:3000/api/certificates/get-all-certificates",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setCertificates(data.certificates);
      setFilteredCertificates(data.certificates);
      // message.success("Certificates loaded successfully");
    } catch (err) {
      console.error("Error fetching certificates:", err);
      message.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    message.success({
      content: "Certificate URL copied to clipboard!",
      icon: <CopyOutlined style={{ color: "#52c41a" }} />
    });
  };

  const handleFilterChange = (date, name) => {
    let filtered = certificates;
    if (date) {
      filtered = filtered.filter(
        (cert) => new Date(cert.issue_date).toISOString().split("T")[0] === date
      );
    }
    if (name) {
      filtered = filtered.filter((cert) =>
        cert.course.title.toLowerCase().includes(name.toLowerCase())
      );
    }
    setFilteredCertificates(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilterDate("");
    setFilterName("");
    setFilteredCertificates(certificates);
    setCurrentPage(1);
    message.info("Filters reset");
  };

  const paginatedCertificates = filteredCertificates.slice(
    (currentPage - 1) * certificatesPerPage,
    currentPage * certificatesPerPage
  );

  const columns = [
    {
      title: (
        <Space>
          <FileDoneOutlined />
          <Text strong>Course Title</Text>
        </Space>
      ),
      dataIndex: ["course", "title"],
      key: "title",
      sorter: (a, b) => a.course.title.localeCompare(b.course.title),
      width: "30%",
      render: (title) => (
        <Text ellipsis={{ tooltip: title }} style={{ maxWidth: 300 }}>
          {title}
        </Text>
      ),
    },
    {
      title: (
        <Text strong style={{ textAlign: "center", display: "block" }}>
          Status
        </Text>
      ),
      dataIndex: "isPassed",
      key: "status",
      render: (isPassed) => (
        <Badge 
          status={isPassed ? "success" : "error"} 
          text={
            <Tag 
              color={isPassed ? "success" : "error"} 
              style={{ 
                fontWeight: "500", 
                padding: "4px 12px", 
                borderRadius: "4px" 
              }}
            >
              {isPassed ? "PASSED" : "FAILED"}
            </Tag>
          } 
        />
      ),
      width: "15%",
      align: "center",
    },
    {
      title: (
        <Space>
          <CalendarOutlined />
          <Text strong>Issue Date</Text>
        </Space>
      ),
      dataIndex: "issue_date",
      key: "issue_date",
      render: (date) => (
        <Text style={{ color: "#1890ff" }}>
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
      width: "20%",
      align: "center",
    },
    {
      title: (
        <Space>
          <LinkOutlined />
          <Text strong>Certificate URL</Text>
        </Space>
      ),
      dataIndex: "certificate_url",
      key: "url",
      render: (url) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              borderRadius: "4px", 
              background: "blue", 
         
            }}
          >
            View
          </Button>
          <Button
            type="default"
            icon={<CopyOutlined />}
            onClick={() => copyToClipboard(url)}
            size="small"
            style={{ borderRadius: "4px" }}
          >
            Copy
          </Button>
        </Space>
      ),
      width: "25%",
      align: "center",
    },
  ];

  return (
    <div style={{ 
      minHeight: "100vh", 
      padding: "24px", 
      background: "linear-gradient(to right, #f0f2f5, #e6f7ff)" 
    }}>
      <Card
        style={{
          width: "90%",
          maxWidth: "1200px",
          margin: "0 auto",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          border: "none",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Space direction="vertical" size={4}>
            <Title 
              level={2} 
              style={{ 
                margin: 0, 
                // color: "#1890ff", 
                fontWeight: "bold" 
              }}
            >
              📜 Certificate Management
            </Title>
            <Text type="secondary">
              View and manage all your course certificates
            </Text>
          </Space>
        </div>

        <Divider style={{ margin: "12px 0 24px" }} />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space size="middle">
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                handleFilterChange(e.target.value, filterName);
              }}
              style={{ 
                width: "200px", 
                borderRadius: "6px",
              }}
              placeholder="Filter by date"
              prefix={<CalendarOutlined style={{ color: "#1890ff" }} />}
            />
            <Input
              placeholder="Search by course name..."
              value={filterName}
              onChange={(e) => {
                setFilterName(e.target.value);
                handleFilterChange(filterDate, e.target.value);
              }}
              prefix={<SearchOutlined style={{ color: "#1890ff" }} />}
              style={{ 
                width: "280px", 
                borderRadius: "6px" 
              }}
              allowClear
            />
          </Space>
          
          <Space>
            <Button 
              onClick={resetFilters} 
              icon={<ReloadOutlined />} 
              style={{ 
                borderRadius: "6px",
              }}
            >
              Reset
            </Button>
            <Button 
              type="primary" 
              onClick={fetchCertificates} 
              icon={<ReloadOutlined />} 
              style={{ 
                borderRadius: "6px",
              }}
            >
              Refresh
            </Button>
          </Space>
        </div>

        <div style={{ 
          background: "#fff", 
          borderRadius: "8px", 
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" 
        }}>
          <Spin spinning={loading} tip="Loading certificates...">
            <Table
              columns={columns}
              dataSource={paginatedCertificates}
              pagination={false}
              rowKey="_id"
              bordered={false}
              style={{ overflow: "hidden" }}
              rowClassName={(record, index) => index % 2 === 0 ? "table-row-light" : "table-row-dark"}
              locale={{ 
                emptyText: (
                  <Empty 
                    description="No certificates found" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  />
                ) 
              }}
            />
          </Spin>
        </div>

        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          marginTop: "20px"
        }}>
          <Pagination
            current={currentPage}
            total={filteredCertificates.length}
            pageSize={certificatesPerPage}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total) => `Total ${total} certificates`}
            style={{ 
              padding: "8px 16px", 
              background: "#fff", 
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
            }}
          />
        </div>
      </Card>

      <style jsx global>{`
        .table-row-light {
          background-color: #ffffff;
        }
        .table-row-dark {
          background-color: #f8f9fa;
        }
        .ant-table-thead > tr > th {
          background-color: #f0f7ff !important;
          color: #1890ff;
          font-weight: 500;
          padding: 16px;
        }
        .ant-table-tbody > tr > td {
          padding: 16px;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #e6f7ff !important;
        }
        .ant-pagination-item-active {
          border-color: #1890ff;
          font-weight: 500;
        }
        .ant-pagination-item-active a {
          color: #1890ff !important;
        }
        .ant-table {
          border-radius: 8px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}