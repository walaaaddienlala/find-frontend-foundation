/** PROPOSED model for migration 006_academy.sql. */
export type Course = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  level: "beginner" | "intermediate" | "advanced";
  status: "draft" | "published" | "archived";
};
export type CourseModule = { id: string; courseId: string; title: string; position: number };
export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  /** Reference to content (e.g. storage path/URL); content rendering is pending. */
  contentRef: string | null;
  position: number;
  durationMinutes: number | null;
};
export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  status: "active" | "completed" | "dropped";
  enrolledAt: string;
  completedAt: string | null;
};
export type LessonProgress = { userId: string; lessonId: string; completedAt: string };
export type Certificate = { id: string; userId: string; courseId: string; issuedAt: string; verificationCode: string };
