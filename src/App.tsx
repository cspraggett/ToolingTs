import { useSteelTooling } from "./useSteelTooling"; // Import your new hook
import { styles } from "./styles";
import { ResultDisplay } from "./ResultDisplay"; // Your display component

export default function SteelToolingCalculator() {
  // One line to rule them all!
  const { targetWidth, result, handleInputChange } = useSteelTooling();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Steel Tooling Calculator</h2>

      <input
        type="number"
        step="0.001"
        placeholder='Target width (")'
        value={targetWidth}
        onChange={handleInputChange}
        style={styles.input}
      />

      {/* Logic for showing helper text vs result */}
      {!result ? (
        <p style={styles.helper}>
          Enter a width to calculate tooling
        </p>
      ) : (
        <ResultDisplay result={result} />
      )}
    </div>
  );
}