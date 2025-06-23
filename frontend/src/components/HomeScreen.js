import React from "react";
import {
  Book,
  Video,
  Users,
  ShieldCheck,
  Star,
  DollarSign,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";


export default function HomeScreen() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");
  const [tutors, setTutors] = useState([]);
  const [bestSeller, setBestSeller] = useState([]);

  //   function showFlyingDragon() {
  //     const dragon = document.createElement("img");
  //     dragon.src = "/dragon.gif"; // Đường dẫn tới hình ảnh con rồng
  //     dragon.alt = "Flying Dragon";
  //     dragon.style.position = "fixed";
  //     dragon.style.top = "50%";
  //     dragon.style.left = "-300px";
  //     dragon.style.width = "600px"; // Kích thước con rồng
  //     dragon.style.height = "auto";
  //     dragon.style.animation = "flyDragon 5s linear forwards";
  //     dragon.style.zIndex = "1000"; // Đảm bảo con rồng nằm trên các thành phần khác
  //     document.body.appendChild(dragon);

  //     // Xóa con rồng sau khi hoàn thành animation
  //     setTimeout(() => {
  //       dragon.remove();
  //     }, 5000);
  //   }

  //   // Thêm keyframes cho animation
  //   const style = document.createElement("style");
  //   style.innerHTML = `
  //     @keyframes flyDragon {
  //         0% {
  //             transform: translateX(0) scale(1);
  //         }
  //         50% {
  //             transform: translateX(50vw) translateY(-20px) scale(1.2);
  //         }
  //         100% {
  //             transform: translateX(110vw) scale(1);
  //         }
  //     }
  // `;
  //   document.head.appendChild(style);

  //   // Gọi hàm trong useEffect
  //   useEffect(() => {
  //     showFlyingDragon();
  //   }, []);

  useEffect(() => {
    const fetchTopTutors = async () => {
      try {
        const response = await fetch(
          "https://multicourse-q1mn.onrender.com/api/courses/top-tutors",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setTutors(data);
        console.log("Top tutors data:", data);
      } catch (error) {
        console.error("Error fetching top tutors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopTutors();
  }, [token]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://multicourse-q1mn.onrender.com/api/courses/top-courses",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    };

    fetchCourses();
  }, [token]);

  useEffect(() => {
    const fetchBestSeller = async () => {
      try {
        const response = await fetch(
          "https://multicourse-q1mn.onrender.com/api/courses/best-seller",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const data = await response.json();
        console.log("Dữ liệu best seller:", data);

        if (data.length > 0) {
          setBestSeller(data[0]);
        } else {
          setBestSeller(null);
        }
      } catch (error) {
        console.error("Lỗi khi lấy khóa học bán chạy:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSeller();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );

  return (
    <div className="w-full min-h-screen flex flex-col bg-white items-center text-black dark:text-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section with Video Background */}
      <div className="relative w-full h-screen overflow-hidden">
        <video
          className="absolute w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/How To Study_n.mp4" type="video/mp4" />
        </video>

        {/* Overlay with content */}
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white px-6">
          <h1 className="text-5xl md:text-7xl font-bold text-center tracking-tight mb-6">
            Welcome to <span className="text-cyan-400">MultiCourse</span>
          </h1>
          <p className="text-xl md:text-2xl text-center max-w-3xl mb-8">
            Unlock your potential with expert-led courses, interactive lessons,
            and a supportive learning community
          </p>
          {/* <a href="/course-list">
            <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300">
              Get Started
            </button>
          </a> */}



<Link to="/course-list">
  <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300">
    Get Started
  </button>
</Link>

        </div>
      </div>

      {/* Main Content */}
      <div className="w-full flex flex-col items-center justify-center text-black dark:text-white px-6 bg-white dark:bg-gray-900">
        {/* Features Section */}
        <div className="max-w-7xl w-full py-20">
          <h2 className="text-4xl font-bold text-center mb-4">
            Why Choose <span className="text-cyan-500">MultiCourse</span>
          </h2>
          <p className="text-lg text-center text-gray-600 dark:text-gray-300 mb-16 max-w-3xl mx-auto">
            Join thousands of students worldwide and start mastering new skills
            today with our comprehensive learning platform
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Book size={40} className="text-cyan-500" />}
              title="Diverse Courses"
              description="Explore courses from different fields, taught by experts."
            />
            <FeatureCard
              icon={<Video size={40} className="text-cyan-500" />}
              title="Interactive Learning"
              description="Engaging video lessons and quizzes to test your knowledge."
            />
            <FeatureCard
              icon={<Users size={40} className="text-cyan-500" />}
              title="Community Support"
              description="Connect with fellow learners and share knowledge."
            />
            <FeatureCard
              icon={<ShieldCheck size={40} className="text-cyan-500" />}
              title="Certified Courses"
              description="Earn recognized certificates upon course completion."
            />
          </div>
        </div>

        {/* Top Courses Section */}
        <div className="w-full bg-gradient-to-r from-blue-900 to-cyan-800 py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-white mb-2">
              🔥 Top 5 Highest Rated Courses
            </h2>
            <div className="w-24 h-1 bg-cyan-400 mx-auto mb-16"></div>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center text-white text-xl">
                <p>There are no courses currently available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Best Seller Section */}
        <div className="w-full py-20 px-6 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-2">
              <span className="text-cyan-500">Best Selling</span> Course
            </h2>
            <div className="w-24 h-1 bg-cyan-400 mx-auto mb-16"></div>

            {bestSeller && bestSeller.course ? (
              <div className="flex flex-col md:flex-row items-center bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
                <div className="w-full md:w-1/2 relative">
                  <img
                    src={bestSeller.course.image || "/default-image.jpg"}
                    alt={bestSeller.course.title}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 text-lg font-bold rounded-lg shadow-lg animate-pulse">
                    🔥 {bestSeller.totalSold} SALES
                  </div>
                </div>

                <div className="w-full md:w-1/2 p-10">
                  <h3 className="text-3xl font-bold text-cyan-500 mb-2">
                    {bestSeller.course.title}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 italic">
                    {bestSeller.course.category}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                    {bestSeller.course.description}
                  </p>

                  <div className="flex items-center mb-6">
                    {/* <DollarSign className="text-green-500 mr-2" size={24} /> */}
                    <span className="text-3xl font-bold text-green-600">
                      {bestSeller.course.price} VND
                    </span>
                  </div>

                  <div className="mb-8 text-sm text-gray-500 flex items-center">
                    <Clock size={16} className="mr-2" />
                    {bestSeller.course.date
                      ? new Date(bestSeller.course.date).toLocaleDateString()
                      : "No information available"}
                  </div>

                  {/* <a href={`/coursedetail/${bestSeller.course._id}`}>
                    <button className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300">
                      Explore Now
                    </button>
                  </a> */}
     

                  <Link to={`/coursedetail/${bestSeller.course._id}`}>
                    <button className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300">
                      Explore Now
                    </button>
                  </Link>

                </div>
              </div>
            ) : (
              <div className="text-center text-xl text-red-500">
                <p>No best-selling courses available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Tutors Section */}
        <div className="w-full py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-2">
              Top 5 Influential <span className="text-cyan-500">Tutors</span>
            </h2>
            <div className="w-24 h-1 bg-cyan-400 mx-auto mb-16"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {tutors.map((tutor) => (
                <TutorCard key={tutor._id} tutor={tutor} />
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="relative w-full py-32 bg-gray-900 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img
              src="/online-6204349_1280.jpg"
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              Start Your Learning Journey Today
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              Join our community of learners and start mastering new skills with
              expert guidance
            </p>
            <div className="aspect-video max-w-3xl mx-auto overflow-hidden rounded-xl shadow-2xl">
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/How To Study2.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
      <div className="w-16 h-16 mx-auto bg-cyan-50 dark:bg-cyan-900 rounded-full flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

// Course Card Component
function CourseCard({ course }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
      {/* Image section with overlay and badges */}
      <div className="relative group">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category badge */}
        <div className="absolute top-3 right-3 bg-cyan-500 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm">
          {course.category}
        </div>

        {/* Price badge */}
        <div className="absolute bottom-3 left-3 bg-white dark:bg-gray-800 text-red-600 font-bold px-3 py-1 rounded-md shadow-sm text-sm flex items-center">
          <DollarSign size={14} className="mr-1" /> {course.price} VND
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content section */}
      <div className="p-6">
        {/* Title and tutor */}
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-cyan-500 transition-colors duration-300">
            {course.title}
          </h3>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Users size={14} className="mr-1" />
            <span>
              Tutor:{" "}
              <span className="font-medium">{course.tutor?.fullname}</span>
            </span>
          </div>
        </div>

        {/* Rating and action */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
          {/* Star rating */}
          <div className="flex items-center">
            <div className="flex mr-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={`${
                    course.average_rating &&
                    star <= Math.round(course.average_rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              ({course.average_rating?.toFixed(1) || "N/A"})
            </span>
          </div>

          {/* Action button */}
          {/* <a href={`/coursedetail/${course._id}`}>
            <button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center">
              View <ArrowRight size={14} className="ml-1" />
            </button>
          </a> */}

          <Link to={`/coursedetail/${course._id}`}>
  <button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center">
    View <ArrowRight size={14} className="ml-1" />
  </button>
</Link>
        </div>
      </div>
    </div>
  );
}

// Tutor Card Component
function TutorCard({ tutor }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 relative">
      {tutor.averageRating >= 4.5 && (
        <div className="absolute -top-3 -right-3 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold shadow-md">
          🌟 Top Rated
        </div>
      )}

      <div className="w-24 h-24 mx-auto bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
        {tutor.tutor.fullname.charAt(0)}
      </div>

      <h3 className="text-xl font-bold mb-2">{tutor.tutor.fullname}</h3>

      <div className="flex items-center justify-center mb-4">
        <Star className="text-yellow-400 mr-1" size={16} />
        <span className="font-semibold">{tutor.averageRating.toFixed(1)}</span>
        <span className="text-gray-500 text-sm ml-1">
          ({tutor.totalReviews} reviews)
        </span>
      </div>
    </div>
  );
}
