import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// Cycling word with per-letter blur-in and gradient animations
function CyclingWord() {
  const words = ["validate", "diagnose", "clean", "scale"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const word = words[index];

  return (
    <span className="inline-block min-w-[200px] sm:min-w-[250px] lg:min-w-[320px] text-left">
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="inline-block word-gradient font-display text-stroke"
        >
          {word.split("").map((char, i) => (
            <motion.span
              key={i}
              className="char-reveal"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// Scrambled / blurred count up number component
function ScrambleNumber({ end, duration = 2000, suffix = "" }) {
  const [displayValue, setDisplayValue] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    setHasStarted(true);
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime;
    let frameId;
    const finalStr = String(end);

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 1) {
        let currentStr = "";
        for (let i = 0; i < finalStr.length; i++) {
          if (Math.random() < progress) {
            currentStr += finalStr[i];
          } else {
            const chars = "0123456789%+,KMS";
            currentStr += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        setDisplayValue(currentStr);
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(finalStr);
      }
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [end, duration, hasStarted]);

  return (
    <span className="font-mono text-zinc-100 tracking-tight">
      {displayValue || String(end)}
      {suffix}
    </span>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection for navbar scrolled style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Capabilities" },
    { label: "Process" },
    { label: "Infra" },
    { label: "Integrations" },
    { label: "Security" }
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#060608] text-zinc-100 font-sans selection:bg-pink-300 selection:text-[#060608] w-full">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* ── SECTION 1: NAVIGATION ────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 border-b flex items-center justify-center ${
          scrolled
            ? "bg-zinc-950/85 border-zinc-900/60 backdrop-blur-md h-[72px] shadow-lg"
            : "bg-transparent border-transparent h-[80px]"
        }`}
      >
        <div className="max-w-[1440px] ml-auto mr-auto px-4 sm:px-5 md:px-8 w-full h-full flex items-center justify-between relative">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2.5 cursor-pointer font-extrabold tracking-wider text-white uppercase text-lg sm:text-xl"
          >
            DATAPULSE<span className="text-[10px] text-zinc-500 align-super">TM</span>
          </a>

          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-10 text-[13.5px] font-mono text-zinc-400">
            {navItems.map((item, idx) => (
              <span
                key={idx}
                className="text-zinc-400 py-1 cursor-default select-none"
              >
                {item.label}
              </span>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-8 text-[13.5px]">
            <Link to="/login" className="text-zinc-400 hover:text-white transition-colors font-medium">
              Sign in
            </Link>
            {user ? (
              <Link to="/dashboard">
                <button className="btn px-7 py-3 rounded-full text-[13px] font-semibold bg-[#eca8d6] text-[#060608] hover:bg-white hover:text-black hover:shadow-[0_0_24px_rgba(236,168,214,0.45)] transition-all duration-300">
                  Dashboard
                </button>
              </Link>
            ) : (
              <Link to="/register">
                <button className="btn px-7 py-3 rounded-full text-[13px] font-semibold bg-[#eca8d6] text-[#060608] hover:bg-white hover:text-black hover:shadow-[0_0_24px_rgba(236,168,214,0.45)] transition-all duration-300">
                  Deploy Validator
                </button>
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-zinc-100 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4 border-t border-zinc-800/80 pt-4 font-mono text-xs px-6">
            {navItems.map((item, idx) => (
              <span
                key={idx}
                className="py-1 text-zinc-400 cursor-default select-none"
              >
                {item.label}
              </span>
            ))}
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-zinc-800/80">
              <Link to="/login" className="text-zinc-400 py-1">Sign in</Link>
              {user ? (
                <Link to="/dashboard">
                  <button className="btn w-full py-2.5 text-xs font-semibold bg-white text-zinc-950">Dashboard</button>
                </Link>
              ) : (
                <Link to="/register">
                  <button className="btn w-full py-2.5 text-xs font-semibold bg-white text-zinc-950">Deploy Validator</button>
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* ── SECTION 2: HERO ──────────────────────────────────────── */}
      <section className="relative min-h-screen w-full flex flex-col justify-between pt-32 pb-16 overflow-hidden bg-[#060608] z-10">
        {/* Background Looping Video */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-100"
            src="/images/bg-hero.mp4"
          />
          {/* Overlay gradient bias - max opacity 45% */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060608] via-[#060608]/50 to-transparent z-[1] opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-transparent to-transparent z-[2] opacity-40" />
          {/* Faint grid overlay */}
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "calc(100vw / 8) calc(100vh / 12)"
          }} />
        </div>

        <div className="max-w-[1440px] ml-auto mr-auto w-full px-4 sm:px-5 md:px-8 relative z-10 flex-grow flex items-center">
          {/* Content Block */}
          <div className="max-w-4xl flex flex-col justify-center text-left">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-6 block">
              — Autonomous data intelligence for enterprise databases
            </span>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-white mb-8 font-light">
              Distributed database,<br />
              validation that <br className="hidden sm:inline" />
              <CyclingWord />
            </h1>
            <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-400 max-w-xl mb-12 font-normal">
              Automatically calculate dynamic trust scores, detect schema drift, and fix database inconsistencies client-side inside a secured sandbox. Zero raw data ever leaves your device.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <button className="btn px-8 py-4 text-sm font-semibold bg-[#eca8d6] text-[#060608] hover:bg-white hover:text-black transition-colors rounded-full shadow-lg">
                  Deploy your first validator
                </button>
              </Link>
              <Link to="/login">
                <button className="btn px-8 py-4 text-sm font-semibold border border-zinc-800 text-zinc-300 hover:border-[#eca8d6] hover:text-white transition-colors rounded-full">
                  Run Interactive Demo
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row within the same container */}
        <div className="max-w-[1440px] ml-auto mr-auto w-full px-4 sm:px-5 md:px-8 relative z-10 mt-auto pt-8 border-t border-zinc-900/60">
          <div className="flex flex-wrap gap-8 lg:gap-16 text-left font-mono">
            <div>
              <div className="text-2xl font-bold text-white"><ScrambleNumber end="10M" suffix="+" /></div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">records validated</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white"><ScrambleNumber end="99.7" suffix="%" /></div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">schema accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">&lt; <ScrambleNumber end="50" suffix="ms" /></div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">execution latency</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
