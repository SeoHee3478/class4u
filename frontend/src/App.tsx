import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "./api";

function App() {
  const {
    data: courses,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
  });

  if (isLoading) return <div className="p-6 text-gray-500">불러오는 중...</div>;
  if (isError)
    return (
      <div className="p-6 text-red-500">에러: {(error as Error).message}</div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">class4u 강좌 목록</h1>
      <div className="grid gap-4">
        {courses?.map((course) => (
          <div
            key={course.id}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <h2 className="font-semibold text-lg">{course.title}</h2>
            <p className="text-sm text-gray-600">{course.institution_name}</p>
            <div className="flex gap-2 mt-2 text-sm">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {course.weekdays?.join(", ")}
              </span>
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                {course.price === 0
                  ? "무료"
                  : `${course.price.toLocaleString()}원`}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {course.start_date} ~ {course.end_date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
