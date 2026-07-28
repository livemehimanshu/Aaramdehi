# SPF Record & Email Security Setup Guide for aaramdehi.co.in

This guide explains how to fix the audit warning **"Without an SPF record, spammers can easily spoof emails from this domain..."** and ensure 100% email deliverability and security.

---

## 1. What is an SPF Record?

**SPF (Sender Policy Framework)** is an email authentication method designed to detect forging sender addresses during the delivery of the email. It allows domain owners to specify which mail servers are authorized to send email on behalf of their domain (`aaramdehi.co.in`).

---

## 2. Steps to Add SPF Record to Your DNS Provider

Login to your DNS Provider dashboard (Cloudflare, GoDaddy, Hostinger, Namecheap, Google Domains, or Vercel DNS) and add the following **TXT Record**:

### Option A: Standard Google Workspace / Gmail SPF
If you use Google Workspace / Gmail for domain emails:

| Type | Name / Host | TXT Value / Content | TTL |
| :--- | :--- | :--- | :--- |
| `TXT` | `@` (or leave blank) | `v=spf1 include:_spf.google.com ~all` | `3600` (Auto) |

### Option B: Custom SMTP / Hostinger / CPanel Mail
If you use your hosting server or custom SMTP server:

| Type | Name / Host | TXT Value / Content | TTL |
| :--- | :--- | :--- | :--- |
| `TXT` | `@` (or leave blank) | `v=spf1 mx a include:relay.mailchannels.net ~all` | `3600` (Auto) |

### Option C: Combined (Google Workspace + Render / SendGrid)
If sending via both Google Workspace and transactional mailers like SendGrid/Mailgun:

| Type | Name / Host | TXT Value / Content | TTL |
| :--- | :--- | :--- | :--- |
| `TXT` | `@` (or leave blank) | `v=spf1 include:_spf.google.com include:sendgrid.net ~all` | `3600` (Auto) |

---

## 3. Recommended DKIM & DMARC Security Records

To achieve high domain trust and prevent spam folder placement:

### DMARC Record (Recommended)
Add a TXT record for `_dmarc.aaramdehi.co.in`:

| Type | Name / Host | TXT Value / Content | TTL |
| :--- | :--- | :--- | :--- |
| `TXT` | `_dmarc` | `v=DMARC1; p=none; rua=mailto:admin@aaramdehi.co.in; pct=100; sp=none` | `3600` |

---

## 4. Verification

After adding the DNS TXT record, verify using online tools:
1. [MXToolbox SPF Checker](https://mxtoolbox.com/spf.aspx) -> Input `aaramdehi.co.in`
2. Google Admin Toolbox CheckMX -> Input `aaramdehi.co.in`
