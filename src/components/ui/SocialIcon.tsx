import type { Platform } from "@/data/channels";

const COLORS: Record<Platform, string> = {
  Instagram: "text-[#ff5f9e] in-data-[theme=light]:text-[#d6246e]",
  TikTok: "text-[#25f4ee] in-data-[theme=light]:text-[#0a9a96]",
  YouTube: "text-[#ff3b3b] in-data-[theme=light]:text-[#d92020]",
  Spotify: "text-[#1ed760] in-data-[theme=light]:text-[#12923f]",
};

export function SocialIcon({
  platform,
  className = "h-6 w-6",
  colored = true,
}: {
  platform: Platform;
  className?: string;
  colored?: boolean;
}) {
  const color = colored ? COLORS[platform] : "";
  const common = {
    viewBox: "0 0 24 24",
    className: `${className} ${color}`,
    "aria-hidden": true,
    focusable: false,
  } as const;

  switch (platform) {
    case "Instagram":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "YouTube":
      return (
        <svg {...common}>
          <rect x="2" y="5" width="20" height="14" rx="4.5" fill="currentColor" />
          <path d="m10 9 5.5 3-5.5 3V9Z" fill="#0d1626" />
        </svg>
      );
    case "TikTok":
      return (
        <svg {...common} fill="currentColor">
          <path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.2V2h-3.4v13.4a2.9 2.9 0 1 1-2-2.8V9.1a6.3 6.3 0 1 0 5.4 6.3V8.6a8.2 8.2 0 0 0 4.8 1.5V6.7Z" />
        </svg>
      );
    case "Spotify":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <g fill="none" stroke="#0d1626" strokeLinecap="round">
            <path d="M6.6 9.6c3.6-1 7.6-.7 10.9 1.2" strokeWidth="1.9" />
            <path d="M7.2 12.8c3-.8 6.1-.5 8.8 1" strokeWidth="1.6" />
            <path d="M7.9 15.7c2.4-.6 4.7-.3 6.7.8" strokeWidth="1.4" />
          </g>
        </svg>
      );
  }
}
