**Effective Date:** December 15, 2025

Thank you for using HZ Chat. We are committed to providing a highly private, temporary chat service. This policy is designed to explain how we handle information, specifically by emphasizing that we **do not collect or store** your personal data.

---

## 1. No Collection of Personal Identifiable Information (PII)

**We do not collect or store any of your Personally Identifiable Information (PII).** This includes, but is not limited to, your name, email address, password, or any other information that could directly identify you.

## 2. Temporary Data Handling and Local Storage

### 2.1 Conversation Content (Text Messages)

All **text messages** transmitted and shared through HZ Chat are processed solely via **real-time server relay**.

- **Lifecycle:** Text message content **is not stored or retained in server memory**; it is only used as a payload for real-time communication to the recipient(s). Server memory is strictly limited to maintaining basic room information and client connections.
- **Data Purge:** A session is terminated when all users leave a room, or if the room remains empty for 5 minutes after creation. **All text message related data is immediately purged from server memory, with no form of persistent storage.**

### 2.2 Nickname

- **Random ID:** Upon first access, a random User ID is automatically generated as your default nickname, which is cleared when the browser is closed.
- **Custom Nickname:** You can set a custom nickname. This nickname is **only stored in your local browser (Local Storage)** and is not accessed or stored by our servers.
- **Usage:** When you send a message, the nickname is included as the sender's identifier and is **relayed in real-time** to other users in the room, but it is not persistently stored on the server.

### 2.3 IP Address

- **Temporary Retention:** Your IP address is briefly retained in server memory (e.g., for less than 5 minutes).
- **Purpose:** It is used exclusively for **Rate Limiting** or other anti-abuse checks to ensure service quality.
- **No Persistent Storage:** The IP address is not logged to any file or database.

### 2.4 File Uploads and Attachments

When you upload files (e.g., images) as chat attachments, these files are temporarily stored.

- **Storage Mechanism:** Files are stored on an **S3-compatible object storage service** controlled by us. The upload process is secured using **TLS/SSL encryption** to ensure data transmission safety.
- **Lifecycle:** Uploaded files are solely used for display and access within the chat room. All files are **automatically and permanently deleted and purged** within **24 hours** after successful upload.
- **Content Irrelevance:** File storage is not associated with any PII (such as your IP address or nickname). We only store the file itself and necessary metadata (like the file key and expiration time) required for secure access and deletion.

## 3. Limitation of Liability and Third-Party Services

### 3.1 Advertising and Tracking

We commit that **HZ Chat neither integrates nor plans to integrate any advertising services.**

### 3.2 Third-Party Services

We do not integrate any third-party SDKs or services that require data transmission. **The file storage service is fully controlled and managed by us**, and the overall service relies only on industry-standard secure infrastructure for hosting.

### 3.3 Data Security

All data is protected during transmission via **TLS/SSL (HTTPS/WSS)** protocols. Since we only store files temporarily, clauses regarding "User Rights" (such as access, correction, or deletion) are not applicable to this service.

## 4. Policy Revisions and Contact

### 4.1 Policy Updates

We may revise this policy periodically. Any significant changes will be prominently posted on the website.

### 4.2 Contact Us

If you have any questions, comments, or suggestions about this Privacy Policy, please contact us via email: **privacy@hzclog.com**.
