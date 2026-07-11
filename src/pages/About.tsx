import { Target, BookOpen, Mic, Heart, MapPin, Mail, ArrowRight } from 'lucide-react'

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
  { name: 'Dr. Amina Kebede', role: 'Co-Founder & Lead Facilitator', bio: 'Leadership coach with 15+ years helping executives unlock their potential.' },
  { name: 'Samuel T.', role: 'Co-Founder & Strategy Director', bio: 'Strategy consultant focused on value creation in emerging markets.' },
  { name: 'Helen M.', role: 'Head of Training Programs', bio: 'Communication expert and certified professional development trainer.' },
]

const values = [
  { icon: Target, title: 'Purpose-Driven', desc: 'Every program is built around real outcomes, not vanity metrics.' },
  { icon: BookOpen, title: 'Continuous Learning', desc: 'We believe growth is a lifelong practice, not a destination.' },
  { icon: Mic, title: 'Authentic Voice', desc: 'We amplify honest conversations that drive genuine change.' },
  { icon: Heart, title: 'Community First', desc: 'Our strength is in the relationships we build and sustain.' },
]

export default function About() {
  return (
    <div>
      {/* Hero — Deep Green */}
      <section className="bg-bilcor-green text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <LogoIcon className="w-16 h-16 mx-auto mb-6" />
          <span className="text-bilcor-gold text-xs font-semibold tracking-label mb-3 block">About Us</span>
          <h1 className="text-5xl font-black mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>About Bilcor</h1>
          <p className="text-xl text-white/60 leading-relaxed max-w-2xl mx-auto">
            Institute of Leadership Coaching and Research — a knowledge-sharing platform dedicated to unlocking human potential through transformative seminars, insightful podcasts, and practical skill-building trainings.
          </p>
        </div>
      </section>

      {/* Mission — White */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-bilcor-gold text-xs font-semibold tracking-label mb-2 block">Our Mission</span>
              <h2 className="text-3xl font-bold text-bilcor-green mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                From Insight to Impact
              </h2>
              <p className="text-bilcor-charcoal/60 leading-relaxed mb-4">
                We exist to bridge the gap between knowledge and action — creating programs that don't just inform, but transform. Every seminar, episode, and training module is designed to move people from insight to impact.
              </p>
              <p className="text-bilcor-charcoal/60 leading-relaxed">
                Founded in Addis Ababa with a vision to serve professionals across Africa and beyond, Bilcor believes that when people grow, communities thrive.
              </p>
            </div>
            <div className="bg-bilcor-offwhite border-l-[3px] border-bilcor-gold p-8" style={{ borderRadius: '0 4px 4px 0' }}>
              <blockquote className="text-xl font-semibold text-bilcor-green italic leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                "Knowledge without application is entertainment. We're here to make it transformational."
              </blockquote>
              <p className="mt-4 text-sm text-bilcor-charcoal/40 font-medium">— Bilcor Founding Team</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values — Off-white alternating */}
      <section className="bg-bilcor-offwhite border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <span className="text-bilcor-gold text-xs font-semibold tracking-label mb-3 block">Our Values</span>
            <h2 className="text-3xl font-bold text-bilcor-green mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>What We Stand For</h2>
            <p className="text-bilcor-charcoal/50">The principles that guide every decision we make.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-6 border border-slate-200 hover:shadow-lg transition" style={{ borderRadius: '4px' }}>
                <div className="w-12 h-12 bg-bilcor-green flex items-center justify-center mb-4" style={{ borderRadius: '4px' }}>
                  <Icon className="w-6 h-6 text-bilcor-gold" />
                </div>
                <h3 className="font-bold text-bilcor-green mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{title}</h3>
                <p className="text-sm text-bilcor-charcoal/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team — White */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <span className="text-bilcor-gold text-xs font-semibold tracking-label mb-3 block">Our Team</span>
            <h2 className="text-3xl font-bold text-bilcor-green mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>The People Behind Bilcor</h2>
            <p className="text-bilcor-charcoal/50">Passionate professionals committed to your growth.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map(member => (
              <div key={member.name} className="bg-bilcor-offwhite border border-slate-200 p-6 hover:shadow-lg transition" style={{ borderRadius: '4px' }}>
                <div className="w-14 h-14 bg-bilcor-green flex items-center justify-center mb-4" style={{ borderRadius: '4px' }}>
                  <span className="text-bilcor-gold font-black text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>{member.name.charAt(0)}</span>
                </div>
                <h3 className="font-bold text-bilcor-green" style={{ fontFamily: 'Montserrat, sans-serif' }}>{member.name}</h3>
                <p className="text-sm text-bilcor-gold font-semibold mb-2">{member.role}</p>
                <p className="text-sm text-bilcor-charcoal/60 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA — Deep Green */}
      <section className="bg-bilcor-green text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Want to collaborate or learn more?</h2>
          <p className="text-white/60 mb-8 text-lg">Reach out — we'd love to connect.</p>
          <div className="flex flex-col gap-4 justify-center items-center">
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://t.me/bilcoret"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-bilcor-gold text-bilcor-green-dark font-bold uppercase text-sm tracking-wide hover:brightness-110 transition"
                style={{ borderRadius: '4px' }}
              >
                Telegram <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@bilcoret.com"
                className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/40 text-white font-bold uppercase text-sm tracking-wide hover:border-white transition"
                style={{ borderRadius: '4px' }}
              >
                <Mail className="w-4 h-4" /> Email Us
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/50 mt-2">
              <MapPin className="w-4 h-4 text-bilcor-gold" />
              Addis Ababa, Ethiopia
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
