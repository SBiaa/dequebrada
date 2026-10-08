import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="De Quebrada, página inicial"
      className={`display flex items-center gap-2 text-[1.7rem] leading-none ${className}`}
    >
      <span aria-hidden="true" className="h-6 w-1 rounded-full bg-accent" />
      <span>De Quebrada</span>
    </Link>
  );
}
