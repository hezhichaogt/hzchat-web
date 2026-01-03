# HZ Chat Web

HZ Chat is a privacy-first collaboration tool designed for secure, high-speed, and temporary communication.

This is the official Web client, built with Vue 3 and designed for seamless integration with the [HZ Chat Server](https://github.com/hezhichaogt/hzchat-server) engine.

## Core Philosophy

We focus on **Temporary Collaboration** and **Data Minimalism**. Our goal is to provide a communication space that ensures sensitive information does not persist on the server after exchange.

- **Transparency:** 100% open-source to ensure our **Zero-Retention** commitment is verifiable.
- **Standard Storage:** Supports high-speed file distribution via S3-compatible protocols.
- **Open Integrity:** Licensed under AGPLv3 to protect the open-source ecosystem.

## Help & Support

- **Official Instance:** [hzclog.com](https://hzclog.com/)
- **Bug Tracking:** Please report issues or suggestions via [GitHub Issues](https://github.com/hezhichaogt/hzchat-web/issues).
- **Security Audits:** We welcome community audits of our privacy implementations.

## Maintenance Policy

To ensure consistent security standards, this project is currently maintained solely by the author. We highly value community feedback; please use Issues for discussions.

## Development Reference

For security auditing or local development, configure your backend endpoints via `.env`:

- **VITE_BASE_URL**: Local development address.
- **VITE_API_BASE_URL**: Backend API endpoint.
- **VITE_WS_BASE_URL**: WebSocket service endpoint.

---

_Copyright © 2025-2026 HZ Chat_
