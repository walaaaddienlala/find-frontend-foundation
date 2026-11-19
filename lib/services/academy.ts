import type { Certificate, Course, Enrollment, LessonProgress } from "@/lib/models/academy";
import { unimplemented } from "@/lib/services/guard";
import type { ServiceResult } from "@/lib/services/result";

/** SCAFFOLDED. TODO(academy): implement after migration 006; only published courses are public. */
export interface AcademyService {
  listPublishedCourses(opts?: { page?: number; pageSize?: number; query?: string }): Promise<ServiceResult<Course[]>>;
  getCourseBySlug(slug: string): Promise<ServiceResult<Course>>;
  enroll(courseId: string): Promise<ServiceResult<Enrollment>>;
  markLessonComplete(lessonId: string): Promise<ServiceResult<LessonProgress>>;
  getMyProgress(): Promise<ServiceResult<{ enrollments: Enrollment[]; certificates: Certificate[] }>>;
}

export const academyService: AcademyService = {
  listPublishedCourses: () => unimplemented("Academy catalog"),
  getCourseBySlug: () => unimplemented("Academy catalog"),
  enroll: () => unimplemented("Academy enrollment"),
  markLessonComplete: () => unimplemented("Academy progress"),
  getMyProgress: () => unimplemented("Academy progress"),
};
