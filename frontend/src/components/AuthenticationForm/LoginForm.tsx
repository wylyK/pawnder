"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./LoginForm.module.css";
import { FaUserLarge } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { FaPaw } from "react-icons/fa";
import { useAuth } from "@/context/UserContext";

const LoginForm: React.FC = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const router = useRouter();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: email,
          Password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        router.push("/");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login"]}>
        <div className={styles["logo"]}>
          <FaPaw className={styles["logo-icon"]} />
          <span className={styles["logo-text"]}>Pawnder</span>
        </div>
        <form onSubmit={handleSubmit}>
          <h1>Login</h1>

          {error && <p className={styles["error-message"]}>{error}</p>}

          <div className={styles["text-field"]}>
            <FaUserLarge className={styles["text-icon"]} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email"
            />
          </div>

          <div className={styles["text-field"]}>
            <FaLock className={styles["text-icon"]} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password"
            />
          </div>

          <div className={styles["remember-me"]}>
            <input type="checkbox" id="remember-me" />
            <label htmlFor="remember-me" className={styles["remember-text"]}>
              Remember me
            </label>
          </div>

          <button type="submit" className={styles["submit"]}>
            Submit
          </button>

          <button
            type="button"
            className={styles["signup"]}
            onClick={() => router.push("/signup")}
          >
            Create an Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
