import React from 'react';

// Dark moody ambient glow background (gradient orbs / aurora atmosphere)
export function LivingOrigamiBg({ className = "" }) {
  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden ${className}`}>
      {/* Base deep background */}
      <div className="absolute inset-0 bg-[#060713]" />

      {/* Top-left deep violet radial glow */}
      <div
        className="absolute w-[95vw] h-[95vw] max-w-[650px] max-h-[650px] rounded-full blur-[110px] opacity-75"
        style={{
          top: '-10%',
          left: '-15%',
          background: 'radial-gradient(circle, rgba(62, 42, 138, 0.85) 0%, rgba(35, 20, 85, 0.45) 55%, transparent 75%)',
        }}
      />

      {/* Bottom-right cobalt royal-blue radial glow */}
      <div
        className="absolute w-[100vw] h-[100vw] max-w-[700px] max-h-[700px] rounded-full blur-[130px] opacity-80"
        style={{
          bottom: '-12%',
          right: '-15%',
          background: 'radial-gradient(circle, rgba(22, 60, 140, 0.9) 0%, rgba(12, 35, 95, 0.5) 60%, transparent 80%)',
        }}
      />

      {/* Subtle center ambient filler */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 45% 50%, rgba(38, 30, 95, 0.5) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}

export default LivingOrigamiBg;
