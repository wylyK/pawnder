import styles from "./LoadingScreen.module.css";

const LoadingScreen = () => {
    return (
        <div className={styles.loading}>
            Loading...
            <div className={styles.bar}></div>
        </div>
    )
}

export default LoadingScreen;