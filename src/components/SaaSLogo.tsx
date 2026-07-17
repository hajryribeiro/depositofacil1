import React, { useState, useEffect } from "react";

// ============================================================================
// 🛠️ CONFIGURAÇÃO DIRETA DE LOGOMARCA NO CÓDIGO (ALTERE AQUI SEU LOGOTIPO OFICIAL)
// 
// Se você quiser alterar o logo permanentemente na construção do código,
// basta colocar a URL da sua imagem (http/https) ou a String em Base64 na constante abaixo:
// ============================================================================
const LOGO_CONSTRUTOR_PERMANENTE: string = ""; 
// ============================================================================

interface SaaSLogoProps {
  className?: string;
  size?: number;
  logoUrl?: string;
}

export default function SaaSLogo({ className = "", size = 40, logoUrl }: SaaSLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  // Reset image failure state if the logoUrl or permanent logo changes
  useEffect(() => {
    setImgFailed(false);
  }, [logoUrl, LOGO_CONSTRUTOR_PERMANENTE]);

  // Priority of resolving the logo:
  // 1. Permanent URL hardcoded above in the code (LOGO_CONSTRUTOR_PERMANENTE)
  // 2. Dynamic state passed from parent (logoUrl)
  // 3. LocalStorage preference (localStorage.getItem("saas_logo_url"))
  // 4. Default public file path (/logo.png)
  const resolvedLogo = 
    LOGO_CONSTRUTOR_PERMANENTE || 
    logoUrl || 
    localStorage.getItem("saas_logo_url") || 
    "/logo.png";

  if (resolvedLogo && !imgFailed) {
    return (
      <img
        src={resolvedLogo}
        alt="SaaS Logo"
        width={size}
        height={size}
        onError={() => setImgFailed(true)}
        className={`${className} object-contain rounded-lg`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Fallback beautiful vector representation matching your uploaded high-tech design perfectly
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background glow */}
      <circle cx="60" cy="60" r="45" fill="url(#glow-grad)" opacity="0.15" />

      {/* Futuristic Sweep Particle Trail around the bottom-left of the hexagon */}
      <path 
        d="M 15 65 Q 20 102 58 102 Q 95 102 110 52" 
        stroke="url(#cyan-teal-grad)" 
        strokeWidth="2" 
        strokeLinecap="round"
        fill="none" 
        opacity="0.8"
      />
      <path 
        d="M 10 55 Q 12 95 50 110 Q 85 110 105 75" 
        stroke="#F43F5E" 
        strokeWidth="1.2" 
        strokeLinecap="round"
        fill="none" 
        opacity="0.5"
      />

      {/* Tech Code Labels (Left & Bottom-Right) matches the uploaded image */}
      <text x="3" y="32" fill="#38BDF8" fontFamily="monospace" fontSize="6.5" fontWeight="bold" opacity="0.85">B30000ER</text>
      <text x="3" y="40" fill="#38BDF8" fontFamily="monospace" fontSize="6.5" fontWeight="bold" opacity="0.85">B2000004</text>

      <text x="76" y="96" fill="#64748B" fontFamily="monospace" fontSize="5" fontWeight="bold" opacity="0.8">67600006</text>
      <text x="76" y="102" fill="#64748B" fontFamily="monospace" fontSize="5" fontWeight="bold" opacity="0.8">00000055</text>
      <text x="76" y="108" fill="#64748B" fontFamily="monospace" fontSize="5" fontWeight="bold" opacity="0.8">00000067</text>

      {/* Circuit lines connecting the vertices */}
      <path d="M 60 20 L 95 40 M 95 40 L 95 80 M 95 80 L 60 100" stroke="#0ea5e9" strokeWidth="1" opacity="0.4" />
      <path d="M 60 100 L 25 80 M 25 80 L 25 40 M 25 40 L 60 20" stroke="#0ea5e9" strokeWidth="1" opacity="0.4" />

      {/* Arrow parallel traces shooting from top-right */}
      <path d="M 72 45 L 105 12 M 77 50 L 110 17 M 67 40 L 100 7" stroke="url(#arrow-grad)" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      <path d="M 85 30 L 115 0" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      
      {/* Arrow Head */}
      <path 
        d="M 115 0 L 98 2 M 115 0 L 113 18" 
        stroke="url(#arrow-grad)" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Hexagonal Outer Frame */}
      {/* Points: (60,20), (95,40), (95,80), (60,100), (25,80), (25,40) */}
      <polygon 
        points="60,20 95,40 95,80 60,100 25,80 25,40" 
        fill="url(#hex-bg-grad)" 
        stroke="url(#hex-stroke-grad)" 
        strokeWidth="2.5" 
        strokeLinejoin="round"
      />

      {/* Circuit dots on Hexagon corners */}
      <circle cx="60" cy="20" r="2.5" fill="#22D3EE" />
      <circle cx="95" cy="40" r="2.5" fill="#F43F5E" />
      <circle cx="95" cy="80" r="2.5" fill="#22D3EE" />
      <circle cx="60" cy="100" r="2.5" fill="#38BDF8" />
      <circle cx="25" cy="80" r="2.5" fill="#F43F5E" />
      <circle cx="25" cy="40" r="2.5" fill="#22D3EE" />

      {/* Inner Hexagon (The core cube representation) */}
      {/* Points: (60,42), (81,54), (81,78), (60,90), (39,78), (39,54) */}
      <polygon 
        points="60,42 81,54 81,78 60,90 39,78 39,54" 
        fill="url(#inner-hex-grad)" 
        stroke="#06B6D4" 
        strokeWidth="1.5" 
        strokeLinejoin="round"
        opacity="0.95"
      />

      {/* Inner Central Cube Facets for the glowing 3D cube effect */}
      <path d="M 60 42 L 60 66 L 81 54 M 60 66 L 39 54" stroke="#22D3EE" strokeWidth="1" strokeLinecap="round" />
      <polygon points="60,66 81,78 60,90 39,78" fill="#0891B2" fillOpacity="0.4" />
      
      {/* Dynamic Glowing Core */}
      <circle cx="60" cy="66" r="4.5" fill="#22D3EE" className="animate-pulse" />
      <circle cx="60" cy="66" r="2" fill="#FFFFFF" />

      {/* Gradients */}
      <defs>
        <radialGradient id="glow-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0891B2" stopOpacity="0" />
        </radialGradient>
        
        <linearGradient id="cyan-teal-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0891B2" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>

        <linearGradient id="arrow-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>

        <linearGradient id="hex-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#1E293B" stopOpacity="0.95" />
        </linearGradient>

        <linearGradient id="hex-stroke-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        <linearGradient id="inner-hex-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0F766E" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
