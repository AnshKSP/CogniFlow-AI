interface CogniFlowLogoProps {
  size?: number
  className?: string
}

export default function CogniFlowLogo({ size = 40, className = '' }: CogniFlowLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CogniFlow AI Logo"
    >
      <defs>
        <linearGradient id="cogniflow-main" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67E8F9" />
          <stop offset="0.5" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="cogniflow-ring" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F0ABFC" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
      </defs>

      <rect x="6" y="6" width="52" height="52" rx="16" fill="url(#cogniflow-main)" />
      <circle cx="32" cy="32" r="14" stroke="url(#cogniflow-ring)" strokeWidth="3" />
      <path d="M22 32C22 26.477 26.477 22 32 22V42C26.477 42 22 37.523 22 32Z" fill="white" fillOpacity="0.92" />
      <circle cx="39" cy="25" r="3" fill="white" fillOpacity="0.92" />
      <circle cx="42" cy="32" r="2.5" fill="white" fillOpacity="0.82" />
      <circle cx="39" cy="39" r="2.5" fill="white" fillOpacity="0.72" />
    </svg>
  )
}

