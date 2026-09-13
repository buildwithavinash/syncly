import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  variant?: "dialog" | "sheet";
  title?: string;
  showCloseButton?: boolean;
  children: ReactNode;
};

const Modal = ({
  isOpen,
  onClose,
  variant = "dialog",
  title,
  showCloseButton = true,
  children,
}: ModalProps) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const isSheet = variant === "sheet";
  const hasHeader = Boolean(title || showCloseButton);

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/45 sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`flex max-h-[85vh] w-full flex-col bg-bg ${
          isSheet
            ? "max-w-md rounded-t-lg sm:rounded-lg"
            : "max-w-sm rounded-lg"
        }`}
      >
        {isSheet && (
          <div className="mx-auto mt-3 h-1 w-8 shrink-0 rounded-full bg-border sm:hidden" />
        )}

        {hasHeader && (
          <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
            {title && (
              <h2 id="modal-title" className="font-display text-lg text-ink">
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="ml-auto rounded-full p-1 text-slate transition-colors hover:text-ink"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;