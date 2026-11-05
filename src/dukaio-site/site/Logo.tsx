import logo from "@/dukaio-site/assets/dukaio-logo.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center ${className}`}>
      <img src={logo} alt="Dukaio" width={938} height={216} draggable={false} className="h-7 w-auto object-contain" />
    </span>
  );
}
