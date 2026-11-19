import type {
  AlertRule, AlertRuleInput, Notification, NotificationCategory,
  NotificationChannel, NotificationPreference,
} from "@/lib/models/notification";
import { unimplemented } from "@/lib/services/guard";
import type { ServiceResult } from "@/lib/services/result";

/**
 * SCAFFOLDED. TODO(notifications): implement after migration 003. Notification
 * rows are written server-side only (never by the browser); users may read their
 * own rows and update `read_at`. Delivery goes through lib/notifications/delivery.ts.
 */
export interface NotificationService {
  getPreferences(): Promise<ServiceResult<NotificationPreference[]>>;
  setPreference(input: { channel: NotificationChannel; category: NotificationCategory; enabled: boolean }): Promise<ServiceResult<NotificationPreference>>;
  listMyNotifications(opts?: { unreadOnly?: boolean; limit?: number }): Promise<ServiceResult<Notification[]>>;
  markRead(id: string): Promise<ServiceResult<null>>;
  markAllRead(): Promise<ServiceResult<null>>;
  listRules(): Promise<ServiceResult<AlertRule[]>>;
  createRule(input: AlertRuleInput): Promise<ServiceResult<AlertRule>>;
  setRuleActive(id: string, active: boolean): Promise<ServiceResult<AlertRule>>;
  deleteRule(id: string): Promise<ServiceResult<null>>;
}

export const notificationService: NotificationService = {
  getPreferences: () => unimplemented("Notification preferences"),
  setPreference: () => unimplemented("Notification preferences"),
  listMyNotifications: () => unimplemented("Notification center"),
  markRead: () => unimplemented("Notification center"),
  markAllRead: () => unimplemented("Notification center"),
  listRules: () => unimplemented("Alert rules"),
  createRule: () => unimplemented("Alert rules"),
  setRuleActive: () => unimplemented("Alert rules"),
  deleteRule: () => unimplemented("Alert rules"),
};
