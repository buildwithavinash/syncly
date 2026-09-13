type LoaderProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
  centered?: boolean;
};

const SIZE_CLASSES: Record<NonNullable<LoaderProps["size"]>, string> = {
  sm: "h-3.5 w-3.5 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-7 w-7 border-[3px]",
};

const Loader = ({ size = "sm", label, centered = false }: LoaderProps) => {
  const spinner = (
    <span
      role="status"
      aria-label={label ?? "Loading"}
      className={`inline-block shrink-0 animate-spin rounded-full border-border-strong border-t-accent ${SIZE_CLASSES[size]}`}
    />
  );

  if (!label) {
    return centered ? (
      <div className="flex items-center justify-center py-8">{spinner}</div>
    ) : (
      spinner
    );
  }

  return (
    <div
      className={`flex items-center gap-2 text-sm text-slate ${
        centered ? "justify-center py-8" : ""
      }`}
    >
      {spinner}
      <span>{label}</span>
    </div>
  );
};

export default Loader;