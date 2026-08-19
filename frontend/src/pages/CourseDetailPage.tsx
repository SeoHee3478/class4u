import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, RotateCcw } from "lucide-react";
import { fetchCourseById } from "@/api";
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
import { CourseMap } from "@/components/CourseMap";
import { formatDate, getDurationWeeks, getRegistrationStatus } from "@/lib/date";

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: course,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchCourseById(id!),
    enabled: !!id,
  });

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-md mx-auto min-h-screen bg-background p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="size-4" />
          목록으로
        </Link>

        {isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 p-10 text-center text-destructive">
            <p>{(error as Error).message}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RotateCcw />
              다시 시도
            </Button>
          </div>
        )}

        {course && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-xl font-bold">{course.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {course.institution_name}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{course.weekdays?.join(", ")}</Badge>
              <Badge variant={course.price === 0 ? "secondary" : "default"}>
                {course.price === 0
                  ? "무료"
                  : `${course.price.toLocaleString()}원`}
              </Badge>
              {(() => {
                const regStatus = getRegistrationStatus(
                  course.registration_start,
                  course.registration_end,
                );
                return (
                  regStatus && (
                    <Badge variant={regStatus.variant}>
                      {regStatus.label}
                    </Badge>
                  )
                );
              })()}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">강좌 기간</CardTitle>
                <CardDescription>
                  {formatDate(course.start_date)} ~{" "}
                  {formatDate(course.end_date)}
                  {(() => {
                    const weeks = getDurationWeeks(
                      course.start_date,
                      course.end_date,
                    );
                    return weeks ? ` (총 ${weeks}주)` : "";
                  })()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">신청 기간</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(course.registration_start)} ~{" "}
                  {formatDate(course.registration_end)}
                </p>
              </CardContent>
            </Card>

            <div>
              <p className="text-sm font-medium mb-2">위치</p>
              <p className="text-sm text-muted-foreground mb-2">
                {course.address}
              </p>
              <CourseMap address={course.address} />
            </div>

            {course.homepage_url && (
              <Button
                render={
                  <a
                    href={course.homepage_url}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                기관 홈페이지에서 보기
                <ExternalLink />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
