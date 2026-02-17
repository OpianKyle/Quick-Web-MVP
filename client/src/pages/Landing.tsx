import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Shield, Zap, Globe, Share2 } from "lucide-react";
import { Layout } from "@/components/Layout";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-white border-b border-border relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-5">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                <Shield className="w-4 h-4" />
                <span>Official SA Government Initiative</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight mb-6">
                Empowering <span className="text-primary">SMMEs</span> for the <span className="text-secondary">Digital Economy</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Access free digital tools, website builders, and resources to grow your business. Supported by the Department of Small Business Development.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/api/login" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-white font-semibold text-lg shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] transition-all duration-200">
                  Register Business
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
                <button className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white border-2 border-border text-foreground font-semibold text-lg hover:bg-muted/50 transition-colors">
                  Learn More
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden md:block"
            >
              {/* Abstract decorative image placement */}
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-border">
                <img 
                  src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1000" 
                  alt="South African Entrepreneur"
                  className="w-full h-auto object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <p className="font-bold text-xl">"This platform transformed my local bakery into a digital brand."</p>
                    <p className="text-white/80 mt-2">— Thandiwe M., Soweto</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-secondary rounded-full opacity-20 z-0 animate-pulse" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary rounded-full opacity-20 z-0" />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Everything you need to succeed online</h2>
            <p className="text-muted-foreground text-lg">We provide a comprehensive suite of digital tools designed specifically for South African small businesses.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Website Builder",
                desc: "Create a professional business website in minutes with AI-powered templates.",
                icon: Globe,
                color: "text-blue-600",
                bg: "bg-blue-50"
              },
              {
                title: "Social Media Manager",
                desc: "Generate and schedule engaging posts for Facebook, Instagram, and LinkedIn.",
                icon: Share2,
                color: "text-purple-600",
                bg: "bg-purple-50"
              },
              {
                title: "Smart Invoicing",
                desc: "Create professional, tax-compliant invoices and track your payments easily.",
                icon: Zap,
                color: "text-secondary",
                bg: "bg-yellow-50"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-primary/5 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold mb-6">Government Backed, Business Ready</h2>
              <div className="space-y-4">
                {[
                  "Fully compliant with POPIA regulations",
                  "Secure data hosting within South Africa",
                  "Free .co.za domain registration assistance",
                  "Access to funding opportunities network"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
               {/* Just a placeholder for partner logos or visual */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-border flex items-center justify-center h-32">
                   <span className="font-display font-bold text-xl text-gray-400">seda</span>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-border flex items-center justify-center h-32">
                   <span className="font-display font-bold text-xl text-gray-400">nyda</span>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-border flex items-center justify-center h-32">
                   <span className="font-display font-bold text-xl text-gray-400">SARS</span>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-border flex items-center justify-center h-32">
                   <span className="font-display font-bold text-xl text-gray-400">CIPC</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
