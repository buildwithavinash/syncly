import { Image as ImageIcon } from "lucide-react";

type ImagePlaceholderProps = {
  label?: string;
  className?: string;
};

const ImagePlaceholder = ({
  label = "Add screenshot",
  className = "",
}: ImagePlaceholderProps) => {
  return (
    <div
      className={`flex aspect-video w-full items-center justify-center rounded-md border border-dashed border-border-strong bg-surface ${className}`}
    >
      <div className="flex flex-col items-center gap-1.5 text-slate">
        <ImageIcon className="h-5 w-5" />
        <span className="text-xs">{label}</span>
      </div>
    </div>
  );
};

export default ImagePlaceholder;