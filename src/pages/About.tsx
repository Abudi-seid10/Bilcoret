import { Target, BookOpen, Mic, Heart, MapPin, Mail, ArrowRight } from 'lucide-react'
import FAQSection from '../components/about/FAQSection'

function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="8" r="5" fill="url(#gold-grad-about)" />
      <rect x="10" y="16" width="20" height="5" rx="2.5" fill="url(#gold-grad-about)" />
      <rect x="12" y="23" width="16" height="5" rx="2.5" fill="url(#gold-grad-about)" />
      <rect x="14" y="30" width="12" height="5" rx="2.5" fill="url(#gold-grad-about)" />
      <defs>
        <linearGradient id="gold-grad-about" x1="10" y1="3" x2="30" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4B47A" />
          <stop offset="1" stopColor="#B0884A" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const team = [
  { name: 'Dr. Amina Kebede', role: 'Co-Founder & Lead Facilitator', bio: 'Executive coach with 15+ years advising C-suite leaders and development institutions.' },
  { name: 'Samuel T.', role: 'Co-Founder & Strategy Director', bio: 'Strategy consultant specializing in economic governance and value creation.' },
  { name: 'Helen M.', role: 'Head of Training Curricula', bio: 'Instructional designer and certified professional development master trainer.' },
]

const values = [
  { icon: Target, title: 'Purpose-Driven', desc: 'Every program is built around measurable, high-impact organizational outcomes.' },
  { icon: BookOpen, title: 'Academic Rigor', desc: 'Curricula derived from peer-reviewed leadership research and empirical science.' },
  { icon: Mic, title: 'Authentic Voice', desc: 'Amplify candid, constructive dialogue that inspires real transformation.' },
  { icon: Heart, title: 'Community Impact', desc: 'Fostering long-term relationships across East Africa’s professional ecosystem.' },
]

export default function About() {
  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-[#003826] text-white py-20 lg:py-28 border-b border-[#C6A15A]/20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="w-16 h-16 mx-auto mb-6 p-2 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <LogoIcon className="w-12 h-12" />
          </div>
          <span className="text-[#C6A15A] text-xs font-bold uppercase tracking-wider mb-3 block">About Bilcor</span>
          <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Bilcor Institute of Leadership
          </h1>
          <p className="text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto">
            A premier institute dedicated to advancing executive capability through research, executive seminars, podcasts, and accredited skills training.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-[#C6A15A] text-xs font-bold uppercase tracking-wider block">Our Mission</span>
              <h2 className="text-3xl font-black text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Bridging Knowledge &amp; Executive Action
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Bilcor was established to solve a vital leadership challenge: transforming complex academic insights into practical, high-value execution for organizational leaders.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Headquartered in Addis Ababa, Bilcor delivers cohort-based education, research publications, and interactive forums to professionals across East Africa.
              </p>
            </div>

            <div className="bg-slate-50 border-l-4 border-[#C6A15A] p-8 rounded-r-2xl shadow-sm space-y-4">
              <blockquote className="text-lg font-bold text-[#004D34] italic leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                "Knowledge without deliberate application remains potential. We provide the frameworks to turn potential into lasting value."
              </blockquote>
              <p className="text-xs text-slate-500 font-semibold">— Bilcor Executive Board</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-slate-50 py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[#C6A15A] text-xs font-bold uppercase tracking-wider block mb-2">Our Guiding Values</span>
            <h2 className="text-3xl font-black text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Principles of Excellence</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-7 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-lg bg-[#004D34] text-[#C6A15A] flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#004D34] text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[#C6A15A] text-xs font-bold uppercase tracking-wider block mb-2">Leadership Faculty</span>
            <h2 className="text-3xl font-black text-[#004D34]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Meet Our Team</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map(member => (
              <div key={member.name} className="bg-slate-50 border border-slate-200 rounded-xl p-7 hover:shadow-lg transition">
                <div className="w-14 h-14 rounded-full bg-[#004D34] text-[#C6A15A] flex items-center justify-center font-black text-xl mb-4">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-bold text-[#004D34] text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>{member.name}</h3>
                <p className="text-xs font-bold text-[#C6A15A] uppercase tracking-wider mb-3">{member.role}</p>
                <p className="text-slate-600 text-xs leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <FAQSection />

      {/* Contact & Collaboration */}
      <section className="bg-[#003826] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Collaborate With Bilcor Institute
          </h2>
          <p className="text-slate-300 text-sm max-w-lg mx-auto">
            Interested in corporate training cohorts, research partnerships, or keynote speaking? Get in touch with our executive team.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <a
              href="https://t.me/bilcoret"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#C6A15A] to-[#D4B47A] text-[#003826] font-black uppercase text-xs tracking-wider rounded-md hover:brightness-110 transition shadow-lg"
            >
              Join Telegram <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="mailto:contact@bilcoret.com"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold uppercase text-xs tracking-wider rounded-md border border-white/20 transition"
            >
              <Mail className="w-4 h-4 text-[#C6A15A]" /> Email Executive Team
            </a>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-300 pt-4">
            <MapPin className="w-4 h-4 text-[#C6A15A]" />
            Addis Ababa, Ethiopia · Serving Leaders Globally
          </div>
        </div>
      </section>
    </div>
  )
}

