import type { Course } from "./types";

const BASE_URL = "http://localhost:3000";

export async function fetchCourses(params?: {
  weekdays?: string[];
  statuses?: string[];
  priceType?: "free" | "paid";
}): Promise<Course[]> {
  const query = new URLSearchParams();
  params?.weekdays?.forEach((day) => query.append("weekday", day));
  params?.statuses?.forEach((status) => query.append("status", status));
  if (params?.priceType) query.set("priceType", params.priceType);

  const res = await fetch(`${BASE_URL}/courses?${query.toString()}`);
  if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
  return res.json();
}

export async function fetchCourseById(id: string): Promise<Course> {
  const res = await fetch(`${BASE_URL}/courses/${id}`);
  if (res.status === 404) throw new Error("강좌를 찾을 수 없습니다.");
  if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
  return res.json();
}
