//
// Type definitions for the Frequently Asked Questions (FAQ) page data structure.
//

export interface FAQItem {
  name: string
  question: string
  answer: string
}

export interface FAQGroup {
  title: string
  items: FAQItem[]
}
