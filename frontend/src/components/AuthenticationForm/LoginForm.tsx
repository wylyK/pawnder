"use client"

import React from "react";
import { useRouter } from "next/navigation";
import styles from "./LoginForm.module.css";
import { FaUserLarge } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { FaPaw } from "react-icons/fa";

const LoginForm: React.FC = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        router.push("/");
      } else {
        const errorData = await response.json();
        console.log(errorData);
      }
    } catch (err) {
      console.error("Error:", err);
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

          <div className={styles["text-field"]}>
            <FaUserLarge className={styles["text-icon"]} />
            <input type="email" placeholder="Email" value={email} onChange={handleEmailChange}/>
          </div>

          <div className={styles["text-field"]}>
            <FaLock className={styles["text-icon"]} />
            <input type="password" placeholder="Password" value={password} onChange={handlePasswordChange}/>
          </div>

          <div className={styles["remember-me"]}>
            <input type="checkbox" />
            <div className={styles["remember-text"]}>Remember me</div>
          </div>
          
          <button type="submit" className={styles["submit"]}> Submit </button>
          
          <button className={styles["signup"]} onClick={() => router.push("/signup")}>Create an Account</button>

        </form>
      </div>
    </div>
  );
};

export default LoginForm;
