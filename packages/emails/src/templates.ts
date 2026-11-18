/**
 * Every transactional email the site sends. Each returns subject + html + text
 * (plain-text part improves deliverability). Visitor input is always escaped.
 */
import { type Brand, button, details, esc, layout, multiline } from "./layout";

export type Email = { subject: string; html: string; text: string };

export type ContactLead = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
};
export type InquiryLead = { name: string; email: string; phone?: string; message: string };
export type ListingRef = { name: string; url: string };

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

// ---------- contact form ----------
export function contactNotification(b: Brand, lead: ContactLead): Email {
  return {
    subject: `New enquiry from ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
    html: layout(b, {
      preheader: lead.message.slice(0, 120),
      body: `<p style="margin:0 0 8px;font-size:20px;font-weight:700">New website enquiry</p>${details(
        [
          ["Name", lead.name],
          ["Email", lead.email],
          ["Phone", lead.phone],
          ["Company", lead.company],
          ["Message", lead.message],
        ],
      )}<p style="margin:0;color:#636466;font-size:14px">Reply to this email to answer ${esc(firstName(lead.name))} directly.</p>`,
    }),
    text: `New website enquiry\n\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone ?? "-"}\nCompany: ${lead.company ?? "-"}\n\n${lead.message}`,
  };
}

export function contactAutoReply(b: Brand, lead: ContactLead): Email {
  return {
    subject: `We've received your message — ${b.orgName}`,
    html: layout(b, {
      preheader: "Thanks for getting in touch. Our team will reply shortly.",
      body: `<p>Hi ${esc(firstName(lead.name))},</p><p>Thank you for contacting ${esc(b.orgName)}. We've received your message and a member of our team will get back to you shortly.</p><p style="color:#636466">For reference, here is what you sent:</p><blockquote style="margin:0;padding:12px 16px;border-left:3px solid #739f46;background:#f7fbef">${multiline(lead.message)}</blockquote><p style="margin-top:24px">Kind regards,<br>The ${esc(b.orgName)} team</p>`,
    }),
    text: `Hi ${firstName(lead.name)},\n\nThank you for contacting ${b.orgName}. We've received your message and a member of our team will get back to you shortly.\n\nYour message:\n${lead.message}\n\nKind regards,\nThe ${b.orgName} team\n${b.siteUrl}`,
  };
}

// ---------- listing inquiry ----------
export function inquiryNotification(b: Brand, listing: ListingRef, lead: InquiryLead): Email {
  return {
    subject: `Listing enquiry: ${listing.name} — ${lead.name}`,
    html: layout(b, {
      preheader: `${lead.name} is interested in ${listing.name}`,
      body: `<p style="margin:0 0 8px;font-size:20px;font-weight:700">New listing enquiry</p><p style="margin:0"><a href="${esc(listing.url)}" style="color:#015a1a;font-weight:600">${esc(listing.name)}</a></p>${details(
        [
          ["Name", lead.name],
          ["Email", lead.email],
          ["Phone", lead.phone],
          ["Message", lead.message],
        ],
      )}<p style="margin:0;color:#636466;font-size:14px">Reply to this email to answer the buyer directly.</p>`,
    }),
    text: `New listing enquiry: ${listing.name}\n${listing.url}\n\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone ?? "-"}\n\n${lead.message}`,
  };
}

export function inquiryAck(b: Brand, listing: ListingRef, lead: InquiryLead): Email {
  return {
    subject: `Your enquiry about ${listing.name}`,
    html: layout(b, {
      preheader: "Our brokerage team will be in touch shortly.",
      body: `<p>Hi ${esc(firstName(lead.name))},</p><p>Thank you for your interest in <a href="${esc(listing.url)}" style="color:#015a1a">${esc(listing.name)}</a>. Our brokerage team will contact you shortly with more information and next steps, which may include signing a confidentiality agreement.</p><p>Kind regards,<br>The ${esc(b.orgName)} team</p>`,
    }),
    text: `Hi ${firstName(lead.name)},\n\nThank you for your interest in ${listing.name} (${listing.url}). Our brokerage team will contact you shortly with more information and next steps, which may include signing a confidentiality agreement.\n\nKind regards,\nThe ${b.orgName} team`,
  };
}

// ---------- newsletter ----------
export function newsletterConfirm(b: Brand, confirmUrl: string): Email {
  return {
    subject: `Confirm your subscription to ${b.orgName}`,
    html: layout(b, {
      preheader: "One click to confirm your subscription.",
      body: `<p>Please confirm that you'd like to receive insights and updates from ${esc(b.orgName)}.</p>${button(confirmUrl, "Confirm subscription")}<p style="color:#636466;font-size:14px">If you didn't sign up, you can ignore this email — you won't be subscribed.</p>`,
    }),
    text: `Please confirm that you'd like to receive insights and updates from ${b.orgName}:\n\n${confirmUrl}\n\nIf you didn't sign up, you can ignore this email — you won't be subscribed.`,
  };
}

// ---------- admin (used in phase 5) ----------
export function staffInvite(
  b: Brand,
  opts: { inviterName: string; signInUrl: string; role: string },
): Email {
  return {
    subject: `You've been invited to the ${b.orgName} admin`,
    html: layout(b, {
      preheader: `${opts.inviterName} invited you as ${opts.role}.`,
      body: `<p>${esc(opts.inviterName)} has invited you to manage the ${esc(b.orgName)} website as <strong>${esc(opts.role)}</strong>.</p>${button(opts.signInUrl, "Accept invite and sign in")}<p style="color:#636466;font-size:14px">This link is personal and expires soon. If you weren't expecting it, ignore this email.</p>`,
    }),
    text: `${opts.inviterName} has invited you to manage the ${b.orgName} website as ${opts.role}.\n\nAccept the invite and sign in: ${opts.signInUrl}\n\nThis link is personal and expires soon.`,
  };
}

export function signInLink(b: Brand, signInUrl: string): Email {
  return {
    subject: `Your sign-in link — ${b.orgName} admin`,
    html: layout(b, {
      preheader: "Your secure sign-in link.",
      body: `<p>Use the button below to sign in to the ${esc(b.orgName)} admin.</p>${button(signInUrl, "Sign in")}<p style="color:#636466;font-size:14px">This link expires soon and can only be used once. If you didn't request it, ignore this email.</p>`,
    }),
    text: `Sign in to the ${b.orgName} admin: ${signInUrl}\n\nThis link expires soon and can only be used once.`,
  };
}
