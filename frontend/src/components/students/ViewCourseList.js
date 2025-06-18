import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const ViewCourseList = () => {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Bạn cần đăng nhập để xem khóa học.");
      return;
    }

    // Kiểm tra xem có dữ liệu từ tìm kiếm hay không
    if (location.state?.courses) {
      setCourses(location.state.courses);
    } else {
      // Nếu không có dữ liệu tìm kiếm, tải toàn bộ khóa học từ API
      const fetchCourses = async () => {
        try {
          const response = await axios.get(
            "http://localhost:3000/api/courses/all-courses",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setCourses(response.data);
        } catch (err) {
          setError("Không thể lấy danh sách khóa học.");
        }
      };

      fetchCourses();
    }
  }, [location.state]); // Chạy lại khi có thay đổi từ `state`

  return (
    <div className="container">
      {error && <div className="error">{error}</div>}
      <h2>Danh sách khóa học</h2>
      {courses.length > 0 ? (
        <ul>
          {courses.map((course) => (
            <li key={course._id}>
              <img src={course.image} alt={course.title} />
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p>Giá: {course.price}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Không có khóa học nào phù hợp.</p>
      )}
    </div>
  );
};

export default ViewCourseList;
