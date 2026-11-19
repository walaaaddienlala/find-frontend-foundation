/** PROPOSED model for migration 003_notifications.sql. */
export const notificationChannels = ["in_app", "email", "push", "whatsapp"] as const;
export type NotificationChannel = (typeof notificationChannels)[number];

export const notificationCategories = [
  "matching_opportunities", "deadlines", "saved_updates", "application_status",
  "missing_documents", "learning", "mentor_messages", "community_replies",
  "events", "ai_recommendations",
] as const;
export type NotificationCategory = (typeof notificationCategories)[number];

export type NotificationPreference = {
  channel: NotificationChannel;
  category: NotificationCategory;
  enabled: boolean;
  /** Required for push and WhatsApp before any delivery. */
  consentedAt: string | null;
};

export type Notification = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  dedupeKey: string;
  readAt: string | null;
  createdAt: string;
};

/** Fixed criteria schema: rules are validated against this, never free-form SQL/JSON. */
export type AlertCriteria = {
  keywords?: string[];
  types?: string[];
  countries?: string[];
  fundingTypes?: string[];
  workModes?: string[];
};

export type AlertRule = {
  id: string;
  name: string;
  criteria: AlertCriteria;
  channels: NotificationChannel[];
  active: boolean;
  lastEvaluatedAt: string | null;
};

export type AlertRuleInput = Pick<AlertRule, "name" | "criteria" | "channels">;
