<template>
    <n-layout-footer class="footer-container">
        <div class="footer-inner">

            <nav class="footer-links">
                <n-a href="https://github.com/hezhichaogt/hzchat-web" target="_blank" class="footer-link">GitHub</n-a>
                <span class="link-separator"> · </span>

                <n-a href="/privacy" class="footer-link">Privacy Policy</n-a>
                <span class="link-separator"> · </span>

                <n-a href="/agreement" class="footer-link">User Agreement</n-a>
                <span class="link-separator"> · </span>

                <n-a href="/faq" class="footer-link">FAQ</n-a>
                <span class="link-separator"> · </span>

                <n-a href="/about" class="footer-link">About Us</n-a>
            </nav>

            <span class="copyright-text">
                © {{ new Date().getFullYear() }} HZ Chat. All rights reserved.
            </span>

        </div>
    </n-layout-footer>
</template>

<script setup lang="ts">
//
// Footer.vue
//
// The application's global footer component. It displays copyright information,
// legal links (Privacy Policy, User Agreement), and project support links (GitHub).
// Provides navigational context and information at the bottom of the application.
//

import { NA, NLayoutFooter } from 'naive-ui';
</script>

<style scoped>
.footer-inner {
    width: 100%;
    max-width: 1066px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 16px;
    gap: 6px;
    font-size: 12px;
}

.footer-links {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    white-space: nowrap;
}

.footer-link {
    color: inherit;
    text-decoration: none;
    padding: 0 2px;
    margin: 0 4px;
    transition: none !important;
}

.link-separator {
    margin: 0 2px;
}

@media (min-width: 700px) {
    .footer-inner {
        flex-direction: row-reverse;
        justify-content: space-between;
        gap: 0;
        padding: 16px;
        font-size: 14px;
    }
}
</style>
