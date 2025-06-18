import React from "react";
import { useNavigate } from "react-router-dom";

const Introduce = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Giới thiệu về Ứng dụng</h1>
      <p className="mb-8">
        Đây là trang giới thiệu, vui lòng đăng nhập để trải nghiệm đầy đủ tính
        năng.
      </p>
      <button
        onClick={() => {
          console.log("Bấm nút Đăng nhập");
          navigate("/login");
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Đăng nhập
      </button>
    </div>
  );
};

export default Introduce;
