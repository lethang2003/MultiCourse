import React, { useEffect, useState } from "react";
import axios from "axios";

const PurchaseHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get("http://localhost:3000/api/orders/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (err) {
        setError("Không thể tải lịch sử giao dịch");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Lịch sử giao dịch</h2>
      {orders.length === 0 ? (
        <p>Chưa có giao dịch nào.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order._id} className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">Mã đơn: {order._id}</h3>
              <p>Ngày đặt hàng: {new Date(order.order_date).toLocaleDateString()}</p>
              <p className="font-semibold">Khóa học đã mua:</p>
              <ul className="list-disc pl-5">
                {order.order_items.map((item) => (
                  <li key={item._id}>{item.course.title}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PurchaseHistory;