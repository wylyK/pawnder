"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "./SignupForm.module.css";
import { FaUserLarge } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { FaPaw } from "react-icons/fa";

const SignupForm: React.FC = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();
  const [fname, setFname] = React.useState("");
  const [lname, setLname] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  const handleFnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFname(e.target.value);
  };

  const handleLnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLname(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          LName: lname,
          FName: fname,
          Email: email,
          Password: password,
          Role: role,
        }),
      });

      if (response.ok) {
        alert("Create account successful!");
        router.push("/login");
      } else {
        const errorData = await response.json();
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className={styles["signup-container"]}>
      <div className={styles["signup"]}>
        <div className={styles["logo"]}>
          <FaPaw className={styles["logo-icon"]} />
          <span className={styles["logo-text"]}>Pawnder</span>
        </div>

        <form onSubmit={handleSubmit}>
          <h1>Sign Up</h1>

          <div className={styles["full-name"]}>
            <div className={styles["text-field"]}>
              <input
                type="text"
                placeholder="First Name"
                value={fname}
                onChange={handleFnameChange}
              />
            </div>

            <div className={styles["text-field"]}>
              <input
                type="text"
                placeholder="Last Name"
                value={lname}
                onChange={handleLnameChange}
              />
            </div>
          </div>

          <div
            className={`${styles["text-field"]} ${styles["email-password"]}`}
          >
            <FaUserLarge className={styles["text-icon"]} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
            />
          </div>

          <div className={styles["select-field"]}>
            <FaUserLarge className={styles["text-icon"]} />
            <select value={role} onChange={handleRoleChange}>
              <option value="" disabled hidden>
                Select Role
              </option>
              <option value="Owner">Pet Owner</option>
              <option value="Vet">Veterinarian</option>
            </select>
          </div>

          <div className={styles["divider"]} />

          <div
            className={`${styles["text-field"]} ${styles["email-password"]}`}
          >
            <FaLock className={styles["text-icon"]} />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>

          <div
            className={`${styles["text-field"]} ${styles["email-password"]}`}
          >
            <FaLock className={styles["text-icon"]} />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />
          </div>

          <button type="submit" className={styles["submit"]}>
            Submit
          </button>

          <button
            type="button"
            className={styles["login"]}
            onClick={handleLoginRedirect}
          >
            Already Have an Account? Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
