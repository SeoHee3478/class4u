import { Route, Routes } from "react-router-dom";
import { CourseListPage } from "@/pages/CourseListPage";
import { CourseDetailPage } from "@/pages/CourseDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<CourseListPage />} />
      <Route path="/courses/:id" element={<CourseDetailPage />} />
    </Routes>
  );
}

export default App;
