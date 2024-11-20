import React from "react";
import Link from "next/link";
import styles from "./LoginForm.module.css";
import { FaUserLarge } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { FaPaw } from "react-icons/fa";

const LoginForm: React.FC = () => {
  return (
    <div className={styles["login-container"]}>
      <div className={styles["login"]}>
        <div className={styles["logo"]}>
          <FaPaw className={styles["logo-icon"]} />
          <span className={styles["logo-text"]}>Pawnder</span>
        </div>
        <form>
          <h1>Login</h1>
          <div className={styles["text-field"]}>
            <FaUserLarge className={styles["text-icon"]} />
            <input type="email" placeholder="Email"></input>
          </div>
          <div className={styles["text-field"]}>
            <FaLock className={styles["text-icon"]} />
            <input type="password" placeholder="Password"></input>
          </div>
          <div className={styles["remember-me"]}>
            <input type="checkbox" />
            <div className={styles["remember-text"]}>Remember me</div>
          </div>
          <Link href="/" className={styles["submit"]}>
            <input type="submit"></input>
          </Link>
          <Link href="/signup">
            <button className={styles["signup"]}>Create an Account</button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
