import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import { 
  DollarOutlined, 
  CalendarOutlined, 
  LineChartOutlined, 
  PieChartOutlined 
} from "@ant-design/icons";
import { Spin, Card, Statistic, Typography, message } from "antd";

const { Title } = Typography;

export default function TutorStatistics() {
  const [courseEarnings, setCourseEarnings] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [todayRevenue, setTodayRevenue] = useState(null);
  const [yearlyRevenue, setYearlyRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [courseRes, monthRes, todayRes, yearRes] = await Promise.all([
          axios.get(
            "https://multicourse-q1mn.onrender.com/api/orders/total-earning-from-course",
            { headers }
          ),
          axios.get("https://multicourse-q1mn.onrender.com/api/orders/revenue-month-tutor", {
            headers,
          }),
          axios.get("https://multicourse-q1mn.onrender.com/api/orders/revenue-day-tutor", {
            headers,
          }),
          axios.get("https://multicourse-q1mn.onrender.com/api/orders/revenue-year-tutor", {
            headers,
          }),
        ]);

        // Ensure courseEarnings is an array
        setCourseEarnings(Array.isArray(courseRes.data) ? courseRes.data : []);
        setMonthlyRevenue(monthRes.data);
        setTodayRevenue(todayRes.data.totalRevenueToday);
        setYearlyRevenue(yearRes.data.totalRevenueThisYear);

        setLoading(false);
      } catch (error) {
        message.error("Failed to fetch statistics");
        setError(error);
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 text-center mt-4">
        {error.message}
      </div>
    );

  // Colors for charts
  const COLORS = [
    "#1890ff", // Ant Design Blue
    "#52c41a", // Ant Design Green
    "#faad14", // Ant Design Yellow
    "#f5222d", // Ant Design Red
    "#722ed1"  // Ant Design Purple
  ];

  // Prepare course earnings data
  const courseEarningsData = Array.isArray(courseEarnings) 
    ? courseEarnings 
    : [];

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <Card 
        className="max-w-6xl mx-auto shadow-lg rounded-2xl"
        title={
          <div className="flex items-center justify-center space-x-3">
            <LineChartOutlined className="text-3xl text-blue-600" />
            <Title level={2} className="mb-0 text-gray-800">
              Tutor Statistics Dashboard
            </Title>
          </div>
        }
      >
        {/* Revenue Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card 
            hoverable 
            className="bg-blue-50 border-blue-200"
          >
            <Statistic
              title={
                <div className="flex items-center">
                  <CalendarOutlined className="mr-2 text-blue-600" />
                  Today's Revenue
                </div>
              }
              value={todayRevenue}
              prefix="₫"
              precision={0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>

          <Card 
            hoverable 
            className="bg-green-50 border-green-200"
          >
            <Statistic
              title={
                <div className="flex items-center">
                  <DollarOutlined className="mr-2 text-green-600" />
                  Yearly Revenue
                </div>
              }
              value={yearlyRevenue}
              prefix="₫"
              precision={0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </div>

        {/* Monthly Revenue Bar Chart */}
        <Card 
          title={
            <div className="flex items-center">
              <PieChartOutlined className="mr-2 text-blue-600" />
              Monthly Revenue Breakdown
            </div>
          }
          className="mb-8"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }} 
              />
              <Bar 
                dataKey="revenue" 
                fill="#1890ff" 
                barSize={50} 
                radius={[5, 5, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Course Earnings Pie Chart */}
        {/* {courseEarningsData.length > 0 && (
          <Card 
            title={
              <div className="flex items-center">
                <PieChartOutlined className="mr-2 text-blue-600" />
                Course Earnings Distribution
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={courseEarningsData} 
                  dataKey="totalIncome" 
                  nameKey="course_id" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100}
                  label
                >
                  {courseEarningsData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center" 
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )} */}
      </Card>
    </div>
  );
}