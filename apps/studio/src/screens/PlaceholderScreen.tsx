import styles from "./PlaceholderScreen.module.css";

// === PUBLIC API ===

export interface PlaceholderScreenProps {
  /** The canvas screen this route will implement, e.g. "02 Contact sheet". */
  canvasScreen: string;
  prdSection: string;
}

/** Stands in for a screen until its wave-3 unit lands. Says which design and PRD section it will follow. */
export function PlaceholderScreen({ canvasScreen, prdSection }: PlaceholderScreenProps) {
  return (
    <section className={styles.placeholder}>
      <h2 className={styles.heading}>{canvasScreen}</h2>
      <p className={styles.detail}>NOT BUILT YET · PRD-0001 {prdSection}</p>
    </section>
  );
}
