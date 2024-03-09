import Image from "next/image";
import styles from "./page.module.css";
import Quiz from "./Quiz";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}></div>

      <div className={styles.center}>
        <Quiz />
      </div>

      <div className={styles.grid}></div>
    </main>
  );
}
