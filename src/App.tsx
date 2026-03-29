import { FullSetupMode } from "./ui/features/FullSetupMode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SlitMaster() {
  return (
    <div className="min-h-screen bg-slate-50/50 print:bg-white print:p-0">
      <div className="mx-auto p-6 md:p-10 max-w-6xl print:max-w-none print:p-0">
        <header className="mb-10 text-center no-print">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Slit <span className="text-primary">Master</span>
          </h1>
        </header>

        <Card className="shadow-lg border-slate-200 overflow-hidden print:shadow-none print:border-none print:bg-transparent">
          <div className="h-1.5 bg-primary w-full no-print" />
          <CardHeader className="pb-4 no-print">
            <CardTitle className="text-2xl">Full Setup Mode</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Generate a complete master arbor layout for multiple strips.</CardDescription>
          </CardHeader>
          <CardContent className="print:p-0">
            <FullSetupMode />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
