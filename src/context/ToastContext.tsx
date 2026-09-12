import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, AlertCircle, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_DURATION_MS = 3000;

const ToastIcon = ({ variant }: { variant: ToastVariant }) => {
  if (variant === "error") {
    return <AlertCircle className="h-4 w-4 shrink-0" />;
  }

  if (variant === "info") {
    return <Info className="h-4 w-4 shrink-0" />;
  }

  return <Check className="h-4 w-4 shrink-0" />;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = nextId.current++;

      setToasts((current) => [...current, { id, message, variant }]);

      window.setTimeout(() => {
        removeToast(id);
      }, TOAST_DURATION_MS);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 px-gutter pb-6 sm:items-end sm:pr-8"
          aria-live="polite"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="status"
              className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-md bg-ink px-4 py-3 text-sm text-white"
            >
              <ToastIcon variant={toast.variant} />

              <span>{toast.message}</span>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="ml-auto text-white/60 transition-colors hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};