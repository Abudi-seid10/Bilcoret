import type { FAQItem, HighlightItem } from '../lib/supabaseClient'

export const defaultFAQs: FAQItem[] = [
  {
    id: '1',
    category: 'Coaching',
    question: 'What is the difference between Executive Coaching and Training Seminars?',
    answer: 'Executive Coaching is a personalized, 1-on-1 strategic advisory engagement tailored to senior executives, CEOs, and directors navigating confidential leadership challenges. Training Seminars are structured, cohort-based group programs focusing on specific skill sets like project management, strategic decision-making, and public speaking.',
  },
  {
    id: '2',
    category: 'Certification',
    question: 'Are Bilcor certificates of completion recognized by employers?',
    answer: 'Yes. Bilcor certificates and executive diplomas document rigorous attendance, coursework, and practical execution. They are highly regarded by enterprise organizations, banks, international NGOs, and government agencies across East Africa.',
  },
  {
    id: '3',
    category: 'Coaching',
    question: 'How are 1-on-1 coaching sessions delivered (In-Person vs. Virtual)?',
    answer: 'We offer flexible hybrid delivery. Sessions can be conducted in-person at our Addis Ababa executive suite or virtually via secure video conferencing for international and remote executives.',
  },
  {
    id: '4',
    category: 'Training',
    question: 'Can Bilcor customize a corporate training program for our company?',
    answer: 'Absolutely. We partner directly with corporate HR departments and C-suite leadership to audit skills gaps and design bespoke learning modules tailored specifically to your company’s strategic objectives and industry context.',
  },
  {
    id: '5',
    category: 'General',
    question: 'What is the enrollment process for individuals and corporate teams?',
    answer: 'For individual training programs, you can apply directly on our portal via the "Register Now" button on any program page. For corporate group cohorts, contact our team to schedule an initial consultation.',
  },
  {
    id: '6',
    category: 'Training',
    question: 'What is the duration and workload for self-paced vs. ongoing courses?',
    answer: 'Ongoing live programs typically run for 4 to 6 weeks with 2 to 4 hours of weekly commitment. Self-paced programs allow participants to access course materials, video lectures, and toolkits at their own schedule with full lifetime access.',
  },
  {
    id: '7',
    category: 'General',
    question: 'How do I access the Bilcor Video Podcast and supplementary research?',
    answer: 'All video podcasts are free to watch on our official YouTube channel (@bilcoret1) and Podcasts page. Enrolled participants receive supplementary whitepapers, executive summaries, and research templates directly in their email.',
  },
  {
    id: '8',
    category: 'Certification',
    question: 'What happens if I miss a live seminar session?',
    answer: 'All live seminar modules are recorded and uploaded to the participant portal within 24 hours. Attendees can catch up on demand and submit missed assignments to maintain eligibility for certification.',
  },
]

export const defaultHighlights: HighlightItem[] = [
  {
    id: 'coaching',
    category: '1-on-1 Strategic Advisory',
    title: 'Executive Coaching & Mentorship',
    subtitle: 'Confidential performance acceleration for executives, directors, and emerging leaders.',
    description: 'Our executive coaching program pairs C-suite leaders and senior managers with seasoned facilitators to navigate high-stakes decision making, organizational transformation, and executive presence.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
    badge: 'Executive Level',
    stats: [
      { label: 'Leaders Coached', value: '150+' },
      { label: 'Satisfaction Rate', value: '98%' },
    ],
    features: [
      'Tailored 1-on-1 strategic roadmap & confidential feedback',
      '360-degree executive presence & decision-making evaluation',
      'Flexible hybrid schedule (In-Person & Virtual)',
    ],
    ctaText: 'Explore Seminars & Coaching',
    ctaLink: '/seminars',
  },
  {
    id: 'training',
    category: 'Cohort-Based Learning',
    title: 'Corporate Leadership & Professional Training',
    subtitle: 'High-impact group training programs designed for measurable workplace execution.',
    description: 'Interactive, skill-building cohorts covering Strategic Management, Project Leadership, Communication Mastery, and Financial Decision Frameworks. Built on empirical research and practical case studies.',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
    badge: 'Certified Diplomas',
    stats: [
      { label: 'Professionals Trained', value: '2,800+' },
      { label: 'Corporate Cohorts', value: '50+' },
    ],
    features: [
      'Accredited certificates of completion & practical toolkits',
      'Custom corporate team onboarding & industry case studies',
      'Self-paced & ongoing interactive instructor-led tracks',
    ],
    ctaText: 'Browse All Trainings',
    ctaLink: '/trainings',
  },
  {
    id: 'masterclasses',
    category: 'Media & Public Forums',
    title: 'Video Podcasts & Leadership Forums',
    subtitle: 'Unlocking candid conversations with industry pioneers across East Africa.',
    description: 'Gain unfiltered insights from C-suite guest speakers through our official YouTube broadcast channel and live quarterly forums hosted at our Addis Ababa campus.',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
    badge: 'Free Access',
    stats: [
      { label: 'YouTube Episodes', value: '50+' },
      { label: 'Community Audience', value: '18,000+' },
    ],
    features: [
      'Full-length video podcasts with global industry leaders',
      'Downloadable research whitepapers & framework cheat-sheets',
      'Active Telegram broadcast community with weekly insights',
    ],
    ctaText: 'Watch Video Podcasts',
    ctaLink: '/podcasts',
  },
]
