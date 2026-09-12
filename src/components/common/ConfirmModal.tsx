import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirming?: boolean;
};

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  confirming = false,
}: ConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="dialog" showCloseButton={false}>
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-danger-tint">
          <AlertTriangle className="h-4 w-4 text-danger" />
        </div>

        <h2 className="mb-1 font-display text-base text-ink">{title}</h2>
        <p className="mb-5 text-sm text-slate">{description}</p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="flex-1 rounded-md border border-border py-2 text-sm text-ink transition-colors hover:border-border-strong disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 rounded-md bg-danger py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {confirming ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;