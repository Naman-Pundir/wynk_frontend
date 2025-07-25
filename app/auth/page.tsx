"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [userType, setUserType] = useState<"user" | "singer">("user");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();

  const handleRegister = async () => {
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${baseUrl}/wynk/register/${userType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          password: password,
        }),
      });

      if (res.ok) {
        setMessage("Registered successfully!");
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed.");
      }
    } catch (err) {
      setError("Failed to connect to server.");
    }
  };

  const handleLogin = async () => {
    setError("");
    setMessage("");

    try {
      const endpoint = userType === "singer" ? `${baseUrl}/wynk/login/singer` : `${baseUrl}/wynk/login`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name, password: password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("username", name);
        sessionStorage.setItem("password", password);
        router.push(userType === "singer" ? "/singerDashboard" : "/dashboard");
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      setError("Login request failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-gray-900 p-6 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold mb-4">
          {isRegistering ? "Register" : "Login"}
        </h1>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            {isRegistering ? "Registering as" : "Logging in as"}
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setUserType("user")}
              className={`px-4 py-2 rounded ${
                userType === "user"
                  ? "bg-white text-black"
                  : "bg-gray-700 text-white"
              }`}
            >
              User
            </button>
            <button
              onClick={() => setUserType("singer")}
              className={`px-4 py-2 rounded ${
                userType === "singer"
                  ? "bg-white text-black"
                  : "bg-gray-700 text-white"
              }`}
            >
              Singer
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Name"
          className="w-full px-4 py-2 mb-3 rounded bg-gray-800 text-white border border-gray-700"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 mb-3 rounded bg-gray-800 text-white border border-gray-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {message && <p className="text-green-500 mb-2">{message}</p>}

        <button
          onClick={isRegistering ? handleRegister : handleLogin}
          className="w-full bg-white text-black py-2 rounded font-semibold hover:bg-gray-300 transition"
        >
          {isRegistering ? "Register" : "Login"}
        </button>

        <p
          className="mt-4 text-sm text-gray-400 cursor-pointer hover:underline text-center"
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </p>
      </div>
    </div>
  );
}
