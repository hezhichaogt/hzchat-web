import './base.css'
import 'vue-sonner/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'

const app = createApp(App)
const pinia = createPinia()
const head = createHead()

app.use(pinia)
app.use(router)
app.use(head)

head.push({
  titleTemplate: (title) =>
    title ? `${title} | HZ Chat` : 'HZ Chat - Instant, Traceless Messaging with Zero Records',
  htmlAttrs: {
    lang: 'en',
  },
  meta: [
    {
      name: 'description',
      content:
        'HZ Chat offers traceless, instant messaging with a strict zero-record policy. Create a temporary, low-social-burden room for private, thematic discussions. No signup needed.',
    },
    { property: 'og:type', content: 'website' },
    {
      property: 'og:title',
      content: 'HZ Chat | Instant, Temporary & Traceless Messaging',
    },
    {
      property: 'og:description',
      content:
        'Create your private, temporary room instantly. Experience zero-burden, traceless communication, guaranteed by our strict zero-record policy. Start talking now!',
    },
    {
      property: 'og:url',
      content: 'https://hzclog.com/',
    },
    {
      property: 'og:image',
      content: 'https://hzclog.com/hzchat_share_banner.png',
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:site',
      content: '@hzclog',
    },
    {
      name: 'viewport',
      content:
        'width=device-width, initial-scale=1, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no',
    },
  ],
})

app.mount('#app')
