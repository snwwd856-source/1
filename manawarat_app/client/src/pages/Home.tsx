import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { ArrowRight, Zap, Users, TrendingUp, Shield, Rocket } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200">
          <div className="container flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt="PromoHive" className="h-8 w-8" />
              <span className="font-bold text-lg gradient-text">{APP_TITLE}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Welcome, {user.fullName || user.username || user.email}</span>
              <Button variant="outline" size="sm" onClick={() => window.location.href = "/"}>
                Logout
              </Button>
            </div>
          </div>
        </nav>

        <main className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Available Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gradient-text">24</div>
                <p className="text-sm text-slate-600 mt-1">Active tasks waiting for you</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Your Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$0.00</div>
                <p className="text-sm text-slate-600 mt-1">Withdraw minimum: $10</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-secondary" />
                  Your Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">Level 0</div>
                <p className="text-sm text-slate-600 mt-1">Earn 15% from tasks</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Tasks</CardTitle>
                  <CardDescription>Complete tasks to earn rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg hover:from-slate-100 hover:to-slate-200 transition-colors">
                        <div>
                          <h4 className="font-semibold text-slate-900">Sample Task {i}</h4>
                          <p className="text-sm text-slate-600">Complete this task to earn rewards</p>
                        </div>
                        <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                          Start <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-0 shadow-lg sticky top-20">
                <CardHeader>
                  <CardTitle>Referral Code</CardTitle>
                  <CardDescription>Share and earn bonuses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                    <p className="text-xs text-slate-600 mb-1">Your Code</p>
                    <p className="font-mono font-bold text-lg text-primary">REF-USER-XXXX</p>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600" size="sm">
                    Copy Code
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-float" style={{ transform: `translateY(${scrollY * 0.5}px)` }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s", transform: `translateY(${scrollY * 0.3}px)` }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="PromoHive" className="h-10 w-10 animate-pulse-glow" />
            <span className="font-bold text-xl gradient-text">{APP_TITLE}</span>
          </div>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0" onClick={() => window.location.href = getLoginUrl()}>
            Get Started <Rocket className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Earn Rewards <span className="gradient-text">Instantly</span>
              </h1>
              <p className="text-xl text-slate-300">
                Join the global promo network and start earning from tasks, referrals, and exclusive offers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 h-12 text-base" onClick={() => window.location.href = getLoginUrl()}>
                Start Earning Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 text-base">
                Learn More
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-cyan-400">10K+</p>
                <p className="text-sm text-slate-400">Active Members</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-purple-400">$5M+</p>
                <p className="text-sm text-slate-400">Paid Out</p>
              </div>
            </div>
          </div>

          {/* Hero Image - Animated Logo */}
          <div className="relative h-96 md:h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-magenta-500/10 rounded-3xl blur-3xl"></div>
            <img src={APP_LOGO} alt="PromoHive" className="relative h-64 w-64 animate-float drop-shadow-2xl" />
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 container py-20 border-t border-white/10">
        <h2 className="text-4xl font-bold text-center text-white mb-12">Why Choose PromoHive?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Instant Payouts", desc: "Get paid within 24 hours to your wallet" },
            { icon: Users, title: "Referral Bonuses", desc: "Earn 15-45% from your referrals" },
            { icon: Shield, title: "Secure & Safe", desc: "Your data is encrypted and protected" },
            { icon: TrendingUp, title: "Level Up", desc: "Unlock higher earning rates as you grow" },
            { icon: Rocket, title: "Global Tasks", desc: "Access tasks from around the world" },
            { icon: ArrowRight, title: "Easy to Use", desc: "Simple interface, no complicated steps" },
          ].map((feature, i) => (
            <div key={i} className="group p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/20">
              <feature.icon className="h-8 w-8 text-cyan-400 mb-3 group-hover:text-magenta-400 transition-colors" />
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container py-20">
            <div className="rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/30 p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Earning?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of members earning real rewards. Sign up now and get started with your first task.
          </p>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 h-12 text-base" onClick={() => window.location.href = getLoginUrl()}>
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 mt-20">
        <div className="container flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <img src={APP_LOGO} alt="PromoHive" className="h-6 w-6" />
            <span className="font-bold gradient-text">{APP_TITLE}</span>
          </div>
          <p className="text-slate-400 text-sm">© 2024 PromoHive. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
