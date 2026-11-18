/**
 * Thin wrapper around Resend. Without RESEND_API_KEY (local dev / tests) emails
 * are logged instead of sent, so the forms work end to end on any machine.
 */
import { Resend } from "resend";
import type { Email } from "./templates";

export type MailerConfig = { apiKey?: string; from: string };

export type SendInput = Email & {
  to: string | string[];
  replyTo?: string;
  idempotencyKey?: string;
};

export type Mailer = {
  send(input: SendInput): Promise<{ id: string | null }>;
  /** Add a confirmed subscriber to the newsletter segment. Returns the Resend contact id. */
  addContact(email: string, segmentId?: string): Promise<string | null>;
};

export function createMailer(cfg: MailerConfig, log: (msg: string) => void = console.info): Mailer {
  if (!cfg.apiKey) {
    return {
      async send(i) {
        log(`[email:dev] to=${[i.to].flat().join(",")} subject="${i.subject}"\n${i.text}\n`);
        return { id: null };
      },
      async addContact(email) {
        log(`[email:dev] add contact ${email}`);
        return null;
      },
    };
  }
  const resend = new Resend(cfg.apiKey);
  return {
    async send({ to, subject, html, text, replyTo, idempotencyKey }) {
      const { data, error } = await resend.emails.send(
        { from: cfg.from, to, subject, html, text, ...(replyTo && { replyTo }) },
        idempotencyKey ? { idempotencyKey } : undefined,
      );
      if (error) throw new Error(`Resend: ${error.message}`);
      return { id: data?.id ?? null };
    },
    async addContact(email, segmentId) {
      const { data, error } = await resend.contacts.create({
        email,
        unsubscribed: false,
        ...(segmentId && { segments: [{ id: segmentId }] }),
      });
      if (error) throw new Error(`Resend: ${error.message}`);
      return data?.id ?? null;
    },
  };
}
