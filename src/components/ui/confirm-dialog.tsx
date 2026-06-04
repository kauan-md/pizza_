import { useState } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <div className="fixed inset-x-4 bottom-auto top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 animate-fade-in sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-50 ${
                variant === "danger" ? "bg-red-600" : "bg-primary text-primary-foreground"
              }`}
            >
              {loading ? "..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes fade-in{from{opacity:0}to{opacity:1}}.animate-fade-in{animation:fade-in .15s ease-out}`}</style>
    </>
  );
}
