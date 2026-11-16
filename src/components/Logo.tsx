"use client";

import { useState } from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

// โลโก้สถานศึกษา — วางไฟล์รูปที่ public/logo.png (รองรับ .png/.jpg/.svg)
// ถ้ายังไม่มีไฟล์ จะแสดง emoji 🏛️ แทน
export function Logo({ size = 56, className = "" }: LogoProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <span
        className={`flex items-center justify-center rounded-full border-2 border-amber-300 bg-white/10 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        🏛️
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="โลโก้"
      width={size}
      height={size}
      onError={() => setError(true)}
      className={`shrink-0 rounded-full object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
