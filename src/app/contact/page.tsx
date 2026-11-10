"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import {
  ArrowRight,
  ArrowUpRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { DUR, EASE, GSAP_EASE, HERO_DELAY } from "@/lib/motion-tokens";
import { SITE, waLink } from "@/lib/site";

import { pegar } from "@/lib/texto";
// ══════════════════════════════════════════════════════════════════════════
// LÓGICA INTOCABLE — contact.md §4.2 / redesign-about-contact.md §"Notas de
// ejecución". Extraída tal cual del archivo original: validación por campo,
// plantilla de mensaje, máquina de estados idle/validating/opening/opened/
// blocked, handlers. Esta sección NO se reescribe, solo se viste.
// ══════════════════════════════════════════════════════════════════════════
const NAME_MIN = 2;
const MESSAGE_MIN = 10;
const PHONE_PATTERN = /^[+\d][\d\s().-]{5,19}$/;

type FieldName = "name" | "phone" | "message";

interface FormValues {
  name: string;
  phone: string;
  message: string;
}

type FormErrors = Partial<Record<FieldName, string>>;
type TouchedState = Record<FieldName, boolean>;

function validateField(field: FieldName, value: string): string | undefined {
  const trimmed = value.trim();

  if (field === "name") {
    return trimmed.length >= NAME_MIN ? undefined : "Escribí tu nombre.";
  }

  if (field === "phone") {
    if (trimmed.length === 0) return undefined;
    return PHONE_PATTERN.test(trimmed)
      ? undefined
      : "Revisá el teléfono: solo números, espacios y el signo +.";
  }

  // message
  return trimmed.length >= MESSAGE_MIN
    ? undefined
    : "Contame un poco más — al menos 10 caracteres.";
}

// contact.md §2 — plantilla exacta del mensaje de WhatsApp.
function buildWhatsAppMessage(values: FormValues): string {
  const name = values.name.trim();
  const message = values.message.trim();
  const phone = values.phone.trim();

  const lines = [`Hola Leonardo, soy ${name}.`, "", message];

  if (phone) {
    lines.push("", `Mi teléfono: ${phone}`);
  }

  lines.push("", "— Enviado desde tu página web");

  return lines.join("\n");
}
// ══════════════════════════════════════════════════════════════════ /LÓGICA

// ─── Capa visual — split-screen cinematográfico (rechazo cliente: vacío,
// info apretada, cero imágenes → esto es CINE (video) + form claro) ───

const FIELDS: readonly FieldName[] = ["name", "phone", "message"];

const CHANNELS: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
  external: boolean;
  accent?: boolean;
}[] = [
  {
    id: "whatsapp",
    icon: WhatsAppIcon,
    label: "WhatsApp",
    value: SITE.phoneDisplay,
    href: SITE.whatsapp,
    external: true,
    accent: true,
  },
  {
    id: "phone",
    icon: Phone,
    label: "Llamar",
    value: SITE.phoneDisplay,
    href: SITE.phoneHref,
    external: false,
  },
  {
    id: "email",
    icon: Mail,
    label: "Email",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    external: false,
  },
  {
    id: "instagram",
    icon: Instagram,
    label: "Instagram",
    value: "@leoguzmanmbenz",
    href: SITE.instagram,
    external: true,
  },
  {
    id: "facebook",
    icon: Facebook,
    label: "Facebook",
    value: "/leo.guzman.667144",
    href: SITE.facebook,
    external: true,
  },
];

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Automotores+Mega+S.A.+Acceso+Norte+Rep%C3%BAblica+de+Entre+R%C3%ADos+5660+Paran%C3%A1";

// Nota: globals.css define un `:focus-visible { border-radius:2px; outline-offset:3px }`
// SIN capa (@layer) — fuera de mi alcance (único archivo editable: este). Un
// selector sin capa gana por cascada a cualquier utilidad de Tailwind (que sí
// vive en @layer utilities) sin importar su especificidad. Se fuerza `!`
// (important) en cada utilidad para reafirmar cero radio, sin tocar globals.css.
const FOCUS_RING =
  "focus-visible:outline! focus-visible:outline-2! focus-visible:outline-offset-2! focus-visible:outline-mb-blue! focus-visible:rounded-none!";

/** Spinner mono, hereda color vía currentColor. */
function Spinner() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="0.9s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

/** Reduced-motion reactivo — copiado localmente (patrón de src/app/page.tsx,
 *  este archivo no importa nada de ahí). Determina si el video de fondo
 *  autoplayea o cae a un poster oscuro estático. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function ContactPage() {
  const reducedMotion = usePrefersReducedMotion();
  const microDur = reducedMotion ? 0 : DUR.micro;

  // ---- Estado de la lógica (intocado) ----
  const [values, setValues] = useState<FormValues>({
    name: "",
    phone: "",
    message: "",
  });
  const [touched, setTouched] = useState<TouchedState>({
    name: false,
    phone: false,
    message: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<
    { type: "opened" | "blocked"; url: string } | null
  >(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function focusField(field: FieldName) {
    if (field === "name") nameRef.current?.focus();
    else if (field === "phone") phoneRef.current?.focus();
    else messageRef.current?.focus();
  }

  function clearPendingIdle() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function handleChange(field: FieldName, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    // "opened/blocked" es permanente hasta editar un campo (§4.1).
    if (result) setResult(null);
    clearPendingIdle();
    setBusy(false);
  }

  function handleBlur(field: FieldName) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validateField(field, values[field]) }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const nextErrors: FormErrors = {
      name: validateField("name", values.name),
      phone: validateField("phone", values.phone),
      message: validateField("message", values.message),
    };
    setErrors(nextErrors);
    setTouched({ name: true, phone: true, message: true });

    const order: FieldName[] = ["name", "phone", "message"];
    const firstInvalid = order.find((f) => nextErrors[f]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    setBusy(true);

    const text = buildWhatsAppMessage(values);
    const url = waLink(text);
    // Apertura síncrona (mismo tick del click) — necesario para que el
    // navegador no la trate como popup no solicitado.
    const win = window.open(url, "_blank", "noopener,noreferrer");

    if (win) {
      setResult({ type: "opened", url });
      timeoutRef.current = setTimeout(() => setBusy(false), 2500);
    } else {
      setResult({ type: "blocked", url });
      setBusy(false);
    }
  }
  // ---- /Estado de la lógica ----

  const isBlocked = result?.type === "blocked";

  const [focusedField, setFocusedField] = useState<FieldName | null>(null);

  // Shake de error: se dispara solo cuando un campo pasa de sin-error a
  // con-error (detectado por efecto, sin tocar handleBlur/handleSubmit).
  const shakeControls = {
    name: useAnimationControls(),
    phone: useAnimationControls(),
    message: useAnimationControls(),
  } as const;
  const prevErrorsRef = useRef<FormErrors>({});
  useEffect(() => {
    if (reducedMotion) {
      prevErrorsRef.current = errors;
      return;
    }
    FIELDS.forEach((f) => {
      if (errors[f] && touched[f] && !prevErrorsRef.current[f]) {
        shakeControls[f].start({
          x: [0, -4, 4, -4, 4, 0],
          transition: { duration: DUR.micro, ease: EASE.micro },
        });
      }
    });
    prevErrorsRef.current = errors;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors, touched]);

  // ---- Refs de motion — «Encendido» split-screen ----
  const cineRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const channelRowRefs = useRef<Array<HTMLElement | null>>([]);

  const formTitleRef = useRef<HTMLDivElement>(null);
  const fieldWrapRefs = useRef<Record<FieldName, HTMLDivElement | null>>({
    name: null,
    phone: null,
    message: null,
  });
  const buttonWrapRef = useRef<HTMLDivElement>(null);

  // ---- Timeline «Encendido» — boot único, sin scroll ----
  useEffect(() => {
    if (typeof window === "undefined") return;

    const w = window as Window & { __gsapSplitTextRegistered?: boolean };
    if (!w.__gsapSplitTextRegistered) {
      gsap.registerPlugin(SplitText);
      w.__gsapSplitTextRegistered = true;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const channelRows = channelRowRefs.current.filter(
      (el): el is HTMLElement => Boolean(el),
    );
    const fieldWraps = FIELDS.map((f) => fieldWrapRefs.current[f]).filter(
      (el): el is HTMLDivElement => Boolean(el),
    );

    if (reduced) {
      if (cineRef.current) gsap.set(cineRef.current, { opacity: 1 });
      if (eyebrowRef.current) gsap.set(eyebrowRef.current, { opacity: 1, y: 0 });
      if (leadRef.current) gsap.set(leadRef.current, { opacity: 1, y: 0 });
      if (h1Ref.current) gsap.set(h1Ref.current, { opacity: 1 });
      gsap.set(channelRows, { opacity: 1, x: 0 });
      gsap.set(fieldWraps, { opacity: 1, x: 0 });
      if (formTitleRef.current) gsap.set(formTitleRef.current, { opacity: 1, x: 0 });
      if (buttonWrapRef.current) gsap.set(buttonWrapRef.current, { opacity: 1, y: 0 });
      return;
    }

    // Estado inicial (apagado)
    if (cineRef.current) gsap.set(cineRef.current, { opacity: 0 });
    if (eyebrowRef.current) gsap.set(eyebrowRef.current, { opacity: 0, y: 8 });
    if (leadRef.current) gsap.set(leadRef.current, { opacity: 0, y: 12 });
    if (h1Ref.current) gsap.set(h1Ref.current, { autoAlpha: 0 });
    gsap.set(channelRows, { opacity: 0, x: -18 });
    gsap.set(fieldWraps, { opacity: 0, x: 18 });
    if (formTitleRef.current) gsap.set(formTitleRef.current, { opacity: 0, x: 18 });
    if (buttonWrapRef.current) gsap.set(buttonWrapRef.current, { opacity: 0, y: 12 });

    const tl = gsap.timeline({ delay: HERO_DELAY });

    // 1. t=0 — video + scrim funden a la vista
    if (cineRef.current) {
      tl.to(cineRef.current, { opacity: 1, duration: DUR.hero, ease: "power1.out" }, 0);
    }

    // 2. t=150ms — eyebrow
    if (eyebrowRef.current) {
      tl.to(
        eyebrowRef.current,
        { opacity: 1, y: 0, duration: DUR.element, ease: GSAP_EASE.secondary },
        0.15,
      );
    }

    // 3. t=550ms — lead, tras el H1 SplitText (abajo)
    if (leadRef.current) {
      tl.to(
        leadRef.current,
        { opacity: 1, y: 0, duration: DUR.element, ease: GSAP_EASE.secondary },
        0.55,
      );
    }

    // 4. t=650ms — canales, stagger 65ms, desde la izquierda
    channelRows.forEach((el, i) => {
      tl.to(
        el,
        { opacity: 1, x: 0, duration: DUR.element, ease: GSAP_EASE.secondary },
        0.65 + i * 0.065,
      );
    });

    // 5. t≈1050ms — título del form, desde la derecha
    if (formTitleRef.current) {
      tl.to(
        formTitleRef.current,
        { opacity: 1, x: 0, duration: DUR.element, ease: GSAP_EASE.secondary },
        1.05,
      );
    }

    // 6. t≈1150ms — campos, stagger 90ms, desde la derecha
    fieldWraps.forEach((el, i) => {
      tl.to(
        el,
        { opacity: 1, x: 0, duration: DUR.element, ease: GSAP_EASE.secondary },
        1.15 + i * 0.09,
      );
    });

    // 7. Botón — al final
    if (buttonWrapRef.current) {
      tl.to(
        buttonWrapRef.current,
        { opacity: 1, y: 0, duration: DUR.element, ease: GSAP_EASE.secondary },
        1.15 + fieldWraps.length * 0.09 + 0.1,
      );
    }

    // H1 SplitText enmascarado — patrón idéntico al resto del sitio (safety
    // timeout anti-stuck + espera de fuentes). El punto azul parpadea una
    // vez al terminar (cursor que confirma "listo").
    const safety = window.setTimeout(() => {
      if (h1Ref.current) gsap.set(h1Ref.current, { autoAlpha: 1 });
    }, 1500);

    let split: SplitText | undefined;
    document.fonts.ready.then(() => {
      window.clearTimeout(safety);
      if (!h1Ref.current) return;
      split = SplitText.create(h1Ref.current, {
        type: "chars, words",
        mask: "chars",
        autoSplit: true,
        onSplit(self) {
          const dotTl = gsap
            .timeline({ delay: HERO_DELAY + 0.25 })
            .set(h1Ref.current, { autoAlpha: 1 })
            .from(self.chars, {
              yPercent: 120,
              duration: DUR.hero,
              ease: GSAP_EASE.primary,
              stagger: 0.026,
            });
          if (dotRef.current) {
            dotTl
              .to(dotRef.current, { opacity: 0, duration: 0.09 })
              .to(dotRef.current, { opacity: 1, duration: 0.09 });
          }
          return dotTl;
        },
      });
    });

    return () => {
      window.clearTimeout(safety);
      tl.kill();
      split?.revert();
    };
  }, []);

  function inputBorderClass(field: FieldName) {
    const hasError = Boolean(touched[field] && errors[field]);
    if (hasError) return "border-mb-blue";
    if (focusedField === field) return "border-paper-0/80";
    return "border-white/15 hover:border-white/25";
  }

  function labelClass(field: FieldName) {
    const hasError = Boolean(touched[field] && errors[field]);
    if (hasError) return "text-mb-blue";
    if (focusedField === field) return "text-mb-blue";
    return "text-silver-300";
  }

  const inputBase =
    "w-full rounded-none border bg-surface-1 px-4 py-3.5 font-sans text-base text-paper-0 placeholder-silver-500 outline-none transition-colors duration-[180ms] ease-[var(--ease-micro)]";

  return (
    <div className="-mt-20">
      {/*
        Desvío documentado: el Navbar real (Navbar.tsx) mide 112px en reposo
        a 1280px — logo + lockup de dos líneas + py-6 — y solo se comprime a
        ~80px tras scroll > 20px. Como esta página no tiene scroll propio por
        encima del fold, el navbar permanece en su alto de reposo: se
        reserva 112px (medido) en vez de los 80px que asume --nav-h.
      */}
      <div className="h-28 bg-mb-black" aria-hidden />

      <section
        className="relative flex items-center justify-center bg-mb-black px-4 py-8 text-paper-0 sm:px-8 lg:px-12"
        style={{ minHeight: "calc(100svh - 112px)" }}
      >
        {/* UNA sola card unificada (referencia del cliente): cine + form
            fusionados dentro del mismo marco, flotando centrada sobre el
            fondo. El filete verde superior recorre TODO el componente. */}
        <div className="relative mx-auto flex w-full max-w-[1180px] flex-col overflow-hidden border border-white/[0.14] bg-surface-1 lg:grid lg:min-h-[580px] lg:grid-cols-[45fr_55fr]">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 z-20 h-[2px] bg-whatsapp"
          />
          {/* ══════════ IZQUIERDA — CINE ══════════ */}
          <div className="relative flex min-h-[42vh] flex-col justify-center overflow-hidden px-6 py-10 sm:px-10 lg:min-h-0 lg:px-12 lg:py-8 xl:px-16">
            <div ref={cineRef} aria-hidden className="absolute inset-0">
              {!reducedMotion ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover"
                >
                  <source src="/heros Vehiculos/mercedes benz auto.mp4" type="video/mp4" />
                </video>
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(160deg,#0d0d0f_0%,#050505_70%)]" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.72)_0%,rgba(5,5,5,0.5)_38%,rgba(5,5,5,0.88)_100%)]" />
            </div>

            <div className="relative z-10 flex flex-col gap-6 lg:gap-7">
              <div>
                <p
                  ref={eyebrowRef}
                  className="font-mono text-[11px] uppercase tracking-[0.14em] text-silver-300"
                >
                  Respuesta directa · WhatsApp
                </p>
                <h1
                  ref={h1Ref}
                  className="mt-3 font-display text-[2.75rem] leading-[0.98] text-paper-0 lg:text-[4rem] xl:text-[4.75rem]"
                >
                  Hablemos
                  <span ref={dotRef} className="text-mb-blue">
                    .
                  </span>
                </h1>
                <p
                  ref={leadRef}
                  className="mt-4 max-w-[34ch] text-[1.0625rem] leading-[1.55] text-silver-100"
                >
                  {pegar("Contame qué estás buscando y te respondo por WhatsApp — o elegí el canal que prefieras.")}
                </p>
              </div>

              <div className="flex flex-col divide-y divide-white/10 border-t border-white/10">
                {CHANNELS.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <a
                      key={c.id}
                      ref={(el) => {
                        channelRowRefs.current[i] = el;
                      }}
                      href={c.href}
                      target={c.external ? "_blank" : undefined}
                      rel={c.external ? "noopener noreferrer" : undefined}
                      className={`group/row relative flex items-center gap-3 py-2.5 pl-1 pr-2 -ml-1 transition-colors duration-[180ms] ease-[var(--ease-micro)] hover:bg-white/[0.06] ${FOCUS_RING}`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center border transition-[transform,border-color,color] duration-[220ms] ease-[var(--ease-micro)] group-hover/row:translate-x-1 ${
                          c.accent
                            ? "border-whatsapp/50 text-whatsapp group-hover/row:border-whatsapp"
                            : "border-white/15 text-silver-300 group-hover/row:border-white/40 group-hover/row:text-white"
                        }`}
                      >
                        <Icon className="h-[17px] w-[17px]" />
                      </span>
                      <span className="text-[14.5px] leading-tight">
                        <span className="font-medium text-white">{c.label}</span>{" "}
                        <span className="text-silver-300">{c.value}</span>
                      </span>
                    </a>
                  );
                })}

                {/* Fila — dirección + Cómo llegar */}
                <a
                  ref={(el) => {
                    channelRowRefs.current[CHANNELS.length] = el;
                  }}
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group/row relative flex items-center gap-3 py-2.5 pl-1 pr-2 -ml-1 transition-colors duration-[180ms] ease-[var(--ease-micro)] hover:bg-white/[0.06] ${FOCUS_RING}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/15 text-silver-300 transition-[transform,border-color,color] duration-[220ms] ease-[var(--ease-micro)] group-hover/row:translate-x-1 group-hover/row:border-white/40 group-hover/row:text-white">
                    <MapPin className="h-[17px] w-[17px]" />
                  </span>
                  <span className="flex-1 text-[14.5px] leading-tight">
                    <span className="font-medium text-white">Automotores Mega S.A.</span>{" "}
                    <span className="text-silver-300">
                      — Acceso Norte Rep. de Entre Ríos 5660, Paraná
                    </span>
                  </span>
                  <span className="hidden shrink-0 items-center gap-1 text-xs uppercase tracking-[0.08em] text-silver-300 transition-colors duration-[180ms] group-hover/row:text-white sm:flex">
                    Cómo llegar
                    <ArrowUpRight
                      size={13}
                      className="transition-transform duration-[180ms] ease-[var(--ease-micro)] group-hover/row:translate-x-[3px] group-hover/row:-translate-y-[3px]"
                    />
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* ══════════ DERECHA — FORMULARIO ══════════ */}
          <div className="relative flex flex-col justify-center bg-surface-2 px-6 py-10 sm:px-10 lg:px-14 lg:py-10 xl:px-16">
            {/* El form vive DENTRO de la card unificada: sin marco propio
                (el marco es de la card), solo su columna con aire. */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="relative mx-auto flex w-full max-w-[520px] flex-col gap-5"
            >
              <div ref={formTitleRef}>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-silver-500">
                  Respuesta directa
                </p>
                <p className="mt-1.5 text-2xl font-medium text-white">
                  Envíame tu consulta
                </p>
              </div>

              {/* Nombre */}
              <motion.div
                ref={(el) => {
                  fieldWrapRefs.current.name = el;
                }}
                animate={shakeControls.name}
                className="flex flex-col gap-1.5"
              >
                <label
                  htmlFor="contact-name"
                  className={`text-sm transition-colors duration-[180ms] ${labelClass("name")}`}
                >
                  Nombre
                </label>
                <input
                  ref={nameRef}
                  id="contact-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={values.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => {
                    handleBlur("name");
                    setFocusedField(null);
                  }}
                  aria-invalid={Boolean(touched.name && errors.name)}
                  aria-describedby={touched.name && errors.name ? "contact-name-error" : undefined}
                  placeholder="Tu nombre"
                  className={`${inputBase} ${inputBorderClass("name")} ${FOCUS_RING}`}
                />
                {touched.name && errors.name && (
                  <motion.p
                    id="contact-name-error"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: microDur, ease: EASE.micro }}
                    className="text-sm text-mb-blue"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </motion.div>

              {/* Teléfono */}
              <motion.div
                ref={(el) => {
                  fieldWrapRefs.current.phone = el;
                }}
                animate={shakeControls.phone}
                className="flex flex-col gap-1.5"
              >
                <label
                  htmlFor="contact-phone"
                  className={`text-sm transition-colors duration-[180ms] ${labelClass("phone")}`}
                >
                  Teléfono (opcional)
                </label>
                <input
                  ref={phoneRef}
                  id="contact-phone"
                  type="tel"
                  autoComplete="tel"
                  value={values.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => {
                    handleBlur("phone");
                    setFocusedField(null);
                  }}
                  aria-invalid={Boolean(touched.phone && errors.phone)}
                  aria-describedby={touched.phone && errors.phone ? "contact-phone-error" : undefined}
                  placeholder="+54 9 …"
                  className={`${inputBase} ${inputBorderClass("phone")} ${FOCUS_RING}`}
                />
                {touched.phone && errors.phone && (
                  <motion.p
                    id="contact-phone-error"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: microDur, ease: EASE.micro }}
                    className="text-sm text-mb-blue"
                  >
                    {errors.phone}
                  </motion.p>
                )}
              </motion.div>

              {/* Mensaje */}
              <motion.div
                ref={(el) => {
                  fieldWrapRefs.current.message = el;
                }}
                animate={shakeControls.message}
                className="flex flex-col gap-1.5"
              >
                <label
                  htmlFor="contact-message"
                  className={`text-sm transition-colors duration-[180ms] ${labelClass("message")}`}
                >
                  Mensaje
                </label>
                <textarea
                  ref={messageRef}
                  id="contact-message"
                  rows={3}
                  required
                  value={values.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  onFocus={() => setFocusedField("message")}
                  onBlur={() => {
                    handleBlur("message");
                    setFocusedField(null);
                  }}
                  aria-invalid={Boolean(touched.message && errors.message)}
                  aria-describedby={
                    touched.message && errors.message ? "contact-message-error" : undefined
                  }
                  placeholder="Hola Leonardo, quiero consultar por…"
                  className={`${inputBase} ${inputBorderClass("message")} ${FOCUS_RING} resize-none`}
                />
                {touched.message && errors.message && (
                  <motion.p
                    id="contact-message-error"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: microDur, ease: EASE.micro }}
                    className="text-sm text-mb-blue"
                  >
                    {errors.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Botón submit — CtaSweep verde full-width */}
              <div ref={buttonWrapRef} className="mt-1">
                <button
                  type="submit"
                  disabled={busy}
                  className={`group/submit relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden border px-6 text-sm font-semibold uppercase tracking-[0.08em] transition-colors duration-[180ms] ease-[var(--ease-micro)] ${FOCUS_RING} ${
                    isBlocked
                      ? "border-mb-blue bg-transparent text-mb-blue"
                      : "border-whatsapp bg-whatsapp text-white"
                  }`}
                >
                  {!isBlocked && (
                    <span
                      aria-hidden
                      className="absolute inset-0 origin-left scale-x-0 bg-white/20 transition-transform duration-[var(--dur-element)] ease-[var(--ease-scrub)] group-hover/submit:scale-x-100"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2.5">
                    {busy ? (
                      <>
                        <Spinner />
                        Abriendo WhatsApp…
                      </>
                    ) : isBlocked ? (
                      <>
                        Reintentar por WhatsApp
                        <ArrowRight size={16} />
                      </>
                    ) : (
                      <>
                        Enviar por WhatsApp
                        <ArrowRight
                          size={16}
                          className="transition-transform duration-[180ms] ease-[var(--ease-micro)] group-hover/submit:translate-x-1"
                        />
                      </>
                    )}
                  </span>
                </button>

                {/* Línea de estado */}
                <div className="mt-3 min-h-[2.5em]">
                  {result ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: microDur, ease: EASE.micro }}
                      className="text-[13px] leading-snug text-silver-300"
                    >
                      {result.type === "opened" ? (
                        <>
                          Se abrió WhatsApp en otra pestaña. Si no la ves, usá{" "}
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${FOCUS_RING} text-paper-0 underline underline-offset-[3px] hover:text-mb-blue`}
                          >
                            este enlace
                          </a>
                          .
                        </>
                      ) : (
                        <>
                          Tu navegador bloqueó la ventana. Abrí WhatsApp desde{" "}
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${FOCUS_RING} text-mb-blue underline underline-offset-[3px]`}
                          >
                            este enlace
                          </a>
                          .
                        </>
                      )}
                    </motion.p>
                  ) : (
                    <p className="text-[13px] leading-snug text-silver-500">
                      Se abre WhatsApp con el mensaje ya escrito — no se envía
                      nada sin tu confirmación.
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
