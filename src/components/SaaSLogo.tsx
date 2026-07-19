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

  // Fallback beautiful vector representation matching your uploaded design perfectly
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Blue Squircle Background */}
      <rect
        x="6"
        y="6"
        width="108"
        height="108"
        rx="30"
        fill="url(#blue-logo-grad)"
        stroke="#2563EB"
        strokeWidth="1"
      />

      {/* Group of Cubes (stretching slightly for high definition) */}
      <g>
        {/* Cube 1: Top Center (cx: 60, cy: 47) */}
        {/* Top face */}
        <polygon
          points="60,47 73.9,39 60,31 46.1,39"
          fill="rgba(255, 255, 255, 0.08)"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left face */}
        <polygon
          points="60,47 46.1,39 46.1,55 60,63"
          fill="rgba(255, 255, 255, 0.03)"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right face */}
        <polygon
          points="60,47 73.9,39 73.9,55 60,63"
          fill="rgba(255, 255, 255, 0.16)"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cube 2: Bottom Left (cx: 36, cy: 73) */}
        {/* Top face */}
        <polygon
          points="36,73 49.9,65 36,57 22.1,65"
          fill="rgba(255, 255, 255, 0.08)"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left face */}
        <polygon
          points="36,73 22.1,65 22.1,81 36,89"
          fill="rgba(255, 255, 255, 0.03)"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right face */}
        <polygon
          points="36,73 49.9,65 49.9,81 36,89"
          fill="rgba(255, 255, 255, 0.16)"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cube 3: Bottom Right (cx: 84, cy: 73) */}
        {/* Top face */}
        <polygon
          points="84,73 97.9,65 84,57 70.1,65"
          fill="rgba(255, 255, 255, 0.08)"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left face */}
        <polygon
          points="84,73 70.1,65 70.1,81 84,89"
          fill="rgba(255, 255, 255, 0.03)"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right face */}
        <polygon
          points="84,73 97.9,65 97.9,81 84,89"
          fill="rgba(255, 255, 255, 0.16)"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <defs>
        <linearGradient id="blue-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E5AF6" />
          <stop offset="100%" stopColor="#103FE1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
