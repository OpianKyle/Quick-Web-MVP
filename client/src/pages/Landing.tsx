import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Shield, Zap, Globe, Share2, Building2, Landmark, Award, Flag } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Official Government Header Bar */}
      <div className="bg-[#002395] text-white py-1.5 px-4 sm:px-6 lg:px-8 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
        <div className="flex items-center gap-2">
          <Flag className="w-3 h-3 text-[#FFB81C]" />
          <span>Republic of South Africa</span>
        </div>
        <div className="hidden sm:block">
          Official SMME Enablement Portal
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-display font-bold leading-tight block">SMME Portal</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Digital Enablement</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => window.location.href = "/api/login"} className="text-sm font-semibold hover:text-primary transition-colors">Sign In</button>
            <button onClick={() => window.location.href = "/api/login"} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary/20">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-[#F6F7F9] overflow-hidden border-b">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/sa-gov-hero.png" 
            alt="South African Government Building"
            className="w-full h-full object-cover opacity-20 grayscale-[0.5]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F6F7F9] via-[#F6F7F9]/95 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-8">
                <Award className="w-3.5 h-3.5" />
                <span>Dept of Small Business Development</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-foreground leading-[1.05] mb-8">
                Building a <span className="text-primary underline decoration-secondary/40 underline-offset-8">Digital Nation</span>, One SMME at a Time.
              </h1>
              
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl">
                The SMME Digital Enablement Platform provides free professional tools to help South African businesses compete in the global marketplace.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <button onClick={() => window.location.href = "/api/login"} className="inline-flex items-center justify-center px-10 py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:translate-y-[-2px] transition-all duration-300">
                  Register Your Business
                  <ArrowRight className="ml-2.5 w-5 h-5" />
                </button>
                <button className="inline-flex items-center justify-center px-10 py-4 rounded-xl bg-white border-2 border-border text-foreground font-bold text-lg hover:bg-muted/30 transition-all">
                  Portal Guide
                </button>
              </div>

              <div className="mt-12 flex items-center gap-6 opacity-60">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-foreground">50k+</span>
                  <span className="text-xs uppercase tracking-widest font-semibold">Registered SMMEs</span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-foreground">R1.2B</span>
                  <span className="text-xs uppercase tracking-widest font-semibold">Tender Opportunities</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border-[8px] border-white ring-1 ring-black/5">
                <img 
                  src="/images/business-meeting.png" 
                  alt="Business Meeting"
                  className="w-full aspect-[4/5] object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent flex items-end p-10">
                  <div className="text-white">
                    <div className="flex gap-1 mb-4">
                      {[1,2,3,4,5].map(s => <Award key={s} className="w-4 h-4 text-secondary fill-secondary" />)}
                    </div>
                    <blockquote className="text-2xl font-display font-medium leading-snug">
                      "Access to the digital economy is no longer a luxury, it's a necessity for every township business."
                    </blockquote>
                    <p className="mt-4 font-bold uppercase tracking-widest text-sm text-secondary">National Empowerment Vision</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-display font-black mb-6">Strategic Digital Pillar</h2>
              <p className="text-muted-foreground text-xl leading-relaxed">
                National digital infrastructure designed to modernize and scale small, medium, and micro enterprises across all provinces.
              </p>
            </div>
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm cursor-pointer hover:gap-4 transition-all group">
              View All Services <ArrowRight className="w-4 h-4 transition-all" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Voucher-Linked Website Builder",
                desc: "Redeem your government voucher to launch a professional .co.za business website instantly.",
                icon: Globe,
                accent: "border-t-[#007A4D]"
              },
              {
                title: "Verified Social Marketing",
                desc: "Compliant digital marketing tools to reach more customers and build verified brand trust.",
                icon: Share2,
                accent: "border-t-[#FFB81C]"
              },
              {
                title: "Compliance-First Invoicing",
                desc: "Generate professional invoices that meet national tax standards and simplify reporting.",
                icon: Zap,
                accent: "border-t-[#002395]"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`group bg-white p-10 rounded-2xl border border-border/50 shadow-sm hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-500 border-t-4 ${feature.accent}`}
              >
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary/5 transition-all duration-500">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-[#0B1221] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 skew-x-[-15deg] transform translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 bg-secondary text-[#0B1221] text-xs font-black uppercase tracking-[0.2em] rounded mb-8">
                POPIA Compliant
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Secure Infrastructure for National Growth</h2>
              <p className="text-white/70 text-xl leading-relaxed mb-12">
                All business data is hosted securely within the Republic, ensuring full compliance with POPIA regulations and supporting local tech infrastructure.
              </p>
              
              <div className="space-y-6">
                {[
                  "Official Government API Integration",
                  "Secure SEDA & CIPC Data Verification",
                  "Redeematable Digital Business Vouchers",
                  "National SMME Support Helpdesk"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-lg font-medium text-white/90">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold mb-8 text-secondary">Supporting Departments & Partners</h3>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { name: "Seda", desc: "Small Enterprise Development Agency" },
                  { name: "DSBD", desc: "Dept of Small Business Development" },
                  { name: "CIPC", desc: "Company & Intellectual Property" },
                  { name: "NYDA", desc: "National Youth Development Agency" }
                ].map((partner, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group cursor-default">
                    <div className="font-display font-black text-2xl mb-1 group-hover:text-secondary transition-colors">{partner.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">{partner.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F6F7F9] pt-20 pb-10 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-display font-bold">SMME Portal</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                An initiative of the South African Government to bridge the digital divide and foster inclusive economic growth through technology.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 w-full md:w-auto">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest mb-6">Platform</h4>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Digital Vouchers</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Tender Portal</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Business Support</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest mb-6">Government</h4>
                <ul className="space-y-4 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Dept of Small Biz</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">SEDA Portal</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">POPIA Privacy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-10 border-t flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-muted-foreground font-medium">
              © 2026 Republic of South Africa. All Rights Reserved. Official Government Portal.
            </p>
            <div className="flex items-center gap-6 grayscale opacity-50">
               <Flag className="w-6 h-6" />
               <span className="text-[10px] font-black uppercase tracking-widest">Proudly South African</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
