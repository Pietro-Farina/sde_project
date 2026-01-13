import { Route, Routes } from "react-router";
import "./App.css";
import ExamplePage from "./components/ExamplePage";
import CoursesGrid from "./features/courses/CoursesGrid";
import CourseCalendar from "./features/bookings/CourseCalendar";
import CourseBookingPage from "./features/bookings/CourseBookingPage";
import BookingList from "./features/bookings/BookingList";
import LoginPage from "./features/auth/Login";
import ProtectedRoute from "./features/auth/ProtectedRoute";

function App() {
	return (
		<Routes>
			<Route path="/">
				{/* Public routes */}
				<Route index element={<CoursesGrid />} />
				<Route path="courses" element={<CoursesGrid />} />
				<Route path="login" element={<LoginPage />} />

				{/* Protected routes */}
				<Route element={<ProtectedRoute />}>
					<Route path="book/:id" element={<CourseBookingPage />} />
					<Route path="bookings" element={<BookingList />} />
				</Route>
			</Route>
		</Routes>
	);
}

export default App;
