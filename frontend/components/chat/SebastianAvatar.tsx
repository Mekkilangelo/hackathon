import { SebastianLogo } from "@/components/layout/Header";

export default function SebastianAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: "var(--marine)",
        border: "1px solid var(--or)40",
      }}
    >
      <SebastianLogo size={size * 0.55} />
    </div>
  );
}
