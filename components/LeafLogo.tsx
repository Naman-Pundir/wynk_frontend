// components/logo.tsx
import Image from "next/image";

type LogoProps = {
  size?: number;
};

export default function Logo({ size = 64 }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Leaf Headband Logo"
      width={size}
      height={size}
      className="invert"
      priority
    />
  );
}
