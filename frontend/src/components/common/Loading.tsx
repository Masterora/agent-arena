import React from "react";
import styles from "./Loading.module.css";

export const Loading: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <div className={styles.spinnerOuter}>
          <div className={styles.spinnerGlow} />
          <div className={styles.spinnerTrack} />
          <div className={styles.spinnerHead} />
        </div>
        <p className={styles.label}>加载中...</p>
      </div>
    </div>
  );
};
