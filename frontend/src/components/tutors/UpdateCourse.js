import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { message } from "antd";

const UpdateCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy id của khóa học từ URL
  const { register, handleSubmit, reset, setValue } = useForm();
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setErrorMessage("Please log in to update your course.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      fetchCourseDetails(token);
    }
  }, [navigate, id]);

  const fetchCourseDetails = async (token) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/courses/detail/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const course = response.data;
      setValue("title", course.title);
      setValue("description", course.description);
      setValue("price", course.price);
      setValue("category", course.category);
      setImagePreview(course.image);
    } catch (error) {
      setErrorMessage("Failed to fetch course details.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price);
      formData.append("category", data.category);
      if (data.image[0]) {
        formData.append("image", data.image[0]);
      }

      await axios.put(
        `http://localhost:3000/api/courses/update-course/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      message.success("Course updated successfully!");
      navigate("/courses"); // Quay về trang danh sách khóa học sau khi cập nhật
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "An error occurred while updating."
      );
      message.error(errorMessage || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex px-4 py-8">
      <form
        className="w-full p-8 rounded-lg shadow-lg"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="text-4xl font-bold text-left mb-8">
          Update Course
        </h1>

        {errorMessage && (
          <p className="text-red-500 text-center font-semibold mb-6">{errorMessage}</p>
        )}

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Course Title
          </label>
          <input
            type="text"
            {...register("title", { required: true })}
            placeholder="Enter course title"
            className="w-full px-6 py-4 border border-teal-500 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register("description", { required: true })}
            placeholder="Enter course description"
            className="w-full px-6 py-4 border border-teal-500 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
          ></textarea>
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Price
          </label>
          <input
            type="number"
            {...register("price", { required: true, min: 0 })}
            placeholder="Enter course price"
            className="w-full px-6 py-4 border border-teal-500 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            {...register("category", { required: true })}
            className="w-full px-6 py-4 border border-teal-500 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="">Select category</option>
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            {...register("image")}
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-900 cursor-pointer focus:outline-none"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-4 w-full h-48 object-cover border border-gray-300 rounded-md"
            />
          )}
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Course"}
          </button>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
};

export default UpdateCourse;
