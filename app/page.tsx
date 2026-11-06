"use client";

import Image from "next/image";
import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { useEffect, useState } from "react";

const INTRO_KEY = "menza-opening-intro-seen";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMounted(true);

    if (reducedMotion) {
      setShowIntro(false);
      setIntroComplete(true);
      return;
    }

    let hasSeenIntro = false;
    try {
      hasSeenIntro = window.sessionStorage.getItem(INTRO_KEY) === "true";
    } catch {}

    if (hasSeenIntro) {
      setIntroComplete(true);
      return;
    }

    setShowIntro(true);
    const timer = window.setTimeout(() => {
      setShowIntro(false);
      setIntroComplete(true);
      try {
        window.sessionStorage.setItem(INTRO_KEY, "true");
      } catch {}
    }, 4600);

    return () => window.clearTimeout(timer);
  }, []);

  function skipIntro() {
    setShowIntro(false);
    setIntroComplete(true);
    try {
      window.sessionStorage.setItem(INTRO_KEY, "true");
    } catch {}
  }

  return (
    <MotionConfig reducedMotion="user">
    <main className="relative grid min-h-screen grid-cols-1 bg-[#474747] font-sans md:grid-cols-[51.25%_48.75%]">
      <section className="relative flex min-h-[60vh] items-center bg-[#474747] md:min-h-screen">
        <div className="w-full px-6 md:px-[24px]">
          <div className="flex items-center gap-[10px]">
            <div className="relative flex h-[74px] w-[74px] shrink-0 items-center justify-center">
              <Image
                src="/figma/menza-logo.svg"
                alt=""
                fill
                sizes="74px"
                priority
              />
              <span className="relative -mt-[1px] text-[40px] font-bold leading-none text-[#1a1a1a]">
                M
                <span className="absolute -right-[1px] top-[-12px] text-[18px] text-[#1a1a1a]">
                  *
                </span>
              </span>
            </div>
            <motion.h1
              initial={mounted && showIntro && !introComplete ? { opacity: 0, x: 16 } : false}
              animate={introComplete ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="whitespace-nowrap text-[clamp(32px,4.7vw,64px)] font-bold leading-none text-white"
            >
              Menza Barbershop
            </motion.h1>
          </div>

          <motion.p
            initial={mounted && showIntro && !introComplete ? { opacity: 0, y: 12 } : false}
            animate={introComplete ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="mt-[24px] ml-[84px] text-[16px] text-[#dedede]"
          >
            Selamat Datang di Menza Barbershop!
          </motion.p>

          <div className="mt-[30px] ml-[84px]">
            <motion.div
              initial={mounted && showIntro && !introComplete ? { opacity: 0, y: 12 } : false}
              animate={introComplete ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.45, delay: 0.26 }}
            >
              <Link
              href="/masuk"
              className="relative flex h-[52px] w-[220px] items-center justify-center overflow-hidden text-[14px] font-bold text-[#1a1a1a]"
            >
              <Image
                src="/figma/login-button.svg"
                alt=""
                fill
                sizes="220px"
                priority
              />
              <span className="relative z-10">Masuk</span>
            </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="relative min-h-[40vh] overflow-hidden md:min-h-screen">
        <motion.div
          className="absolute inset-0"
          initial={mounted && showIntro && !introComplete ? { x: "100%" } : false}
          animate={introComplete ? { x: 0 } : undefined}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/figma/landing-interior.png"
            alt="Interior Menza Barbershop"
            fill
            sizes="50vw"
            className="object-cover"
            priority
            quality={90}
          />
        </motion.div>
      </div>

      {showIntro && !introComplete && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          initial={{ backgroundColor: "#ffffff" }}
          animate={{ backgroundColor: ["#ffffff", "#ffffff", "#474747", "#474747"] }}
          transition={{ duration: 4.2, times: [0, 0.18, 0.55, 1] }}
        >
          <motion.div
            className="relative flex h-[128px] items-center justify-center text-[128px] font-bold leading-none text-[#1a1a1a]"
            initial={{ x: "-52vw" }}
            animate={{ x: ["-52vw", "-4vw", "-4vw", 0], scale: [1, 1, 1, 0.57] }}
            transition={{
              x: { duration: 3.5, times: [0, 0.32, 0.72, 1], ease: "easeInOut" },
              scale: { delay: 3.35, duration: 0.45 },
            }}
          >
            <motion.span
              className="inline-block"
              initial={{ rotate: 79 }}
              animate={{ rotate: [79, 29, -11, 0] }}
              transition={{ duration: 1.15, times: [0, 0.3, 0.65, 1], ease: "easeInOut" }}
            >
              M
            </motion.span>
            <motion.span
              className="overflow-hidden text-[128px]"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              transition={{ delay: 1.25, duration: 0.55 }}
            >
              enza
            </motion.span>
            <motion.span
              className="inline-block"
              initial={{ x: -12, rotate: 0 }}
              animate={{ x: [0, 110, 0], rotate: [0, 180, 0] }}
              transition={{ delay: 0.55, duration: 1.05, ease: "easeInOut" }}
            >
              *
            </motion.span>
          </motion.div>
          <button
            type="button"
            onClick={skipIntro}
            className="absolute bottom-[24px] right-[24px] rounded-full border border-white/40 px-4 py-2 text-xs text-white/80"
          >
            Lewati
          </button>
        </motion.div>
      )}
    </main>
    </MotionConfig>
  );
}
