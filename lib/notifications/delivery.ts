import type {
  NotificationChannel,
  NotificationPreference,
} from "../models/notification";

/**
 * Delivery interface. SCAFFOLDED: no channel is registered, so nothing is ever
 * sent. Implementations (email provider, push, WhatsApp) are BLOCKED on provider
 * decisions and, for push/WhatsApp, a recorded-consent flow.
 */
export type OutboundMessage = {
  userId: string;
  title: string;
  body: string;
  url?: string;
  dedupeKey: string;
};

export type DeliveryResult =
  | { status: "sent"; providerMessageId?: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string; retryable: boolean };

export interface DeliveryChannel {
  channel: NotificationChannel;
  isConfigured(): boolean;
  deliver(message: OutboundMessage): Promise<DeliveryResult>;
}

/** Empty by design until a real channel is implemented and reviewed. */
export const deliveryChannels: DeliveryChannel[] = [];

const CONSENT_REQUIRED: NotificationChannel[] = ["push", "whatsapp"];

/** Pure policy: may we deliver on this channel for this preference? IMPLEMENTED + tested. */
export function canDeliver(preference: NotificationPreference): boolean {
  if (!preference.enabled) return false;
  if (CONSENT_REQUIRED.includes(preference.channel)) {
    return preference.consentedAt !== null;
  }
  return true;
}
