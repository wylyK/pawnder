import React from "react";
import Link from "next/link";
import styles from "./SignupForm.module.css";
import { FaUserLarge } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { FaPaw } from "react-icons/fa";

const SignupForm: React.FC = () => {
  return (
    <div className={styles["signup-container"]}>
      <div className={styles["signup"]}>
        <div className={styles["logo"]}>
          <FaPaw className={styles["logo-icon"]} />
          <span className={styles["logo-text"]}>Pawnder</span>
        </div>
        <form>
          <h1>Sign Up</h1>
          <div className={styles["full-name"]}>
            <div className={styles["text-field"]}>
              <input type="text" placeholder="First Name"></input>
            </div>
            <div className={styles["text-field"]}>
              <input type="text" placeholder="Last Name"></input>
            </div>
          </div>
          <div
            className={`${styles["text-field"]} ${styles["email-password"]}`}
          >
            <FaUserLarge className={styles["text-icon"]} />
            <input type="email" placeholder="Email"></input>
          </div>
          <div className={styles["divider"]} />
          <div
            className={`${styles["text-field"]} ${styles["email-password"]}`}
          >
            <FaLock className={styles["text-icon"]} />
            <input type="password" placeholder="New Password"></input>
          </div>
          <div
            className={`${styles["text-field"]} ${styles["email-password"]}`}
          >
            <FaLock className={styles["text-icon"]} />
            <input type="password" placeholder="Confirm Password"></input>
          </div>
          <Link href="/login" className={styles["submit"]}>
            <input type="submit"></input>
          </Link>
          <button className={styles["login"]}>
            Already Have an Account? Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
