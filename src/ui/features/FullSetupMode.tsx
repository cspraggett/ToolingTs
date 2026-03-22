import styles from "../styles.module.css";
import { useFullSetup } from "./useFullSetup";
import { SetupForm } from "./full-setup/SetupForm";
import { SetupResults } from "./full-setup/SetupResults";

export function FullSetupMode() {
  const setup = useFullSetup();

  return (
    <div>
      <SetupForm setup={setup} />

      {/* ERROR */}
      {setup.error && <div className={styles.errorMessage}>{setup.error}</div>}

      {/* RESULTS */}
      {setup.result && (
        <SetupResults result={setup.result} />
      )}
    </div>
  );
}
