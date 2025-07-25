'use client'

import Logo from "../components/LeafLogo";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <Logo size={80} />
      <h1 className="text-4xl sm:text-6xl font-bold mt-6">Team-7</h1>
      <p className="mt-4 text-lg sm:text-xl text-gray-400">Music. That. Works.</p>
      <div className="mt-10">
        <button className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-300 transition"
        onClick={() => router.push("/auth")}>
          Get Started
        </button>
      </div>
    </main>
  );
}
