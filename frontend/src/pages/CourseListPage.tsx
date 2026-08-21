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
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDate,
  getRegistrationStatus,
  REGISTRATION_STATUS_OPTIONS,
} from "@/lib/date";

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];
const PRICE_TYPES = [
  { value: "free", label: "무료" },
  { value: "paid", label: "유료" },
] as const;

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function ToggleFilterGroup({
  options,
  selected,
  onToggle,
  onClear,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      <Button
        size="sm"
        variant={selected.length === 0 ? "default" : "outline"}
        onClick={onClear}
      >
        전체
      </Button>
      {options.map((opt) => (
        <Button
          key={opt}
          size="sm"
          variant={selected.includes(opt) ? "default" : "outline"}
          onClick={() => onToggle(opt)}
        >
          {opt}
        </Button>
      ))}
    </div>
  );
}

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
  const [weekdays, setWeekdays] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [priceType, setPriceType] = useState<"" | "free" | "paid">("");

  const {
    data: courses,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["courses", weekdays, statuses, priceType],
    queryFn: () =>
      fetchCourses({
        weekdays: weekdays.length ? weekdays : undefined,
        statuses: statuses.length ? statuses : undefined,
        priceType: priceType || undefined,
      }),
  });

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-md mx-auto min-h-screen bg-background p-6">
        <h1 className="text-2xl font-bold mb-4">class4u 강좌 목록</h1>

        {/* 필터 UI */}
        <div className="flex flex-col gap-3 mb-6 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-1">요일</p>
            <ToggleFilterGroup
              options={WEEKDAYS}
              selected={weekdays}
              onToggle={(day) => setWeekdays(toggleValue(weekdays, day))}
              onClear={() => setWeekdays([])}
            />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">신청 상태</p>
            <ToggleFilterGroup
              options={REGISTRATION_STATUS_OPTIONS}
              selected={statuses}
              onToggle={(s) => setStatuses(toggleValue(statuses, s))}
              onClear={() => setStatuses([])}
            />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">수강료</p>
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant={priceType === "" ? "default" : "outline"}
                onClick={() => setPriceType("")}
              >
                전체
              </Button>
              {PRICE_TYPES.map((p) => (
                <Button
                  key={p.value}
                  size="sm"
                  variant={priceType === p.value ? "default" : "outline"}
                  onClick={() => setPriceType(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
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
