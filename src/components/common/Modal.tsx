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

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/45 sm:items-center"
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
        className={
          isSheet
            ? "w-full max-w-md rounded-t-lg bg-bg p-6 sm:rounded-lg"
            : "w-full max-w-sm rounded-lg bg-bg p-6"
        }
      >
        {isSheet && (
          <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-border sm:hidden" />
        )}

        {(title || showCloseButton) && (
          <div className="mb-4 flex items-center justify-between">
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

        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;