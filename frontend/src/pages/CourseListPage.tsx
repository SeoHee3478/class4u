import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Inbox, RotateCcw } from "lucide-react";
import { fetchCourses } from "@/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatDate, getRegistrationStatus } from "@/lib/date";

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

function CourseCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-3 w-2/5 mt-2" />
      </CardContent>
    </Card>
  );
}

export function CourseListPage() {
  const [weekday, setWeekday] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const debouncedMaxPrice = useDebouncedValue(maxPrice, 400);

  const {
    data: courses,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["courses", weekday, debouncedMaxPrice],
    queryFn: () =>
      fetchCourses({
        weekday: weekday || undefined,
        maxprice: debouncedMaxPrice ? parseInt(debouncedMaxPrice) : undefined,
      }),
  });

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-md mx-auto min-h-screen bg-background p-6">
        <h1 className="text-2xl font-bold mb-4">class4u 강좌 목록</h1>

        {/* 필터 UI */}
        <div className="flex flex-wrap gap-3 items-center mb-6 p-4 bg-muted rounded-lg">
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant={weekday === "" ? "default" : "outline"}
              onClick={() => setWeekday("")}
            >
              전체
            </Button>
            {WEEKDAYS.map((day) => (
              <Button
                key={day}
                size="sm"
                variant={weekday === day ? "default" : "outline"}
                onClick={() => setWeekday(day)}
              >
                {day}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full">
            <label className="text-sm text-muted-foreground shrink-0">
              최대 가격
            </label>
            <Input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="예: 30000"
              className="w-28"
            />
            {maxPrice && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMaxPrice("")}
              >
                초기화
              </Button>
            )}
          </div>
        </div>

        {/* 결과 */}
        {isLoading && (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 p-10 text-center text-destructive">
            <p>에러: {(error as Error).message}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RotateCcw />
              다시 시도
            </Button>
          </div>
        )}

        {courses && courses.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
            <Inbox className="size-8" />
            <p>조건에 맞는 강좌가 없습니다.</p>
          </div>
        )}

        {courses && courses.length > 0 && (
          <div className="grid gap-4">
            {courses.map((course) => {
              const regStatus = getRegistrationStatus(
                course.registration_start,
                course.registration_end,
              );
              return (
                <Link key={course.id} to={`/courses/${course.id}`}>
                  <Card className="hover:shadow-md transition">
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>
                        {course.institution_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {course.weekdays?.join(", ")}
                        </Badge>
                        <Badge
                          variant={
                            course.price === 0 ? "secondary" : "default"
                          }
                        >
                          {course.price === 0
                            ? "무료"
                            : `${course.price.toLocaleString()}원`}
                        </Badge>
                        {regStatus && (
                          <Badge variant={regStatus.variant}>
                            {regStatus.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(course.start_date)} ~{" "}
                        {formatDate(course.end_date)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
