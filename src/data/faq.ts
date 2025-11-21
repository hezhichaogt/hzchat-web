import type { FAQGroup } from '@/types/faq'

const faqData: FAQGroup[] = [
  {
    title: 'About the Service',
    items: [
      {
        name: 'svc-1',
        question: 'Q1: What is HZ Chat, and how is it different from other chat tools?',
        answer: `HZ Chat is a lightweight communication tool focused on instant, temporary, and topic-based group communication. It aims to address the need for zero-burden communication in specific contexts. Our core mission is Zero Logging: all chat data is temporarily routed through server memory and is never persistently stored.`,
      },
      {
        name: 'svc-2',
        question: 'Q2: Is HZ Chat a paid service, and will there be ads in the future?',
        answer: `Our core commitment ensures that guests can use the service without an account, and the basic features are free. To maintain service integrity, we do not and will not integrate any advertising services. Future subscription services may be considered to offer more convenience and advanced features.`,
      },
      {
        name: 'svc-3',
        question: 'Q3: When does a chat session automatically close?',
        answer: `Chat sessions are temporary, and their lifecycle is controlled by user activity: If a newly created session has no users join within 5 minutes, or if all users leave a session and it remains empty for 5 minutes, the session will be removed from server memory.`,
      },
    ],
  },
  {
    title: 'Privacy & Security',
    items: [
      {
        name: 'prv-1',
        question: 'Q4: Does the platform store my chat history?',
        answer: `HZ Chat's core promise is Zero Logging. All chat data is only routed through server memory in real-time and is never persisted to storage. We open-source our core code via the AGPL license to verify this commitment and ensure absolute transparency.`,
      },
      {
        name: 'prv-2',
        question: 'Q5: How is my IP address handled?',
        answer: `It is retained briefly only in server memory for rate limiting or anti-abuse checks, and is never logged to any file or database.`,
      },
      {
        name: 'prv-3',
        question: 'Q6: Does the platform collect my Personally Identifiable Information (PII)?',
        answer: `We do not collect Personally Identifiable Information (PII); anyone can use the service without needing an account.`,
      },
    ],
  },
  {
    title: 'Usage and Liability',
    items: [
      {
        name: 'use-1',
        question: 'Q7: What rights do I have over the content I post on HZ Chat?',
        answer: `You retain all ownership rights to the content you post. You grant HZ Chat only a temporary, in-memory license to route and display your message to the recipient(s). This license is only valid for the duration of the current session and is automatically terminated upon session end.`,
      },
      {
        name: 'use-2',
        question: 'Q8: What content or behavior is prohibited?',
        answer: `It is prohibited to send, transmit, or share any content that violates applicable laws and regulations. The platform primarily prohibits:
    <ul>
     <li>Illegal Content: Any obscene, pornographic, threatening, defamatory, or content that infringes upon third-party intellectual property/privacy rights.</li>
     <li>Hate and Violence: Content promoting violence, hate speech, or discrimination against any group.</li>
     <li>Malicious Code: Content that contains any form of malware, viruses, or other harmful code.</li>
     <li>Service Abuse: Any automated behavior that disrupts service stability, interferes with other users' normal use, or exceeds reasonable usage limits.</li>
    </ul>`,
      },
      {
        name: 'use-3',
        question: 'Q9: What action will the platform take if I send prohibited content?',
        answer: `The platform reserves the right to take the following actions:
    <ul>
     <li>Immediate Connection Interruption: Immediately terminate your WebSocket connection and session.</li>
     <li>Temporary Rate Limiting: Implement temporary traffic limits based on your IP address.</li>
    </ul>
    <p>Due to the Zero Logging policy, we do not retain permanent records, thus traditional permanent banning is not possible.</p>`,
      },
      {
        name: 'use-4',
        question: 'Q10: How can I contact HZ Chat or report an issue?',
        answer: `If you have any questions, comments, or suggestions regarding the service, including the Privacy Policy, User Agreement, or content reports, please contact us via email: privacy@hzclog.com.`,
      },
    ],
  },
]

export default faqData
