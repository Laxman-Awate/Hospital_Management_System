import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Bell, 
  CalendarDays, 
  CheckCircle2, 
  HeartPulse, 
  Hospital, 
  LockKeyhole, 
  Menu, 
  ShieldCheck, 
  Stethoscope, 
  UsersRound, 
  WalletCards, 
  X,
  Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: HeartPulse,
    title: "Patient Management",
    description: "Organize medical history, personal profiles, and ongoing care plans seamlessly."
  },
  {
    icon: Stethoscope,
    title: "Doctor Management",
    description: "Connect patients with specialized doctors, manage schedules, and track availability."
  },
  {
    icon: CalendarDays,
    title: "Appointment Scheduling",
    description: "Intelligent booking system connecting patients and physicians with automated slots."
  },
  {
    icon: WalletCards,
    title: "Billing & Payments",
    description: "Transparent invoice generation, breakdown of consultation fees, and payment tracking."
  },
  {
    icon: Bell,
    title: "Notifications & Reminders",
    description: "Instant in-app alerts and scheduled reminders for upcoming visits and medical updates."
  },
  {
    icon: LockKeyhole,
    title: "Secure Role-Based Access",
    description: "Strict permission controls ensuring patients, doctors, and admins access only authorized data."
  }
];

const roles = [
  {
    icon: UsersRound,
    title: "Patients",
    description: "Book appointments, view medical records, track prescriptions, and handle billing online."
  },
  {
    icon: Stethoscope,
    title: "Doctors",
    description: "Review assigned appointments, manage patient consultations, and issue digital prescriptions."
  },
  {
    icon: ShieldCheck,
    title: "Administrators",
    description: "Manage hospital staff, oversee patient onboarding, handle billing operations, and monitor analytics."
  }
];

const workflowSteps = [
  { step: "01", title: "Register Account", desc: "Sign up securely as a patient, doctor, or administrative staff." },
  { step: "02", title: "Book Appointment", desc: "Select doctor specializations and available time slots with ease." },
  { step: "03", title: "Manage Care", desc: "Doctors document consultations, records, and issue digital prescriptions." },
  { step: "04", title: "Receive Notifications", desc: "Stay informed with real-time billing updates and scheduled visit alerts." }
];

function Home() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath = user?.role === "Admin" ? "/admin" : user?.role === "Doctor" ? "/doctor" : "/patient";
  const closeMenu = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs transition-all">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8" aria-label="Main navigation">
          <Link to="/" onClick={closeMenu} className="flex items-center gap-3 text-xl font-bold tracking-tight text-slate-900 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 transition-transform group-hover:scale-105">
              <Hospital className="h-5 w-5" />
            </span>
            <span>Medi<span className="text-blue-600">Care</span></span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition-colors hover:text-blue-600">Features</a>
            <a href="#workflow" className="transition-colors hover:text-blue-600">Workflow</a>
            <a href="#about" className="transition-colors hover:text-blue-600">About</a>
            
            {user ? (
              <Link 
                to={dashboardPath} 
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-98"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-98"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            type="button" 
            aria-label={mobileOpen ? "Close menu" : "Open menu"} 
            aria-expanded={mobileOpen} 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden focus:outline-hidden"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-6 pb-6 pt-3 md:hidden">
            <div className="flex flex-col gap-2 text-base font-medium text-slate-700">
              <a href="#features" onClick={closeMenu} className="rounded-lg px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600">Features</a>
              <a href="#workflow" onClick={closeMenu} className="rounded-lg px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600">Workflow</a>
              <a href="#about" onClick={closeMenu} className="rounded-lg px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600">About</a>
              
              {user ? (
                <Link to={dashboardPath} onClick={closeMenu} className="mt-2 rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white">
                  Dashboard
                </Link>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Link to="/login" onClick={closeMenu} className="rounded-xl border border-slate-200 px-4 py-2.5 text-center font-semibold text-slate-700 hover:bg-slate-50">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={closeMenu} className="rounded-xl bg-blue-600 px-4 py-2.5 text-center font-semibold text-white hover:bg-blue-700">
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white">
          {/* Subtle Background Glow Elements */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
              
              {/* Left Column: Copy & Actions */}
              <div className="lg:col-span-7">
                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-200 backdrop-blur-xs">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  <span>Connected care, simplified</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.15]">
                  Manage healthcare.<br />
                  <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-indigo-200 bg-clip-text text-transparent">
                    Simplify care.
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="mt-6 max-w-xl text-base leading-relaxed text-blue-100/80 sm:text-lg">
                  A modern, unified hospital management platform built for patients, doctors, and administrators to streamline workflows and improve care outcomes.
                </p>

                {/* CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link 
                    to={user ? dashboardPath : "/register"} 
                    className="group inline-flex items-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-98"
                  >
                    <span>{user ? "Go to Dashboard" : "Get Started"}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  {!user && (
                    <Link 
                      to="/login" 
                      className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xs transition-all hover:bg-white/10 hover:border-white/30"
                    >
                      Sign In
                    </Link>
                  )}
                </div>

                {/* Key Benefits List */}
                <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2.5 text-xs font-medium text-blue-200/90">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-400" />
                    <span>Role-Based Workflows</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium text-blue-200/90">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-400" />
                    <span>Secure JWT Authentication</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium text-blue-200/90">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-400" />
                    <span>Real-time Reminders</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Clean Abstract Visual Elements */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Subtle decorative background grid */}
                  <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl">
                    <div className="space-y-4">
                      
                      {/* Subtle Feature Highlight 1 */}
                      <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition-all hover:border-blue-500/30">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <UsersRound className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">Unified Patient Portal</h3>
                          <p className="mt-1 text-xs text-blue-200/70">Seamless access to appointments, medical records, and prescriptions.</p>
                        </div>
                      </div>

                      {/* Subtle Feature Highlight 2 */}
                      <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition-all hover:border-blue-500/30">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <Stethoscope className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">Physician Workspace</h3>
                          <p className="mt-1 text-xs text-blue-200/70">Manage patient consultations, schedules, and clinical notes efficiently.</p>
                        </div>
                      </div>

                      {/* Subtle Feature Highlight 3 */}
                      <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition-all hover:border-blue-500/30">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <LockKeyhole className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">Protected & Compliant</h3>
                          <p className="mt-1 text-xs text-blue-200/70">Role-based controls safeguard patient privacy and sensitive medical data.</p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="scroll-mt-16 bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Core Capabilities</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Designed around better healthcare
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                MediCare integrates every critical hospital operation into one intuitive, secure platform.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((item) => (
                <div 
                  key={item.title} 
                  className="group relative rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:bg-white hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="scroll-mt-16 border-t border-slate-200/80 bg-slate-50/70 py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Simple Process</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                A streamlined care journey
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Experience a smooth, end-to-end workflow from account creation to follow-up care.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {workflowSteps.map((item, idx) => (
                <div key={item.step} className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
                      {item.step}
                    </span>
                    {idx < workflowSteps.length - 1 && (
                      <ArrowRight className="hidden h-5 w-5 text-slate-300 lg:block" />
                    )}
                  </div>
                  <h3 className="mt-6 text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About / Roles Section */}
        <section id="about" className="scroll-mt-16 border-t border-slate-200/80 bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Tailored Workflows</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Built for every healthcare stakeholder
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Dedicated interfaces customized to meet the unique requirements of patients, doctors, and hospital administrators.
              </p>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {roles.map((role) => (
                <div key={role.title} className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/50 p-8 transition-all hover:border-blue-200 hover:bg-white hover:shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <role.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900">{role.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{role.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-8 py-14 text-center text-white shadow-xl sm:px-16 sm:py-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Simplify hospital management with MediCare.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-blue-100">
                Empower your medical facility with seamless appointment scheduling, digital medical records, and automated billing workflows.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link 
                  to={user ? dashboardPath : "/register"} 
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 shadow-md transition-all hover:bg-blue-50 active:scale-98"
                >
                  <span>{user ? "Go to Dashboard" : "Get Started"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <Hospital className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold text-slate-900">MediCare</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="transition-colors hover:text-blue-600">Features</a>
              <a href="#workflow" className="transition-colors hover:text-blue-600">Workflow</a>
              <a href="#about" className="transition-colors hover:text-blue-600">About</a>
              <Link to="/login" className="transition-colors hover:text-blue-600">Sign In</Link>
              <Link to="/register" className="transition-colors hover:text-blue-600">Create Account</Link>
            </div>

            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} MediCare. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
