import { Route, Routes } from "react-router";
import "./App.css";
import ExamplePage from "./components/ExamplePage";
import CoursesGrid from "./features/bookings/CoursesGrid";
import CourseCalendar from "./features/bookings/CourseCalendar";
import CourseBookingPage from "./features/bookings/CourseBookingPage";
import BookingList from "./features/bookings/BookingList";
import LoginPage from "./features/auth/Login";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={(
          <>
            {/* <CourseBookingPage /> */}
            <LoginPage />
            {/* <BookingList /> */}
            {/* <CoursesGrid />
            <CourseCalendar /> */}
            {/* <ExamplePage /> */}
          </>
        )}
      />
    </Routes>
  );
}

export default App;
