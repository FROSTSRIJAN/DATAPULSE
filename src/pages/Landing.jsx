import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  Check,
  Eye,
  Lock,
  Globe,
  Terminal,
  Server,
  Cpu,
  Database,
  Activity,
  Shield,
  Users,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  AlertTriangle,
  Fingerprint
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { useAuth } from "../contexts/AuthContext";

// ── CUSTOM ICONS ──────────────────────────────────────────────
const Twitter = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Github = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Linkedin = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Instagram = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Facebook = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

// ── CUSTOM HELPER COMPONENTS ─────────────────────────────────

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
  const elementRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [hasStarted]);

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
    <span ref={elementRef} className="font-mono text-zinc-100 tracking-tight">
      {displayValue || String(end)}
      {suffix}
    </span>
  );
}

// Live ticking UTC clock helper
function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(d.toUTCString().slice(17, 25) + " UTC");
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono text-xs text-pink-300 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-sm">
      {time}
    </span>
  );
}

// Floating Dots Particles on Canvas (70 particles)
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 120 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    const numParticles = 70;

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.4 + 0.2
      });
    }

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    canvas.parentElement.addEventListener("mousemove", onMouseMove);
    canvas.parentElement.addEventListener("mouseleave", onMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Proximity calculation
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let pullX = 0;
        let pullY = 0;

        if (dist < mouseRef.current.radius) {
          const force = (mouseRef.current.radius - dist) / mouseRef.current.radius;
          pullX = (dx / dist) * force * 15;
          pullY = (dy / dist) * force * 15;
        }

        ctx.beginPath();
        ctx.arc(p.x + pullX, p.y + pullY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(236, 168, 214, ${p.alpha})`; // Accent color (#eca8d6)
        ctx.fill();
      });

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pi = particles[i];
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 60) {
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.strokeStyle = `rgba(236, 168, 214, ${0.12 * (1 - dist / 60)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (canvas.parentElement) {
        canvas.parentElement.removeEventListener("mousemove", onMouseMove);
        canvas.parentElement.removeEventListener("mouseleave", onMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// Mini Sparkline Canvas Graph
function MiniSparklineCanvas({ width = 120, height = 40, color = "#eca8d6" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let points = Array.from({ length: 15 }, () => Math.random() * height * 0.6 + height * 0.2);
    let animationFrameId;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      points.push(Math.random() * height * 0.6 + height * 0.2);
      points.shift();

      ctx.beginPath();
      ctx.moveTo(0, points[0]);
      for (let i = 1; i < points.length; i++) {
        const x = (i / (points.length - 1)) * width;
        ctx.lineTo(x, points[i]);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width, points[points.length - 1], 2.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      setTimeout(() => {
        animationFrameId = requestAnimationFrame(draw);
      }, 150);
    };
    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [width, height, color]);

  return <canvas ref={canvasRef} width={width} height={height} className="w-[120px] h-[40px] opacity-75" />;
}

// Animated Grid Dot Canvas background
function GridDotCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frameId;

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const spacing = 32;
      const rows = Math.ceil(canvas.height / spacing);
      const cols = Math.ceil(canvas.width / spacing);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing;
          const y = r * spacing;
          const dist = Math.sin(t * 0.001 + (x + y) * 0.01) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(x, y, 0.75, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(236, 168, 214, ${dist * 0.12})`;
          ctx.fill();
        }
      }
      frameId = requestAnimationFrame(draw);
    };
    frameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0" />;
}

// SVG line drawing for Infrastructure Map
function InfraMapSVG() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-40 z-0" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eca8d6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {/* Node Dots */}
      <circle cx="15%" cy="25%" r="3.5" fill="#eca8d6" className="animate-pulse" />
      <circle cx="35%" cy="45%" r="3.5" fill="#eca8d6" className="animate-pulse" />
      <circle cx="55%" cy="35%" r="3.5" fill="#eca8d6" className="animate-pulse" />
      <circle cx="75%" cy="65%" r="3.5" fill="#eca8d6" className="animate-pulse" />
      <circle cx="85%" cy="45%" r="3.5" fill="#eca8d6" className="animate-pulse" />
      <circle cx="25%" cy="75%" r="3.5" fill="#eca8d6" className="animate-pulse" />
      <circle cx="50%" cy="80%" r="3.5" fill="#eca8d6" className="animate-pulse" />
      <circle cx="80%" cy="20%" r="3.5" fill="#eca8d6" className="animate-pulse" />

      {/* Path lines */}
      <path d="M 50 150 L 150 250 L 300 200 L 400 350 L 600 300" 
            stroke="url(#pinkGrad)" strokeWidth="1" fill="none"
            strokeDasharray="100" strokeDashoffset="0" />
      <path d="M 200 450 L 350 480 L 500 350 L 550 120" 
            stroke="url(#pinkGrad)" strokeWidth="0.75" fill="none"
            strokeDasharray="150" strokeDashoffset="0" />
    </svg>
  );
}

// Integration Card with halo cursor tracking
function IntegrationCard({ name, category, icon: Icon }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative p-6 bg-zinc-950/90 border border-zinc-900 overflow-hidden hover:scale-[1.02] transition-transform duration-300 group cursor-pointer rounded-[0.25rem] h-full"
    >
      {hovered && (
        <div
          className="absolute pointer-events-none"
          style={{
            width: "300px",
            height: "300px",
            background: "radial-gradient(150px circle at var(--x) var(--y), rgba(236, 168, 214, 0.08), transparent 85%)",
            top: "-150px",
            left: "-150px",
            transform: "translate3d(0,0,0)",
            "--x": `${coords.x}px`,
            "--y": `${coords.y}px`
          }}
        />
      )}

      <div className="relative z-10 flex flex-col justify-between h-full min-h-[110px]">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-sm">
            {Icon ? <Icon className="w-5 h-5 text-zinc-400 group-hover:text-pink-300 transition-colors" /> : "⚡"}
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{category}</span>
        </div>
        <div>
          <h4 className="text-base font-medium text-zinc-100 font-sans mt-4">{name}</h4>
          <div className="w-0 group-hover:w-full h-[1px] bg-pink-300 transition-all duration-300 mt-2" />
        </div>
      </div>
    </div>
  );
}

// ── MAIN LANDING PAGE ─────────────────────────────────────────

export default function Landing() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection for navbar
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

  const [activeSection, setActiveSection] = useState("");

  const navItems = [
    { id: "capabilities", label: "Capabilities" },
    { id: "process", label: "Process" },
    { id: "infra", label: "Infra" },
    { id: "integrations", label: "Integrations" },
    { id: "security", label: "Security" }
  ];

  // Scroll detection for active sections
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 300) {
        setActiveSection("");
        return;
      }

      const sections = ["capabilities", "process", "infra", "integrations", "security"];
      const scrollPosition = window.scrollY + 250; // Offset for trigger

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Process section states (Step auto-advances every 6s)
  const [activeStep, setActiveStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    setProgressPercent(0);
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 6000);

    const progressTimer = setInterval(() => {
      setProgressPercent((prev) => Math.min(prev + (100 / 60), 100));
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(progressTimer);
    };
  }, [activeStep]);

  // Infrastructure regions cycling state
  const [activeRegion, setActiveRegion] = useState(0);
  const regions = [
    { name: "North America (US-East)", nodes: "12 nodes", val: "99.98% SLA" },
    { name: "Europe (EU-Central)", nodes: "8 nodes", val: "99.99% SLA" },
    { name: "Asia Pacific (AP-South)", nodes: "6 nodes", val: "99.95% SLA" },
    { name: "South America (SA-East)", nodes: "3 nodes", val: "99.90% SLA" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRegion((prev) => (prev + 1) % regions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);



  // FAQ Accordion index
  const [faqIndex, setFaqIndex] = useState(-1);
  const faqs = [
    {
      question: "How does the local database validation work?",
      answer: "When you load a file, all parsing and validation rules are executed locally inside your browser's sandboxed environment. Raw records are never sent over the network to external APIs. Only summary metrics and column metadata are referenced."
    },
    {
      question: "What format datasets does DataPulse support?",
      answer: "We support CSV, XLSX, and JSON files of any size. For extremely large files, our streaming engine parses and validates row-by-row to prevent memory issues."
    },
    {
      question: "How are the Trust Scores computed?",
      answer: "Trust Scores are calculated across 5 custom weights: completeness, validity, uniqueness, consistency, and schema confidence. These weights can be configured under your settings tab."
    },
    {
      question: "Can I connect custom database targets?",
      answer: "Yes. Once validation is complete, you can sync your cleaned dataset directly into PostgreSQL, Supabase, Salesforce, Workday, or export it as a verified file."
    },
    {
      question: "Is there a developer SDK available?",
      answer: "Yes, our @xeno/datapulse TypeScript package allows you to enforce schema validation and quality constraints directly in your Node or browser pipelines."
    },
    {
      question: "What security compliance audits does the platform pass?",
      answer: "Since data is validated client-side, the platform is SOC 2 Type II compliant, GDPR-friendly, HIPAA-compliant, and does not require local database access keys."
    }
  ];



  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setIsMenuOpen(false);
    }
  };

  // Integration card data
  const integrations = [
    { name: "OpenAI", category: "LLM Sync" },
    { name: "Anthropic", category: "AI Agent" },
    { name: "Slack", category: "Comms Alert" },
    { name: "GitHub", category: "Code Commit" },
    { name: "Jira", category: "PM Alert" },
    { name: "AWS S3", category: "Storage Hub" },
    { name: "Google Drive", category: "Docs Export" },
    { name: "Salesforce", category: "CRM Sync" },
    { name: "HubSpot", category: "CRM Sync" },
    { name: "Zapier", category: "Automation" },
    { name: "Snowflake", category: "Data Warehouse" },
    { name: "Stripe", category: "Billing Audit" }
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#060608] text-zinc-100 font-sans selection:bg-pink-300 selection:text-[#060608] w-full">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* ── SECTION 1: NAVIGATION ────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 border-b flex items-center ${
          scrolled
            ? "bg-zinc-950/85 border-zinc-900/60 backdrop-blur-md h-[72px] shadow-lg"
            : "bg-transparent border-transparent h-[80px]"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-8 lg:px-16 w-full flex items-center justify-between relative">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2.5 cursor-pointer font-extrabold tracking-wider text-white uppercase text-base"
          >
            DATAPULSE<span className="text-[10px] text-zinc-500 align-super">TM</span>
          </a>

          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-10 text-[13.5px] font-mono text-zinc-400">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    handleSmoothScroll(e, item.id);
                    setActiveSection(item.id);
                  }}
                  className={`hover:text-[#eca8d6] transition-colors relative py-1 ${
                    isActive ? "text-[#eca8d6]" : "text-zinc-400"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#eca8d6] rounded-full"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#eca8d6]">
                        <div className="absolute w-12 h-6 bg-[#eca8d6]/35 rounded-full blur-md -top-3 -left-2" />
                        <div className="absolute w-8 h-4 bg-[#eca8d6]/20 rounded-full blur-sm -top-2" />
                        <div className="absolute w-4 h-2 bg-[#eca8d6]/40 rounded-full blur-xs -top-1 left-2" />
                      </div>
                    </motion.div>
                  )}
                </a>
              );
            })}
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
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  handleSmoothScroll(e, item.id);
                  setActiveSection(item.id);
                }}
                className={`py-1 transition-colors ${
                  activeSection === item.id ? "text-[#eca8d6]" : "text-zinc-400"
                }`}
              >
                {item.label}
              </a>
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

        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-12 relative z-10 flex-grow flex items-center">
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
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-12 relative z-10 mt-auto pt-8 border-t border-zinc-900/60">
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

      {/* ── SECTION 3: CAPABILITIES (FEATURES) ──────────────────── */}
      <section id="capabilities" className="py-20 lg:py-28 max-w-[1400px] mx-auto px-6 lg:px-12 relative z-20 w-full">
        {/* Header grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-end border-b border-zinc-900 pb-12 mb-12">
          <div className="lg:col-span-8 text-left">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-4 block">
              — Capabilities
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              Intelligent / <br />
              <span className="text-zinc-500">validation.</span>
            </h2>
          </div>
          <div className="lg:col-span-4 text-left lg:text-right">
            <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-400 max-w-sm ml-auto">
              Calculate deep statistical constraints on transactional records locally inside the client browser. Zero network delays, total compliance.
            </p>
          </div>
        </div>

        {/* Large Bento Card */}
        <div className="relative min-h-[500px] border border-zinc-900 bg-zinc-950 flex flex-col lg:flex-row overflow-hidden group rounded-[0.25rem]">
          {/* Particle canvas side */}
          <div className="w-full lg:w-[58%] p-8 lg:p-12 flex flex-col justify-between relative z-10 border-b lg:border-b-0 lg:border-r border-zinc-900">
            {/* Particle Canvas */}
            <ParticleCanvas />
            
            <span className="font-mono text-xs text-zinc-500 tracking-wider">Capabilities #01</span>
            <div className="mt-20 lg:mt-24 max-w-md relative z-10">
              <h3 className="text-xl sm:text-2xl font-display text-white mb-4">Autonomous Execution</h3>
              <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-400 mb-6">
                Upload custom transaction data logs or database sheets. The validation engine instantly identifies fields, checks structural rules, and resolves formatting anomalies dynamically.
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-mono font-bold text-white">99.7%</span>
                <span className="text-xs text-zinc-500 uppercase font-mono tracking-wider">validation coverage</span>
              </div>
            </div>
          </div>

          {/* Graphic side */}
          <div className="w-full lg:w-[42%] relative overflow-hidden h-[300px] lg:h-auto">
            <img
              src="/images/7aecbceb-cbd3-4cbd-901c-dd0125d41525.png"
              alt="Data Analysis visualizer"
              className="w-full h-full object-cover scale-x-[-1] opacity-60 mix-blend-lighten transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#060608] z-10" />
          </div>
        </div>
      </section>

      {/* ── SECTION 4: PROCESS (HOW IT WORKS) ───────────────────── */}
      <section id="process" className="py-20 lg:py-28 bg-[#09090d] border-y border-zinc-900 relative z-20 w-full">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
          {/* Header */}
          <div className="grid lg:grid-cols-12 gap-8 items-end border-b border-zinc-900/80 pb-12 mb-12">
            <div className="lg:col-span-8 text-left">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-4 block">
                — Process
              </span>
              <div className="space-y-1 font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
                <h2 className="text-white">Upload.</h2>
                <h2 className="text-zinc-500">Analyze.</h2>
                <h2 className="text-zinc-800">Clean.</h2>
              </div>
            </div>
            <div className="lg:col-span-4 relative h-[150px] overflow-hidden lg:block hidden">
              <img
                src="/images/7aecbceb-cbd3-4cbd-901c-dd0125d41525.png"
                alt="Process graphic"
                className="w-full h-full object-cover opacity-40 mix-blend-screen"
                style={{ maskImage: "linear-gradient(to right, transparent, black)" }}
              />
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {/* Step 1 */}
            <div
              onClick={() => setActiveStep(0)}
              className={`p-8 border flex flex-col justify-between min-h-[300px] cursor-pointer transition-all duration-300 relative overflow-hidden h-full rounded-[0.25rem] ${
                activeStep === 0 ? "border-[#eca8d6] bg-zinc-950" : "border-zinc-900 bg-zinc-950/40"
              }`}
            >
              {activeStep === 0 && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#eca8d6]" style={{ width: `${progressPercent}%` }} />
              )}
              <div>
                <span className={`font-mono text-xs uppercase tracking-wider block mb-6 ${activeStep === 0 ? "text-[#eca8d6]" : "text-zinc-600"}`}>
                  Step 01 / Upload
                </span>
                <h4 className="text-lg font-medium text-white mb-3">Define validation target</h4>
                <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-400 mb-6">
                  Initiate validation by loading transaction logs. Auto-map headers and identify schema profiles instantly.
                </p>
              </div>
              <pre className="text-[10px] text-zinc-500 bg-[#060608] p-3 border border-zinc-900 overflow-x-auto font-mono rounded-sm select-all">
{`import { DataPulse } from '@xeno/datapulse';
const dp = new DataPulse({ sandbox: true });
const dataset = await dp.load('file.csv');`}
              </pre>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setActiveStep(1)}
              className={`p-8 border flex flex-col justify-between min-h-[300px] cursor-pointer transition-all duration-300 relative overflow-hidden h-full rounded-[0.25rem] ${
                activeStep === 1 ? "border-[#eca8d6] bg-zinc-950" : "border-zinc-900 bg-zinc-950/40"
              }`}
            >
              {activeStep === 1 && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#eca8d6]" style={{ width: `${progressPercent}%` }} />
              )}
              <div>
                <span className={`font-mono text-xs uppercase tracking-wider block mb-6 ${activeStep === 1 ? "text-[#eca8d6]" : "text-zinc-600"}`}>
                  Step 02 / Validate
                </span>
                <h4 className="text-lg font-medium text-white mb-3">Assign verification rules</h4>
                <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-400 mb-6">
                  Run numeric bounds checks, date compliance, and regional validations locally in-browser.
                </p>
              </div>
              <pre className="text-[10px] text-zinc-500 bg-[#060608] p-3 border border-zinc-900 overflow-x-auto font-mono rounded-sm select-all">
{`const validation = await dataset.validate({
  email: dp.rules.email(),
  amount: dp.rules.range(0, 5000)
});`}
              </pre>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setActiveStep(2)}
              className={`p-8 border flex flex-col justify-between min-h-[300px] cursor-pointer transition-all duration-300 relative overflow-hidden h-full rounded-[0.25rem] ${
                activeStep === 2 ? "border-[#eca8d6] bg-zinc-950" : "border-zinc-900 bg-zinc-950/40"
              }`}
            >
              {activeStep === 2 && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#eca8d6]" style={{ width: `${progressPercent}%` }} />
              )}
              <div>
                <span className={`font-mono text-xs uppercase tracking-wider block mb-6 ${activeStep === 2 ? "text-[#eca8d6]" : "text-zinc-600"}`}>
                  Step 03 / Clean
                </span>
                <h4 className="text-lg font-medium text-white mb-3">Clean and download</h4>
                <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-400 mb-6">
                  Auto-resolve duplicate rows and formatting typos. Sync directly into production with clean integrity.
                </p>
              </div>
              <pre className="text-[10px] text-zinc-500 bg-[#060608] p-3 border border-zinc-900 overflow-x-auto font-mono rounded-sm select-all">
{`const cleaned = await dataset.fix();
console.log(cleaned.summary());`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: INFRASTRUCTURE ───────────────────────────── */}
      <section id="infra" className="py-20 lg:py-28 max-w-[1400px] mx-auto px-6 lg:px-12 relative z-20 w-full">
        {/* Header */}
        <div className="grid lg:grid-cols-12 gap-8 items-end border-b border-zinc-900 pb-12 mb-12">
          <div className="lg:col-span-8 text-left">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-4 block">
              — Infra
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              Reliable by / <br />
              <span className="text-zinc-500">default.</span>
            </h2>
          </div>
          <div className="lg:col-span-4 text-left lg:text-right">
            <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-400 max-w-sm ml-auto">
              Sync clean database fields across 29 regional schemas. Sub-50ms validation latency, 0 credentials shared online.
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-8 mb-12 items-stretch">
          {/* Left large card */}
          <div className="lg:col-span-8 p-8 border border-zinc-900 bg-zinc-950/80 rounded-[0.25rem] relative min-h-[350px] overflow-hidden flex flex-col justify-between h-full">
            <InfraMapSVG />
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider relative z-10">connected clusters</span>
            <div className="relative z-10 mt-16 max-w-md">
              <h3 className="text-xl sm:text-2xl font-display font-normal text-white mb-3">29 Validation Rules</h3>
              <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-400">
                Enforcing strict integrity patterns across multi-region transactional layers, maintaining global database schema alignment instantly.
              </p>
            </div>
          </div>

          {/* Right stacked cards */}
          <div className="lg:col-span-4 flex flex-col gap-8 justify-between h-full">
            <div className="p-8 border border-zinc-900 bg-zinc-950 rounded-[0.25rem] flex-1 flex flex-col justify-between min-h-[160px] h-full shadow-lg">
              <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">uptime guarantee</span>
              <div>
                <h4 className="text-3xl font-display text-white">99.99% SLA</h4>
                <p className="font-sans text-xs text-zinc-400 mt-1 leading-relaxed">High-availability validation clustering.</p>
              </div>
            </div>
            <div className="p-8 border border-zinc-900 bg-zinc-950 rounded-[0.25rem] flex-1 flex flex-col justify-between min-h-[160px] h-full shadow-lg">
              <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">network speed</span>
              <div>
                <h4 className="text-3xl font-display text-white">&lt; 50ms Latency</h4>
                <p className="font-sans text-xs text-zinc-400 mt-1 leading-relaxed">Client-side operations keep processing lag at 0.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Regions cycle indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono">
          {regions.map((region, idx) => (
            <div
              key={idx}
              className={`p-4 border rounded-[0.25rem] transition-all duration-300 ${
                activeRegion === idx ? "border-[#eca8d6] bg-zinc-950" : "border-zinc-900/60 bg-zinc-950/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2.5 h-2.5 rounded-full ${activeRegion === idx ? "bg-[#eca8d6] animate-pulse" : "bg-zinc-700"}`} />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">operational</span>
              </div>
              <h5 className="text-[11px] text-zinc-200 font-semibold">{region.name}</h5>
              <div className="flex justify-between items-center text-[9px] text-zinc-650 mt-2">
                <span>{region.nodes}</span>
                <span>{region.val}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 6: METRICS ──────────────────────────────────── */}
      <section id="metrics" className="py-20 lg:py-28 border-y border-zinc-900 relative bg-[#060608] overflow-hidden z-20 w-full">
        <GridDotCanvas />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-zinc-900 pb-12 mb-12 gap-6">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
                  — Metrics
                </span>
                <span className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono px-2 py-0.5 rounded-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-ping" />
                  ● LIVE
                </span>
                <LiveClock />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
                Real-time / <br />
                <span className="text-zinc-500">database metrics.</span>
              </h2>
            </div>
            <div className="text-left sm:text-right font-mono text-[10px] text-zinc-500">
              PLATFORM METRICS RECALCULATED EVERY 3.0 SECONDS
            </div>
          </div>

          {/* Organic Graph visual */}
          <div className="mb-12 border border-zinc-900 bg-zinc-950/60 p-6 rounded-[0.25rem] shadow-xl">
            <span className="font-mono text-[10px] text-zinc-500 block mb-6 uppercase">Weekly Validation Ingestion Rates (million rows)</span>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { day: "Mon", rows: 12 },
                  { day: "Tue", rows: 18 },
                  { day: "Wed", rows: 15 },
                  { day: "Thu", rows: 26 },
                  { day: "Fri", rows: 22 },
                  { day: "Sat", rows: 35 },
                  { day: "Sun", rows: 29 },
                ]}>
                  <defs>
                    <linearGradient id="colorArea" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#eca8d6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#eca8d6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#52525b" fontSize={10} fontFamily="JetBrains Mono" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#09090d", borderColor: "#27272a", borderRadius: "0.25rem" }} labelClassName="text-zinc-400 font-mono text-xs" />
                  <Area type="monotone" dataKey="rows" stroke="#eca8d6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12 items-stretch">
            <div className="p-8 border border-zinc-900 bg-zinc-950 rounded-[0.25rem] flex justify-between items-end h-full shadow-lg">
              <div>
                <span className="font-mono text-[10px] text-zinc-500 block mb-3 uppercase">total files validated today</span>
                <h4 className="text-4xl font-display text-white font-light">
                  <ScrambleNumber end="12,847,392" />
                </h4>
                <p className="text-zinc-500 text-[10px] mt-1 font-mono">by 23,847 active databases</p>
              </div>
              <MiniSparklineCanvas color="#eca8d6" />
            </div>

            <div className="p-8 border border-zinc-900 bg-zinc-950 rounded-[0.25rem] flex justify-between items-end h-full shadow-lg">
              <div>
                <span className="font-mono text-[10px] text-zinc-500 block mb-3 uppercase">average schema accuracy</span>
                <h4 className="text-4xl font-display text-white font-light">
                  <ScrambleNumber end="99.99" suffix="%" />
                </h4>
                <p className="text-zinc-500 text-[10px] mt-1 font-mono">confidence limit validation passed</p>
              </div>
              <MiniSparklineCanvas color="#71717a" />
            </div>

            <div className="p-8 border border-zinc-900 bg-zinc-950 rounded-[0.25rem] flex justify-between items-end h-full shadow-lg">
              <div>
                <span className="font-mono text-[10px] text-zinc-500 block mb-3 uppercase">average latency (p99)</span>
                <h4 className="text-4xl font-display text-white font-light">
                  &lt; <ScrambleNumber end="340" suffix="ms" />
                </h4>
                <p className="text-zinc-500 text-[10px] mt-1 font-mono">across all local processing sandbox runs</p>
              </div>
              <MiniSparklineCanvas color="#71717a" />
            </div>
          </div>

          {/* Bottom models row */}
          <div className="border-t border-zinc-900 pt-8 flex items-center justify-between flex-wrap gap-4 font-mono text-[10px] text-zinc-500">
            <span className="uppercase font-semibold text-zinc-400">supported LLM models for explanations:</span>
            <div className="flex gap-6 flex-wrap">
              <span>OpenAI GPT-4 Turbo</span>
              <span>Anthropic Claude 3</span>
              <span>Mistral Large</span>
              <span>Llama 3</span>
              <span>Gemini 1.5 Pro</span>
              <span>+12 more</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: INTEGRATIONS ────────────────────────────── */}
      <section id="integrations" className="py-20 lg:py-28 max-w-[1400px] mx-auto px-6 lg:px-12 relative z-20 w-full">
        {/* Eyebrow flanked by rules */}
        <div className="flex items-center gap-6 mb-12 justify-center">
          <div className="h-[1px] bg-zinc-900 flex-1" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
            — Integrations
          </span>
          <div className="h-[1px] bg-zinc-900 flex-1" />
        </div>

        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-4 leading-tight">
            Connect / everything.
          </h2>
          <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-400 max-w-xl mx-auto">
            Validate raw data files locally and export them into 100+ platforms including cloud databases, analytics hubs, and custom APIs seamlessly.
          </p>
        </div>

        {/* Full-bleed style image mockup */}
        <div className="w-full h-40 overflow-hidden mb-12 border border-zinc-900 relative rounded-[0.25rem] bg-zinc-950/20">
          <img
            src="/images/footer-bg.png"
            alt="Integration banner"
            className="w-full h-full object-cover opacity-20 filter grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-zinc-950 z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 z-10" />
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-zinc-500 tracking-[0.3em] uppercase">
            Data Validation sync pipelines active
          </div>
        </div>

        {/* 12 integration cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12 items-stretch">
          {integrations.map((item, idx) => (
            <IntegrationCard key={idx} name={item.name} category={item.category} />
          ))}
        </div>

        {/* Bottom stats row */}
        <div className="flex justify-between items-center flex-wrap gap-6 font-mono text-xs text-zinc-500 border-t border-zinc-900 pt-8">
          <div className="flex gap-8 flex-wrap">
            <span>100+ Integrations</span>
            <span>OAuth Auth built-in</span>
            <span>Webhooks Real-time sync</span>
          </div>
          <a href="#" className="text-zinc-400 hover:text-[#eca8d6] transition-colors flex items-center gap-1 font-semibold">
            View all integrations <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* ── SECTION 8: SECURITY ─────────────────────────────────── */}
      <section id="security" className="py-20 lg:py-28 bg-[#09090d] border-y border-zinc-900 relative z-20 w-full">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
          {/* Header */}
          <div className="grid lg:grid-cols-12 gap-8 items-end border-b border-zinc-900 pb-12 mb-12">
            <div className="lg:col-span-8 text-left">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-4 block">
                — Security
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
                Secure validation, <br />
                <span className="text-zinc-500">not risk exposure.</span>
              </h2>
            </div>
            <div className="lg:col-span-4 text-left lg:text-right">
              <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-400 max-w-sm ml-auto font-normal">
                Keep raw database records isolated inside your browser window. Zero backend uploads mean zero data compliance breaches.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-stretch">
            {/* Left 7 cols bordered card */}
            <div className="lg:col-span-7 p-8 border border-zinc-900 bg-zinc-950 rounded-[0.25rem] relative overflow-hidden flex flex-col justify-between min-h-[350px] h-full shadow-lg">
              <div>
                <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider block mb-8">audited compliance</span>
                <h3 className="text-4xl font-display font-light text-white mb-2">0 Security Incidents</h3>
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">recorded since platform launch</p>
              </div>

              {/* Cert badges */}
              <div className="grid grid-cols-4 gap-4 mt-16 font-mono text-[9px] text-zinc-400 text-center">
                <div className="border border-zinc-800 p-2.5 rounded-sm bg-zinc-900/40">SOC 2 TYPE II</div>
                <div className="border border-zinc-800 p-2.5 rounded-sm bg-zinc-900/40">ISO 27001</div>
                <div className="border border-zinc-800 p-2.5 rounded-sm bg-zinc-900/40">HIPAA COMPLIANT</div>
                <div className="border border-zinc-800 p-2.5 rounded-sm bg-zinc-900/40">GDPR FRIENDLY</div>
              </div>
            </div>

            {/* Right 5 cols features list stack */}
            <div className="lg:col-span-5 flex flex-col gap-6 justify-between h-full">
              <div className="p-8 border border-zinc-900 bg-zinc-950 rounded-[0.25rem] hover:border-[#eca8d6] transition-colors cursor-pointer group flex-1 h-full shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 shrink-0">
                    <Shield className="w-4 h-4 text-zinc-400 group-hover:text-[#eca8d6] transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1 group-hover:text-[#eca8d6] transition-colors">Isolated Client Sandbox</h4>
                    <p className="text-zinc-550 text-xs leading-relaxed font-sans">
                      All validation scripts run in-browser. Your database content stays secure inside your device.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 border border-zinc-900 bg-zinc-950 rounded-[0.25rem] hover:border-[#eca8d6] transition-colors cursor-pointer group flex-1 h-full shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 shrink-0">
                    <Lock className="w-4 h-4 text-zinc-400 group-hover:text-[#eca8d6] transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1 group-hover:text-[#eca8d6] transition-colors">Encrypted Local Storage</h4>
                    <p className="text-zinc-550 text-xs leading-relaxed font-sans">
                      Dataset cache memory is securely encrypted locally. Config keys are never saved in plain text.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 border border-zinc-900 bg-zinc-950 rounded-[0.25rem] hover:border-[#eca8d6] transition-colors cursor-pointer group flex-1 h-full shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 shrink-0">
                    <Terminal className="w-4 h-4 text-zinc-400 group-hover:text-[#eca8d6] transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1 group-hover:text-[#eca8d6] transition-colors">Full Local Audit Trails</h4>
                    <p className="text-zinc-550 text-xs leading-relaxed font-sans">
                      Every anomaly detection and modification action is logged locally to support export compliance reviews.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 border border-zinc-900 bg-zinc-950 rounded-[0.25rem] hover:border-[#eca8d6] transition-colors cursor-pointer group flex-1 h-full shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 shrink-0">
                    <Check className="w-4 h-4 text-zinc-400 group-hover:text-[#eca8d6] transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1 group-hover:text-[#eca8d6] transition-colors">Strict Sandbox Boundaries</h4>
                    <p className="text-zinc-550 text-xs leading-relaxed font-sans">
                      Set rules blocking external calls completely. Your validation process can run offline without issue.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 9: DEVELOPERS (SDK) ─────────────────────────── */}
      <section id="developers" className="py-20 lg:py-28 max-w-[1400px] mx-auto px-6 lg:px-12 relative overflow-hidden z-20 w-full">
        {/* Background visual asset faded in bottom right */}
        <div className="absolute bottom-0 right-0 w-[55%] h-[85%] z-0 opacity-20 pointer-events-none">
          <img
            src="/images/7aecbceb-cbd3-4cbd-901c-dd0125d41525.png"
            alt="SDK layout graphic"
            className="w-full h-full object-cover mix-blend-screen"
            style={{ maskImage: "radial-gradient(circle at bottom right, black, transparent)" }}
          />
        </div>

        <div className="relative z-10 max-w-2xl text-left">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4 block">
            — Developer SDK
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-6 leading-tight">
            Code your validations.<br />
            <span className="text-zinc-500">Or let them run.</span>
          </h2>
          <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-400 mb-12 max-w-xl font-normal">
            Integrate our schema-checks package natively in your pipeline. Write custom rules in JavaScript, TypeScript, or run via our clean CLI.
          </p>

          <div className="grid sm:grid-cols-2 gap-8 mb-16">
            <div>
              <h4 className="text-zinc-200 text-sm font-bold font-sans mb-2">TypeScript Native</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Natively typed models for all validation profiles. Write custom rules with total IDE autocomplete support.
              </p>
            </div>
            <div>
              <h4 className="text-zinc-200 text-sm font-bold font-sans mb-2">Streaming results</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Stream row anomalies one-by-one. Handle huge CSV logs without causing memory exhaustion.
              </p>
            </div>
            <div>
              <h4 className="text-zinc-200 text-sm font-bold font-sans mb-2">Multi-model support</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Get schema analysis explanations from GPT-4, Llama 3, or Claude 3 by configuring your custom keys.
              </p>
            </div>
            <div>
              <h4 className="text-zinc-200 text-sm font-bold font-sans mb-2">Local debugging</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Test validation rules locally before deployment. Run mock validations offline inside your CLI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 10: PREMIUM FINAL CTA ────────────────────────── */}
      <section className="py-24 lg:py-32 max-w-[1400px] mx-auto px-6 lg:px-12 relative z-20 w-full flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative py-16 px-8 lg:px-16 bg-zinc-950/80 border border-zinc-900 overflow-hidden flex flex-col justify-center items-center text-center rounded-[0.25rem] w-full max-w-4xl shadow-[0_0_50px_rgba(236,168,214,0.03)] backdrop-blur-md"
        >
          {/* Subtle pink glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,168,214,0.06),transparent_70%)] pointer-events-none" />
          
          {/* Decorative Corner Accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-zinc-800" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-zinc-800" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-zinc-800" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-zinc-800" />

          <div className="relative z-10 max-w-2xl flex flex-col items-center">
            <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-white mb-6 leading-tight">
              Ready to Trust Your Data?
            </h2>
            <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-400 mb-10 max-w-xl font-normal">
              Upload CSV or XLSX files and receive AI-powered validation, trust scoring, anomaly detection and business readiness insights in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link to="/register">
                <button className="btn px-8 py-3.5 text-xs font-semibold bg-[#eca8d6] text-[#060608] hover:bg-white hover:text-black hover:shadow-[0_0_24px_rgba(236,168,214,0.45)] transition-all duration-300 rounded-[0.25rem] w-full sm:w-48">
                  Start Validation
                </button>
              </Link>
              <Link to="/login">
                <button className="btn px-8 py-3.5 text-xs font-semibold border border-zinc-800 text-zinc-300 hover:border-[#eca8d6] hover:text-white transition-all duration-300 rounded-[0.25rem] w-full sm:w-48 bg-transparent">
                  View Demo
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── SECTION 11: MINIMAL FOOTER ─────────────────────────── */}
      <footer className="relative z-20 bg-zinc-950 border-t border-zinc-900 w-full py-12">
        <div className="max-w-[1600px] mx-auto w-full px-8 lg:px-16 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <span className="text-sm font-extrabold text-white uppercase tracking-wider block mb-1">
              XENO DataPulse AI
            </span>
            <span className="text-[11px] text-zinc-500 font-normal">
              AI-Powered Transaction Intelligence Platform
            </span>
          </div>

          <div className="flex items-center gap-8 text-[12px] font-mono text-zinc-400 flex-wrap justify-center">
            <a href="https://github.com/FROSTSRIJAN/DATAPULSE" target="_blank" rel="noopener noreferrer" className="hover:text-[#eca8d6] transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-[#eca8d6] transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-[#eca8d6] transition-colors">
              Privacy
            </a>
            <a href="mailto:contact@xeno.ai" className="hover:text-[#eca8d6] transition-colors">
              Contact
            </a>
          </div>

          <div className="text-center md:text-right">
            <p className="text-[11px] text-zinc-650">
              © 2026 XENO DataPulse AI
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ── SUBCOMPONENTS & EXTENSIONS ────────────────────────────────

// Accordion Trigger/Content for FAQ
function FAQAccordionItem({ index, question, answer, openIndex, setOpenIndex }) {
  const isOpen = openIndex === index;
  return (
    <div className="bg-zinc-950/80 border border-zinc-900 overflow-hidden rounded-[0.25rem]">
      <button
        onClick={() => setOpenIndex(isOpen ? -1 : index)}
        className="w-full flex justify-between items-center text-left text-sm sm:text-base font-medium text-white px-6 py-4.5 cursor-pointer hover:bg-zinc-900/30 transition-colors duration-300 font-sans"
      >
        <span>{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#eca8d6]" : ""}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? "160px" : "0",
          opacity: isOpen ? 1 : 0
        }}
      >
        <p className="bg-[#060608] text-zinc-400 px-6 py-4.5 leading-relaxed text-xs border-t border-zinc-900/60 font-sans">
          {answer}
        </p>
      </div>
    </div>
  );
}
