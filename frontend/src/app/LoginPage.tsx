import React from "react";
import styles from "./LoginPage.module.css";
import { FaUserLarge } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { FaPaw } from "react-icons/fa"; 

const LoginPage: React.FC = () => {
    return (
        <div className={styles.Login}>
            <div className={styles.logo}>
                <FaPaw className={styles.logoIcon}/><span className={styles.logoText}>Pawnder</span>
            </div>
            <form>
                <h1>Login</h1>
                <div className={styles.emailField} >
                    <FaUserLarge className={styles.userIcon}/>
                    <input type="email" placeholder="Email"></input>
                </div>
                <div className={styles.passwordField} >
                    <FaLock className={styles.lockIcon}/>
                    <input type="password" placeholder="Password"></input>
                </div>
                <div className={styles.rememberMe}>
                        <input type="checkbox"/><div className={styles.rememberText}>Remember me</div>
                </div>
                <input className={styles.submit} type="submit"></input>
                <button className={styles.signUp}>Create an Account</button>
            </form>
        </div>
    )
}

export default LoginPage;