export function ProposalBanner() {
  return (
    <div
      role="note"
      className="flex items-center justify-center gap-2 bg-[#04080f] px-4 py-1.5 text-center text-xs font-medium tracking-wide text-[#c4d2e6]"
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#f2c14e]" />
      <span>
        <strong className="font-semibold text-white">Protótipo</strong> · ideia de layout, não é o
        site oficial · Ace Lab
      </span>
    </div>
  );
}
