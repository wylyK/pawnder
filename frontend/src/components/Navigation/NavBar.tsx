import Link from "next/link";
import React from "react";
import { CiCalendar } from "react-icons/ci";
import { FaRegUser } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import { MdOutlineHome } from "react-icons/md";
import { PiPawPrint } from "react-icons/pi";
import styles from "./NavBar.module.css";

const NavBar: React.FC = () => {
  return (
    <nav className={styles.nav}>
      <ul className={styles.ul}>
        {/* Home Icon */}
        <li className={styles.li}>
          <Link href="/" className={styles.link}>
            <MdOutlineHome />
          </Link>
        </li>

        {/* Notification Icon */}
        <li className={styles.li}>
          <Link href="/notification" className={styles.link}>
            <IoMdNotificationsOutline strokeWidth={5} />
          </Link>
        </li>

        {/* Calendar Icon */}
        <li className={styles.li}>
          <Link href="/calendar" className={styles.link}>
            <CiCalendar strokeWidth={1} />
          </Link>
        </li>

        {/* Paw Icon */}
        <li className={styles.li}>
          <Link href="/pets" className={styles.link}>
            <PiPawPrint strokeWidth={5} />
          </Link>
        </li>

        {/* User Icon */}
        <li className={styles.li}>
          <Link href="/user" className={styles.link}>
            <FaRegUser />
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
