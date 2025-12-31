# hzchat-web - The HZ Chat Web Client

## Overview

`hzchat-web` is the official Web client for the HZ Chat application, built using Vue 3 and Naive UI. It connects to the high-concurrency Go backend service provided by [hzchat-server](https://github.com/hezhichaogt/hzchat-server).

Our core goal is to provide users with a secure, private, and instantly available temporary communication environment, and to earn deep user trust through fully open-sourced code.

## License and Trust

| Type           | Status                                                                                                                                                                                                                                                                                                                          |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **License**    | [![License](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)                                                                                                                                                                                                                    |
| **Tech Stack** | [![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js)](https://vuejs.org/) [![Tailwind CSS](https://img.shields.io/badge/CSS-Tailwind%20v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/) [![Shadcn UI](https://img.shields.io/badge/UI-Shadcn%20%2F%20Reka-000000?logo=shadcnui)](https://reka-ui.com/) |

**Why AGPL v3.0?**

All code in this project ecosystem (including this frontend client and the backend core) is open-sourced under the AGPL v3.0 license. This means you can inspect our code at any time to verify that we are not collecting any private data or retaining backdoors. Our commitment to user privacy is fully transparent and verifiable.

## Core Features

- **Real-Time Messaging:** Instantaneous message delivery based on WebSockets for low latency.
- **Privacy First:** Ephemeral sessions, with zero historical message retention on the server.
- **High-Quality Web Experience:** Responsive design that provides a smooth user interface.

## Backend Core

This client relies on the high-performance, high-concurrency chat server implemented in Go.

To review the core architecture (concurrency model, data flow, etc.), please visit the backend repository:

[hzchat-server](https://github.com/hezhichaogt/hzchat-server)

## Getting Started

### Prerequisites

- Node.js (v20+)
- npm (Compatible with npm, pnpm, or yarn)

### Configuration

1.  **Create Configuration File:**
    This project requires an environment variable file to specify the backend service addresses. Please create a file named `.env` in the project root and enter your local development configuration (or your deployed backend addresses), for example:
    ```
    VITE_BASE_URL=http://localhost:5173
    VITE_API_BASE_URL=http://localhost:8080/api
    VITE_WS_BASE_URL=ws://localhost:8080/ws
    ```
    > Ensure your backend server is running at the specified address.

### Running Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/hezhichaogt/hzchat-web
    cd hzchat-web
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Start the Development Server:**
    ```bash
    npm run dev
    # Default address: http://localhost:5173
    ```

## Contributing

This project is fully open-sourced under the AGPL v3.0 license. We welcome and encourage the community to review the code and submit any issues or bug reports via GitHub Issues.

You can experience the officially maintained HZ Chat application deployment at [hzclog.com](https://hzclog.com/).
