import { ExampleComponent } from "../components/example";

export const TemplatePage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
          Orderly template
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Your first Orderly page
        </h1>

        <ExampleComponent />
      </div>
    </div>
  );
};
