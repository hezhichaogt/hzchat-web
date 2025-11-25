<template>
    <div class="about-container">

        <n-h1 prefix="bar" align-text class="main-title">
            <n-gradient-text type="success">HZ Chat: Instant, Temporary, Zero-Log</n-gradient-text>
        </n-h1>

        <n-p class="slogan-text">
            Zero Burden for Conversation, Built for Privacy. HZ Chat is dedicated to providing a completely private,
            zero-stress communication tool, ensuring every one of your exchanges is instantaneous and leaves no
            permanent trace.
        </n-p>

        <n-divider />

        <n-h2 class="section-title">Privacy Focused</n-h2>

        <n-card class="section-card">
            <n-list hoverable>
                <n-list-item>
                    <n-thing title="Instant Delivery, Memory Dispersal"
                        description="Your messages are instant and temporary. Content is routed through server memory in real-time, discarded immediately after delivery, and is never written to persistent storage." />
                </n-list-item>
                <n-list-item>
                    <n-thing title="No Account Needed, Zero PII Collection"
                        description="We collect zero PII (Personally Identifiable Information). You can use the basic service without an account. Information like nicknames is stored only in your local browser." />
                </n-list-item>
                <n-list-item>
                    <n-thing title="Code Verification, Proven Trust"
                        description="To verify our Zero Logging commitment, HZ Chat's core code is open-source under the AGPL license. The community and third parties can verify the code at any time to ensure absolute transparency." />
                </n-list-item>
            </n-list>
        </n-card>

        <n-h2 class="section-title">Pure Communication</n-h2>

        <n-card class="section-card">
            <n-list hoverable>
                <n-list-item>
                    <n-thing title="Temporary Sessions"
                        description="HZ Chat retains no conversation history. The session is completely purged and destroyed 5 minutes after all participants have left, ensuring conversations leave no traces." />
                </n-list-item>
                <n-list-item>
                    <n-thing title="Instant Connection"
                        description="HZ Chat is designed to be 'use and discard.' We have no friends lists or historical relationship chains, allowing you to ditch social pressure and start a pure, instant conversation anytime, anywhere." />
                </n-list-item>
                <n-list-item>
                    <n-thing title="No Ad Interference"
                        description="We solemnly commit that HZ Chat will never integrate any form of advertising. We maintain a clean, focused interface to offer you an undisturbed communication experience." />
                </n-list-item>
            </n-list>
        </n-card>

        <n-h2 class="section-title">Connect With Us</n-h2>
        <n-p>If you have any questions regarding our service, privacy policy, or open-source code, please contact us
            via:</n-p>

        <n-button tag="a" href="mailto:privacy@hzclog.com" type="primary" size="small">
            Email privacy@hzclog.com
        </n-button>

        <n-p>For complete Terms of Use and data processing details, please refer to:</n-p>
        <ul class="list">
            <li>- <n-a href="/privacy" class="link">Privacy Policy</n-a></li>
            <li>- <n-a href="/agreement" class="link">User Agreement</n-a></li>
        </ul>
    </div>
</template>

<script setup lang="ts">
//
// About page view component.
//
import { computed } from 'vue';
import { NH1, NGradientText, NP, NDivider, NH2, NA, NCard, NList, NListItem, NThing, NButton, useThemeVars } from 'naive-ui';
import { useHead } from '@unhead/vue';

//
// SEO
//
const BASE_URL = import.meta.env.VITE_BASE_URL || window.location.origin;
useHead({
    title: 'About HZ Chat: Instant, Temporary, Zero-Log',
    meta: [
        {
            name: 'description',
            content: 'Learn about HZ Chat\'s commitment to zero-log, traceless communication. Zero PII collected, open-source verified. The ultimate private chat platform.',
        },
        {
            property: 'og:title',
            content: 'About HZ Chat: Instant, Temporary, Zero-Log',
        },
        {
            property: 'og:description',
            content: 'Learn about HZ Chat\'s commitment to zero-log, traceless communication. Zero PII collected, open-source verified. The ultimate private chat platform.',
        },
        {
            property: 'og:url',
            content: `${BASE_URL}/about`,
        },
    ],
});

const themeVars = useThemeVars();
const primaryColor = computed(() => themeVars.value.primaryColor);
</script>

<style scoped>
.about-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
}

:deep(.n-gradient-text) {
    display: inline-block;
    max-width: 100%;
    white-space: normal !important;
}

.main-title {
    margin-top: 18px;
    font-weight: 800;
    font-size: 24px;
}

.slogan-text {
    font-size: 16px;
    line-height: 1.8;
}

.section-title {
    margin: 32px 0 16px;
    font-size: 20px;
    font-weight: 700;
}

.section-card :deep(.n-card__content) {
    padding: 8px !important;
    border: 1px solid v-bind(primaryColor);
}

:deep(.n-thing-header__title) {
    font-size: 16px !important;
    font-weight: 600;
}

:deep(.n-thing-main__description) {
    font-size: 14px !important;
    line-height: 1.6;
}

.list {
    list-style: none;
    padding: 0;
}

.list li {
    margin-bottom: 4px;
}
</style>
