import React from "react";
import Link from "next/link";
import { MdOutlineHome, MdHome } from "react-icons/md";
import {
  PiPawPrintBold,
  PiPawPrintFill,
  PiCalendarBlankBold,
  PiCalendarBlankFill,
} from "react-icons/pi";
import { FaRegUser, FaUser } from "react-icons/fa6";
import { RiLogoutBoxRFill, RiLogoutBoxRLine } from "react-icons/ri";
import styles from "./NavBar.module.css";

const NavBar: React.FC = () => {
  return (
    <nav className={styles.nav}>
      <ul className={styles.ul}>
        {/* Home Icon */}
        <li className={styles.li}>
          <Link href="/" className={`${styles.link} ${styles.home}`}>
            <MdOutlineHome className={styles["dormant"]} />
            <MdHome className={styles["hovered"]} />
          </Link>
        </li>

        {/* Paw Icon */}
        <li className={styles.li}>
          <Link href="/pets" className={`${styles.link} ${styles.paw}`}>
            <PiPawPrintBold className={styles["dormant"]} />
            <PiPawPrintFill className={styles["hovered"]} />
          </Link>
        </li>

        {/* Calendar Icon */}
        <li className={styles.li}>
          <Link
            href="/calendar"
            className={`${styles.link} ${styles.calendar}`}
          >
            <PiCalendarBlankBold className={styles["dormant"]} />
            <PiCalendarBlankFill
              className={styles["hovered"]}
              strokeWidth={7}
            />
          </Link>
        </li>

        {/* User Icon */}
        <li className={styles.li}>
          <Link href="/profile" className={styles.link}>
            <FaRegUser className={styles["dormant"]} />
            <FaUser className={styles["hovered"]} />
          </Link>
        </li>

        {/* Logout Icon */}
        <li className={styles.li}>
          <Link href="/login" className={`${styles.link} ${styles.logout}`}>
            <RiLogoutBoxRLine className={styles["dormant"]} />
            <RiLogoutBoxRFill className={styles["hovered"]} />
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
