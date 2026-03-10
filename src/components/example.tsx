import { Box } from "@orderly.network/ui";

type ExampleComponentProps = {
  title?: string;
  description?: string;
};

export const ExampleComponent = ({
  title = "Example component",
  description = "You can start building your UI by editing this component.",
}: ExampleComponentProps) => {
  return (
    <Box className="w-full rounded-xl border border-slate-800 bg-slate-900/70 p-4 md:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-slate-50">{title}</h2>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
    </Box>
  );
};
