import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./components/authentication/Login";
import UploadTutorCertificate from "./components/tutors/UploadTutorCertificate";
import Signup from "./components/authentication/Signup";
import ForgetPassword from "./components/authentication/ForgetPassword";
import UserProfile from "./components/students/UserProfile";
import ViewCourseList from "./components/students/ViewCourseList";
import CourseList from "./components/students/CourseList";
import CourseDetail from "./components/students/CourseDetail";
import Cart from "./components/students/Cart";
import UpdateProfile from "./components/students/UpdateProfile";
import CourseManageTutor from "./components/tutors/CourseManageTutor";
import CreateCourse from "./components/tutors/CreateCourse";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { AuthProvider } from "./components/authentication/AuthContext"; // Giữ nguyên import AuthProvider
import CourseListForTutor from "./components/tutors/CourseListForTutor";
import UpdateCourse from "./components/tutors/UpdateCourse";
import CourseDetailForTutor from "./components/tutors/CourseDetailForTutor";
import { ThemeProvider } from "./components/context/ThemeContext";
import CreateLesson from "./components/tutors/lesson/CreateLesson";
import LessonDetail from "./components/tutors/lesson/LessonDetail";
import UpdateLessonModal from "./components/tutors/lesson/UpdateLessonModal";
import WalletManage from "./components/tutors/wallet/WalletManage";
import WithdrawalHistory from "./components/tutors/wallet/WithdrawalHistory";
import WalletManageForAdmin from "./components/admins/WalletManageForAdmin";
import MyCourses from "./components/students/MyCourse";
import CourseLearningPage from "./components/students/CourseLearning";
import CourseListForAdmin from "./components/admins/CourseListForAdmin";
import CreateExam from "./components/tutors/exam/CreateExam";
import ManageUser from "./components/admins/ManageUser";
import PurchaseHistory from "./components/students/PurchaseHistory";
import PurchaseHistoryForAdmin from "./components/admins/PurchaseHistoryForAdmin";
import ManageReview from "./components/admins/ManageReview";
import StatisticForAdmin from "./components/admins/StatisticForAdmin";
import FinalExam from "./components/students/FinalExam";
import Certificate from "./components/students/Certificate";
import RequestList from "./components/admins/RequestList";
import UpdateExam from "./components/tutors/exam/UpdateExam";
import WalletStudent from "./components/students/wallet/WalletStudent";
import ActivitiesHistory from "./components/admins/ActivitiesHistory";
import BuyerHistory from "./components/admins/BuyerHistory";
import StatisticForTutor from "./components/tutors/StatisticForTutor";
import Introduce from "./components/Introduce";
import DepositHistory from "./components/students/wallet/DepositHistory";
import HomeScreen from "./components/HomeScreen";
import Footer from "./components/Footer";
import Students from "./components/tutors/Students";
import CourseDetailForAdmin from "./components/admins/CourseDetailForAdmin";
import ViewCertificate from "./components/tutors/ViewCertificate";
import UpdateCourseModal from "./components/tutors/UpdateCourseModal";
import TutorRequests from "./components/tutors/TutorRequests";
import PurchasedCourseDetail from "./components/students/PurchasedCourseDetail";
import DepositHistoryForAdmin from "./components/admins/DepositHistoryForAdmin";
import { ActivityIcon } from "lucide-react";
import ActivityHistoryTutor from "./components/tutors/ActivityHistoryTutor";
import BuyerHistoryTuor from "./components/tutors/BuyerHistoryTutor";
import ContactPage from "./components/ContactPage";
import AboutPage from "./components/AboutPage";
// import RequestDetail from "./components/tutors/RequestDetail";

function Layout() {
  const location = useLocation();
  const [navbarKey, setNavbarKey] = useState(0);

  //kt tken
  const isAuthenticated = localStorage.getItem("authToken") !== null;
  console.log("authenticate:", isAuthenticated);

  // Hàm reload Navbar khi có thay đổi
  const reloadNavbar = () => {
    setNavbarKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    reloadNavbar(); // Gọi reload Navbar khi location thay đổi
  }, [location]);

  // khong hien sidebar
  const noSidebarPages = [
    "/login",
    "/signup",
    "/forgetpassword",
    "/",
    "/uploadtutorcertificate/:userId",
    "/homescreen",
    "/introduce",
  ];

  // kt url
  // chu thich o day
  // neu nhu token co thi se la false
  // neu nhu token khong co thi se la true
  const shouldHideSidebar = () => {
    if (!isAuthenticated) return true;

    // Kiểm tra xem đường dẫn hiện tại có khớp với bất kỳ đường dẫn nào trong danh sách không
    return noSidebarPages.some((path) => {
      // Xử lý cho các đường dẫn có tham số
      if (path.includes(":")) {
        const pathPattern = path.replace(/:\w+/g, "[^/]+");
        const regex = new RegExp(`^${pathPattern}$`);
        return regex.test(location.pathname);
      }
      // Kiểm tra chính xác đường dẫn
      return location.pathname === path;
    });
  };

  // Xác định xem có nên hiển thị sidebar hay không
  const hideSidebar = shouldHideSidebar();

  return (
    <div className="bg-white dark:bg-black w-screen max-h-screen flex flex-col">
      <Navbar key={navbarKey} reloadNavbar={reloadNavbar} />

      <div className="flex">
        {!hideSidebar && <Sidebar className="w-1/4" />}
        <div className={`${!hideSidebar ? "flex-1" : "w-full"}`}>
          <Routes>
            <Route path="/homescreen" element={<HomeScreen />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgetpassword" element={<ForgetPassword />} />
            <Route path="/" element={<HomeScreen />} />

            {/* Các route khác */}
            <Route path="/introduce" element={<Introduce />} />
            <Route
              path="/uploadtutorcertificate/:userId"
              element={<UploadTutorCertificate />}
            />
            <Route path="/userprofile" element={<UserProfile />} />
            <Route path="/updateprofile/:id" element={<UpdateProfile />} />
            <Route
              path="/courses-list-tutor"
              element={<CourseListForTutor />}
            />
            <Route path="/course-list" element={<CourseList />} />
            <Route path="/coursedetail/:id" element={<CourseDetail />} />
            <Route path="/createcourse" element={<CreateCourse />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wallet" element={<WalletManage />} />
            <Route path="/deposit-history" element={<DepositHistory />} />

            <Route path="/withdrawal-history" element={<WithdrawalHistory />} />
            <Route
              path="/purchased-course-detail/:id"
              element={<PurchasedCourseDetail />}
            />
            <Route
              path="/wallet-manage-for-admin"
              element={<WalletManageForAdmin />}
            />
            <Route
              path="/deposit-history-for-admin"
              element={<DepositHistoryForAdmin />}
            />
            <Route
              path="/coursemanagertutor/:courseId"
              element={<CourseManageTutor />}
            />
            <Route path="/updatecourse" element={<UpdateCourse />} />
            <Route
              path="/courses-list-tutor/:courseId"
              element={<CourseDetailForTutor />}
            />
            <Route
              path="/courses-list-for-admin/:courseId"
              element={<CourseDetailForAdmin />}
            />
            <Route path="/courses-list" element={<ViewCourseList />} />
            <Route path="/create-lesson/:courseId" element={<CreateLesson />} />
            <Route path="/lesson-detail/:lessonId" element={<LessonDetail />} />
            <Route
              path="/update-lesson/:lessonId"
              element={<UpdateLessonModal />}
            />

            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/deposit" element={<WalletStudent />} />
            <Route path="/manage-users" element={<ManageUser />} />

            <Route path="/courses/:courseId" element={<CourseLearningPage />} />

            <Route path="/purchase-history" element={<PurchaseHistory />} />

            <Route
              path="/purchase-history-for-admin"
              element={<PurchaseHistoryForAdmin />}
            />

            <Route path="/manage-review-for-admin" element={<ManageReview />} />

            <Route
              path="/statistic-for-admin"
              element={<StatisticForAdmin />}
            />

            <Route path="/final-exam/:courseId" element={<FinalExam />} />

            <Route
              path="/course-list-for-admin"
              element={<CourseListForAdmin />}
            />
            <Route path="/create-exam/:courseId" element={<CreateExam />} />
            <Route path="/update-exam/:courseId" element={<UpdateExam />} />

            <Route path="/my-certificate" element={<Certificate />} />
            <Route path="/manage-request-list" element={<RequestList />} />
            <Route
              path="/activities-history-list"
              element={<ActivitiesHistory />}
            />
            <Route path="/buyer-history-list" element={<BuyerHistory />} />
            <Route path="/statistic-tutor" element={<StatisticForTutor />} />
            <Route path="/student-list" element={<Students />} />
            <Route path="/certificate" element={<ViewCertificate />} />

            <Route
              path="/update-course/:courseId"
              element={<UpdateCourseModal />}
            />
            <Route path="/request-list" element={<TutorRequests />} />
            <Route path="/activity-history-tutor" element={<ActivityHistoryTutor />} />
            <Route path="/buyer-history-tutor" element={<BuyerHistoryTuor />} />

            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            {/* <Route
              path="/request-list/:requestId"
              element={<RequestDetail />}
            /> */}
          </Routes>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <div className="bg-white dark:bg-black w-screen h-screen">
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <Layout />
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
