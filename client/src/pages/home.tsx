import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Factory,
  FileText,
  Leaf,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  Truck,
  MessageSquareShare,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const copper = {
  hex: "#b45309",
};

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .min(10, "Please enter a phone number")
    .max(20, "Please enter a valid phone number"),
  company: z.string().optional(),
  message: z.string().min(20, "Please add a short requirement (20+ characters)"),
  file: z
    .any()
    .optional()
    .refine(
      (f) => !f || (f instanceof FileList && f.length <= 1),
      "Please upload a single file",
    )
    .refine(
      (f) => {
        if (!f || !(f instanceof FileList) || f.length === 0) return true;
        const file = f.item(0);
        if (!file) return true;
        return file.size <= 10 * 1024 * 1024;
      },
      "File must be 10MB or less",
    ),
});

type ContactValues = z.infer<typeof contactSchema>;

function useThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("cmm-theme");
    const initial = stored === "light" || stored === "dark" ? stored : "dark";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem("cmm-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  return { theme, toggle };
}

function CountUp({ value, suffix, label, testId }: { value: number; suffix?: string; label: string; testId: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const duration = 900;
        const from = 0;
        const to = value;

        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(Math.round(from + (to - from) * eased));
          if (p < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        obs.disconnect();
      },
      { threshold: 0.35 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="rounded-2xl surface-glass p-5" data-testid={testId}>
      <div className="font-display text-3xl tracking-tight md:text-4xl">
        <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
          {display}
          {suffix ?? ""}
        </span>
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function TiltCard({
  icon,
  title,
  desc,
  testId,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  testId: string;
}) {
  const r = useRef<HTMLDivElement | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = r.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -9;
    const ry = ((x / rect.width) - 0.5) * 9;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
  };

  const onLeave = () => {
    const el = r.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  };

  return (
    <div
      ref={r}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative h-full rounded-3xl border border-border/70 bg-card/40 p-6 transition-transform duration-300 will-change-transform"
      data-testid={testId}
    >
      <div className="absolute inset-0 -z-10 rounded-3xl opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(circle at 30% 20%, ${copper.hex}55, transparent 55%)` }} />
      <div className="flex items-start gap-4">
        <div className="grid size-11 place-items-center rounded-2xl border border-border/70 bg-background/40 text-primary">{icon}</div>
        <div>
          <div className="font-display text-xl tracking-tight">{title}</div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 text-sm text-primary">
        <span className="opacity-90">Explore</span>
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </div>
    </div>
  );
}

const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const { theme, toggle } = useThemeToggle();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 });

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const gallery = useMemo(
    () => [
      { src: "/images/copper-1.png", alt: "Premium Millberry copper wire scrap" },
      { src: "/images/copper-2.png", alt: "Industrial copper pipe scrap lots" },
      { src: "/images/copper-3.png", alt: "Professional metal sorting facility" },
      { src: "/images/copper-4.png", alt: "Heavy copper plate and cathode scrap" },
      { src: "/images/copper-5.png", alt: "Baled copper scrap ready for dispatch" },
      { src: "/images/copper-6.png", alt: "Quality verification and grading process" },
    ],
    [],
  );

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
      file: undefined,
    },
    mode: "onChange",
  });

  const onSubmit = async (values: ContactValues) => {
    try {
      await new Promise((r) => setTimeout(r, 700));
      toast.success("Request sent", {
        description: "We’ll get back to you within one business day.",
      });
      form.reset();
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again in a moment.",
      });
    }
  };

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <motion.div
        className="fixed left-0 top-0 z-50 h-1 w-full origin-left copper-gradient"
        style={{ scaleX: progress }}
        aria-hidden="true"
        data-testid="status-scroll-progress"
      />

      <a
        href="#contact"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        data-testid="link-skip-to-contact"
      >
        Skip to contact
      </a>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3" data-testid="text-brand">
            <div className="grid size-10 place-items-center rounded-2xl border border-border/70 bg-card/50">
              <Sparkles className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg tracking-tight">Core Matrix Metal</div>
              <div className="text-xs text-muted-foreground">Premium Copper Scrap Trading • Bengaluru</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a className="hover:text-foreground transition" href="#about" data-testid="link-nav-about">
              About
            </a>
            <a className="hover:text-foreground transition" href="#services" data-testid="link-nav-services">
              Services
            </a>
            <a className="hover:text-foreground transition" href="#gallery" data-testid="link-nav-gallery">
              Gallery
            </a>
            <a className="hover:text-foreground transition" href="#contact" data-testid="link-nav-contact">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Toggle theme"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
            </Button>
            <Button asChild className="hidden md:inline-flex" data-testid="button-cta-navbar">
              <a href="#contact">Request a Quote</a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div
              className="absolute inset-0 noise"
              aria-hidden="true"
            />
            <motion.div
              aria-hidden="true"
              className="absolute -top-24 left-1/2 h-[620px] w-[820px] -translate-x-1/2 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(180,83,9,.32), transparent 55%), radial-gradient(circle at 70% 40%, rgba(220,140,60,.18), transparent 55%)",
              }}
              animate={{ y: [0, 18, 0] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" aria-hidden="true" />
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-14 pt-14 md:px-6 md:pb-20 md:pt-20">
            <div className="grid items-center gap-10 md:grid-cols-[1.1fr_.9fr]">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} transition={{ staggerChildren: 0.08 }}>
                <motion.div variants={reveal} className="flex flex-wrap items-center gap-2" data-testid="row-trust-badges">
                  <Badge variant="secondary" className="rounded-full" data-testid="badge-trust-1">
                    <BadgeCheck className="mr-2 size-4" aria-hidden="true" /> Verified lots
                  </Badge>
                  <Badge variant="secondary" className="rounded-full" data-testid="badge-trust-2">
                    <ShieldCheck className="mr-2 size-4" aria-hidden="true" /> Compliant documentation
                  </Badge>
                  <Badge variant="secondary" className="rounded-full" data-testid="badge-trust-3">
                    <Truck className="mr-2 size-4" aria-hidden="true" /> Fast pickup
                  </Badge>
                </motion.div>

                <motion.h1
                  variants={reveal}
                  className="mt-5 font-display text-4xl tracking-tight md:text-6xl"
                  data-testid="text-hero-title"
                >
                  Premium copper scrap trading, built for
                  <span className="relative mx-2 inline-block">
                    <span className="bg-gradient-to-r from-primary via-primary to-foreground bg-clip-text text-transparent">precision</span>
                    <span className="absolute -bottom-2 left-0 h-[2px] w-full copper-gradient" aria-hidden="true" />
                  </span>
                  and trust.
                </motion.h1>

                <motion.p variants={reveal} className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg" data-testid="text-hero-subtitle">
                  Core Matrix Metal connects manufacturers and recyclers with consistent grading, transparent pricing, and reliable logistics — across Bengaluru and beyond.
                </motion.p>

                <motion.div variants={reveal} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" data-testid="row-hero-actions">
                  <Button asChild size="lg" className="shimmer" data-testid="button-hero-quote">
                    <a href="#contact">
                      Get a Quote <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline" data-testid="button-hero-call">
                    <a href="#contact">
                      <Phone className="mr-2 size-4" aria-hidden="true" /> Talk to Sales
                    </a>
                  </Button>
                </motion.div>

                <motion.div variants={reveal} className="mt-8 grid gap-3 sm:grid-cols-3" data-testid="grid-hero-kpis">
                  <div className="rounded-2xl surface-glass p-4">
                    <div className="text-sm text-muted-foreground">Avg response</div>
                    <div className="mt-1 font-display text-2xl">&lt; 24h</div>
                  </div>
                  <div className="rounded-2xl surface-glass p-4">
                    <div className="text-sm text-muted-foreground">Pickup SLA</div>
                    <div className="mt-1 font-display text-2xl">48–72h</div>
                  </div>
                  <div className="rounded-2xl surface-glass p-4">
                    <div className="text-sm text-muted-foreground">Documentation</div>
                    <div className="mt-1 font-display text-2xl">GST-ready</div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="relative"
                data-testid="card-hero-side"
              >
                <Card className="relative overflow-hidden rounded-3xl border-border/60 bg-card/50 p-6">
                  <div className="absolute inset-0 -z-10 opacity-70" aria-hidden="true">
                    <div className="absolute -left-10 -top-10 size-56 rounded-full bg-primary/20 blur-3xl" />
                    <div className="absolute -bottom-16 -right-14 size-64 rounded-full bg-primary/10 blur-3xl" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Trade-ready overview</div>
                    <Badge className="rounded-full" data-testid="badge-live-status">Live</Badge>
                  </div>

                  <div className="mt-5 space-y-4">
                    {[{
                      icon: <Factory className="size-4" aria-hidden="true" />,
                      k: "Grades",
                      v: "Berry / Birla / Millberry",
                      id: "row-overview-1",
                    }, {
                      icon: <FileText className="size-4" aria-hidden="true" />,
                      k: "Paperwork",
                      v: "Weighment + compliance docs",
                      id: "row-overview-2",
                    }, {
                      icon: <Leaf className="size-4" aria-hidden="true" />,
                      k: "Sourcing",
                      v: "Audited suppliers, repeatable lots",
                      id: "row-overview-3",
                    }].map((item) => (
                      <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/40 p-4" data-testid={item.id}>
                        <div className="grid size-9 place-items-center rounded-xl border border-border/70 bg-card/40 text-primary">{item.icon}</div>
                        <div>
                          <div className="text-sm text-muted-foreground">{item.k}</div>
                          <div className="mt-0.5 font-medium">{item.v}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-border/60 bg-background/40 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Service area</span>
                      <span className="font-medium">Bengaluru + South India</span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[72%] copper-gradient" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <div className="grid gap-10 md:grid-cols-[.9fr_1.1fr] md:items-start">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} transition={{ staggerChildren: 0.08 }}>
              <motion.div variants={reveal} className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/40 px-3 py-1 text-xs text-muted-foreground" data-testid="badge-about">
                <Building2 className="size-4 text-primary" aria-hidden="true" /> About Core Matrix Metal
              </motion.div>
              <motion.h2 variants={reveal} className="mt-4 font-display text-3xl tracking-tight md:text-4xl" data-testid="text-about-title">
                Built for procurement teams that demand repeatability.
              </motion.h2>
              <motion.p variants={reveal} className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base" data-testid="text-about-body">
                We operate like a quality-driven supply partner — with transparent grading, clean lots, and logistics you can depend on. From RFQs to pickup scheduling, we keep the flow predictable.
              </motion.p>

              <motion.div variants={reveal} className="mt-7 grid gap-4 sm:grid-cols-2" data-testid="grid-about-stats">
                <CountUp value={120} suffix="+" label="Verified supplier network" testId="stat-suppliers" />
                <CountUp value={18} suffix="k" label="Tons moved (annualized)" testId="stat-tons" />
                <CountUp value={96} suffix="%" label="On-time pickups" testId="stat-ontime" />
                <CountUp value={24} suffix="h" label="Avg quote turnaround" testId="stat-turnaround" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="relative"
              data-testid="panel-about"
            >
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-transparent blur-2xl" aria-hidden="true" />
              <div className="rounded-[2rem] border border-border/60 bg-card/40 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {[{
                    t: "Transparent grading",
                    d: "Clear specs upfront. No surprises at weighment.",
                    id: "pill-about-1",
                  }, {
                    t: "Compliance-first",
                    d: "GST-ready documentation and traceability.",
                    id: "pill-about-2",
                  }, {
                    t: "Reliable pickup",
                    d: "Slot-based scheduling with consistent SLAs.",
                    id: "pill-about-3",
                  }, {
                    t: "B2B communication",
                    d: "Single point of contact from quote to dispatch.",
                    id: "pill-about-4",
                  }].map((p) => (
                    <div key={p.id} className="rounded-2xl border border-border/60 bg-background/40 p-4" data-testid={p.id}>
                      <div className="font-medium">{p.t}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{p.d}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl surface-glass p-5">
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 place-items-center rounded-2xl border border-border/70 bg-card/40 text-primary">
                      <MapPin className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="mt-0.5 font-medium" data-testid="text-location">Bengaluru, Karnataka</div>
                      <div className="mt-2 text-sm text-muted-foreground">Pickup + dispatch coordination across South India.</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="services" className="relative overflow-hidden border-y border-border/60 bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} transition={{ staggerChildren: 0.08 }}>
              <motion.h2 variants={reveal} className="font-display text-3xl tracking-tight md:text-4xl" data-testid="text-services-title">
                Services designed for speed — without compromising control.
              </motion.h2>
              <motion.p variants={reveal} className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base" data-testid="text-services-subtitle">
                Whether you buy, sell, or need a managed pickup, we keep every step measurable and well-documented.
              </motion.p>
            </motion.div>

            <div className="mt-10 grid gap-5 md:grid-cols-3" data-testid="grid-services">
              <TiltCard
                icon={<Truck className="size-5" aria-hidden="true" />}
                title="Pickup & logistics"
                desc="Scheduled pickups, verified weights, and safe transport coordination."
                testId="card-service-logistics"
              />
              <TiltCard
                icon={<ShieldCheck className="size-5" aria-hidden="true" />}
                title="Quality & grading"
                desc="Pre-checked lots with documented grading for repeatable procurement."
                testId="card-service-grading"
              />
              <TiltCard
                icon={<FileText className="size-5" aria-hidden="true" />}
                title="Compliance documentation"
                desc="GST-ready paperwork and transparent dispatch records."
                testId="card-service-compliance"
              />
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2" data-testid="grid-services-accordion">
              <div className="rounded-3xl border border-border/60 bg-background/50 p-6">
                <div className="font-display text-xl tracking-tight" data-testid="text-services-faq-title">Common questions</div>
                <Accordion type="single" collapsible className="mt-4" data-testid="accordion-services">
                  <AccordionItem value="item-1" data-testid="accordion-item-1">
                    <AccordionTrigger data-testid="accordion-trigger-1">What grades of copper scrap do you trade?</AccordionTrigger>
                    <AccordionContent data-testid="accordion-content-1">
                      We primarily handle millberry and high-grade copper scrap categories, with lot-by-lot verification and documented specs.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" data-testid="accordion-item-2">
                    <AccordionTrigger data-testid="accordion-trigger-2">How do quotes work?</AccordionTrigger>
                    <AccordionContent data-testid="accordion-content-2">
                      Share grade, approximate quantity, pickup location, and timeline. We respond with a clear quote and next steps.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3" data-testid="accordion-item-3">
                    <AccordionTrigger data-testid="accordion-trigger-3">Do you provide pickup in Bengaluru?</AccordionTrigger>
                    <AccordionContent data-testid="accordion-content-3">
                      Yes — we schedule pickups across Bengaluru, and coordinate dispatch to buyers with predictable SLAs.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="rounded-3xl border border-border/60 bg-background/50 p-6">
                <div className="font-display text-xl tracking-tight" data-testid="text-services-process-title">A simple process</div>
                <div className="mt-5 grid gap-4">
                  {[{
                    t: "Share details",
                    d: "Grade, quantity, location, and timeline.",
                    id: "step-1",
                  }, {
                    t: "Verify & quote",
                    d: "We confirm specs and send a transparent quote.",
                    id: "step-2",
                  }, {
                    t: "Pickup & dispatch",
                    d: "We coordinate pickup, weighment, and documentation.",
                    id: "step-3",
                  }].map((s) => (
                    <div key={s.id} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/40 p-4" data-testid={s.id}>
                      <div className="mt-0.5 grid size-9 place-items-center rounded-xl copper-gradient text-primary-foreground">{s.id.split("-")[1]}</div>
                      <div>
                        <div className="font-medium">{s.t}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="gallery" className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} transition={{ staggerChildren: 0.08 }}>
            <motion.h2 variants={reveal} className="font-display text-3xl tracking-tight md:text-4xl" data-testid="text-gallery-title">
              Gallery
            </motion.h2>
            <motion.p variants={reveal} className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base" data-testid="text-gallery-subtitle">
              A quick look at the environments we work in — sorting, logistics, and quality checks.
            </motion.p>
          </motion.div>

          <div className="mt-10 columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3" data-testid="grid-gallery">
            {gallery.map((img, idx) => (
              <button
                key={img.src}
                type="button"
                className="group relative w-full overflow-hidden rounded-3xl border border-border/60 bg-card/30 text-left"
                onClick={() => setLightboxIndex(idx)}
                data-testid={`button-gallery-${idx}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  data-testid={`img-gallery-${idx}`}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="rounded-full bg-background/70 px-3 py-1 text-xs text-foreground backdrop-blur" data-testid={`text-gallery-caption-${idx}`}
                    >
                    {img.alt}
                  </div>
                  <div className="rounded-full bg-background/70 p-2 backdrop-blur" aria-hidden="true">
                    <ArrowRight className="size-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <motion.div
            className={cn(
              "fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm",
              lightboxIndex === null ? "pointer-events-none opacity-0" : "opacity-100",
            )}
            initial={false}
            animate={{ opacity: lightboxIndex === null ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxIndex(null)}
            data-testid="dialog-lightbox"
            aria-hidden={lightboxIndex === null}
          >
            <div
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-border/70 bg-card/60 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              data-testid="panel-lightbox"
            >
              {lightboxIndex !== null && (
                <img
                  src={gallery[lightboxIndex].src}
                  alt={gallery[lightboxIndex].alt}
                  className="max-h-[75vh] w-full object-contain"
                  data-testid="img-lightbox"
                />
              )}
              <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-background/60 px-4 py-3 backdrop-blur" data-testid="row-lightbox-controls">
                <div className="text-sm text-muted-foreground" data-testid="text-lightbox-alt">
                  {lightboxIndex !== null ? gallery[lightboxIndex].alt : ""}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLightboxIndex((i) => (i === null ? null : (i + gallery.length - 1) % gallery.length))}
                    data-testid="button-lightbox-prev"
                  >
                    Prev
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLightboxIndex((i) => (i === null ? null : (i + 1) % gallery.length))}
                    data-testid="button-lightbox-next"
                  >
                    Next
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setLightboxIndex(null)}
                    data-testid="button-lightbox-close"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="contact" className="relative overflow-hidden border-t border-border/60 bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
            <div className="grid gap-10 md:grid-cols-[.95fr_1.05fr] md:items-start">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} transition={{ staggerChildren: 0.08 }}>
                <motion.h2 variants={reveal} className="font-display text-3xl tracking-tight md:text-4xl" data-testid="text-contact-title">
                  Request a quote
                </motion.h2>
                <motion.p variants={reveal} className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base" data-testid="text-contact-subtitle">
                  Share grade, approximate quantity, location, and timeline. Attach a requirement doc if you have one.
                </motion.p>

                <motion.div variants={reveal} className="mt-6 grid gap-3" data-testid="list-contact-details">
                  <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/50 p-4" data-testid="row-contact-address">
                    <div className="grid size-10 place-items-center rounded-2xl border border-border/70 bg-card/40 text-primary">
                      <MapPin className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Address</div>
                      <div className="font-medium">Bengaluru, Karnataka (India)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/50 p-4" data-testid="row-contact-phone">
                    <div className="grid size-10 place-items-center rounded-2xl border border-border/70 bg-card/40 text-primary">
                      <Phone className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">+91 9113887257</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <div className="rounded-3xl border border-border/60 bg-background/60 p-6 backdrop-blur" data-testid="panel-contact-form">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" data-testid="form-contact">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-name">Full name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Your name"
                                data-testid="input-name"
                              />
                            </FormControl>
                            <FormMessage data-testid="error-name" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-company">Company</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Your company"
                                data-testid="input-company"
                              />
                            </FormControl>
                            <FormMessage data-testid="error-company" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-email">Work email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="name@company.com"
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage data-testid="error-email" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-phone">Phone</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="+91"
                                data-testid="input-phone"
                              />
                            </FormControl>
                            <FormMessage data-testid="error-phone" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-message">Requirement</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={5}
                              placeholder="Grade, quantity (approx), pickup location, and timeline…"
                              data-testid="textarea-message"
                            />
                          </FormControl>
                          <FormDescription data-testid="text-message-help">We use this to quote accurately.</FormDescription>
                          <FormMessage data-testid="error-message" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="file"
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                          <FormLabel data-testid="label-file">Attachment (optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="file"
                              value={value?.fileName}
                              onChange={(e) => onChange(e.target.files)}
                              data-testid="input-file"
                            />
                          </FormControl>
                          <FormDescription data-testid="text-file-help">PDF/DOC/Images up to 10MB.</FormDescription>
                          <FormMessage data-testid="error-file" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full shimmer"
                      disabled={!form.formState.isValid || form.formState.isSubmitting}
                      data-testid="button-submit"
                    >
                      {form.formState.isSubmitting ? "Sending…" : "Send request"}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-border/60 bg-background">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3 md:px-6" data-testid="footer">
            <div>
              <div className="font-display text-xl" data-testid="text-footer-brand">Core Matrix Metal</div>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground" data-testid="text-footer-desc">
                Premium B2B copper scrap trading with transparent grading, compliant documentation, and reliable pickups.
              </p>
            </div>

            <div>
              <div className="text-sm font-medium" data-testid="text-footer-links-title">Quick links</div>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <a href="#about" className="hover:text-foreground transition" data-testid="link-footer-about">About</a>
                <a href="#services" className="hover:text-foreground transition" data-testid="link-footer-services">Services</a>
                <a href="#gallery" className="hover:text-foreground transition" data-testid="link-footer-gallery">Gallery</a>
                <a href="#contact" className="hover:text-foreground transition" data-testid="link-footer-contact">Contact</a>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium" data-testid="text-footer-contact-title">Contact</div>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2" data-testid="row-footer-location">
                  <MapPin className="size-4 text-primary" aria-hidden="true" /> Bengaluru, Karnataka
                </div>
                <div className="flex items-center gap-2" data-testid="row-footer-phone">
                  <Phone className="size-4 text-primary" aria-hidden="true" /> +91 9113887257
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/60 py-6">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
              <div data-testid="text-footer-copyright">© {new Date().getFullYear()} Core Matrix Metal. All rights reserved.</div>
              <div className="flex items-center gap-4">
                <a
                  href="#contact"
                  className="hover:text-foreground transition"
                  data-testid="link-footer-privacy"
                >
                  Privacy
                </a>
                <a
                  href="#contact"
                  className="hover:text-foreground transition"
                  data-testid="link-footer-terms"
                >
                  Terms
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <a
        href="https://wa.me/919113887257"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-50 grid size-12 place-items-center rounded-full border border-border/60 bg-background/70 text-primary shadow-lg backdrop-blur transition hover:-translate-y-0.5"
        data-testid="button-whatsapp"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" aria-hidden="true" />
        <MessageSquareShare className="relative size-5" aria-hidden="true" />
      </a>
    </div>
  );
}
