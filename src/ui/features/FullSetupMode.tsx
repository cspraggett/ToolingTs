import { useFullSetup } from "./useFullSetup";
import { SetupForm } from "./full-setup/SetupForm";
import { SetupResults } from "./full-setup/SetupResults";

export function FullSetupMode() {
  const setup = useFullSetup();

  return (
    <div>
      <SetupForm setup={setup} />

      {/* ERROR */}
      {setup.error && <div className="mt-4 text-destructive font-medium p-4 border border-destructive rounded-md bg-destructive/10">{setup.error}</div>}

      {/* RESULTS */}
      {setup.result && (
        <SetupResults result={setup.result} />
      )}
    </div>
  );
}
