import React, { useState } from "react";
import axios from "axios";

const CreateComment = ({ courseId, onCommentAdded }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.post(
        "https://multicourse-q1mn.onrender.com/api/comments/create-course-comment",
        { courseId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Bình luận đã được thêm thành công!");
      setComment("");
      setRating(5);
      
      if (onCommentAdded) onCommentAdded(response.data.comment);
    } catch (err) {
      setError("Lỗi khi gửi bình luận. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-md">
      <h3 className="text-lg font-bold mb-3">Thêm bình luận</h3>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block font-medium">Đánh giá:</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full p-2 border rounded-md"
        >
          {[5, 4, 3, 2, 1].map((star) => (
            <option key={star} value={star}>
              {star} ⭐
            </option>
          ))}
        </select>

        <label className="block font-medium">Bình luận:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border rounded-md"
          rows="4"
          placeholder="Nhập bình luận của bạn..."
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          {loading ? "Đang gửi..." : "Gửi bình luận"}
        </button>
      </form>
    </div>
  );
};

export default CreateComment;
