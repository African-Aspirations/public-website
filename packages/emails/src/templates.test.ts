import { expect, test } from "bun:test";
import {
  contactAutoReply,
  contactNotification,
  inquiryNotification,
  newsletterConfirm,
} from "./templates";

const brand = { orgName: "African Aspirations", siteUrl: "https://example.com", address: "Accra" };
const evil = {
  name: `<img src=x onerror=alert(1)> Bob`,
  email: "a@b.co",
  message: `<script>alert("x")</script>\nline2`,
  company: `"><a>`,
};

test("visitor input is escaped in every email", () => {
  for (const e of [
    contactNotification(brand, evil),
    contactAutoReply(brand, evil),
    inquiryNotification(brand, { name: "<b>Hotel</b>", url: "https://example.com/l" }, evil),
  ]) {
    expect(e.html).not.toContain("<script>");
    expect(e.html).not.toContain("<img src=x");
    expect(e.html).not.toContain("<b>Hotel</b>");
    expect(e.html).toContain("&lt;script&gt;");
  }
});

test("line breaks in messages are kept", () => {
  expect(contactNotification(brand, evil).html).toContain("<br>line2");
});

test("every email has a plain-text part and a subject", () => {
  const e = newsletterConfirm(brand, "https://example.com/api/newsletter/confirm?token=abc");
  expect(e.subject.length).toBeGreaterThan(5);
  expect(e.text).toContain("token=abc");
  expect(e.html).toContain("token=abc");
});
