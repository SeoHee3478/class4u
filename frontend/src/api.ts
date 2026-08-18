import type { Course } from "./types";

const BASE_URL = "http://localhost:3000";

export async function fetchCourses(params?: {
  weekday?: string;
  maxprice?: number;
}): Promise<Course[]> {
  const query = new URLSearchParams();
  if (params?.weekday) query.set("weekday", params.weekday);
  if (params?.maxprice) query.set("maxprice", String(params.maxprice));

  const res = await fetch(`${BASE_URL}/courses?${query.toString()}`);
  if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
  return res.json();
}
