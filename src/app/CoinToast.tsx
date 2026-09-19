import { useEffect, useState } from 'react';

type Listener = (amount: number, reason: string) => void;
const listeners = new Set<Listener>();

/** Announces earned coins beside the coin counter. */
export function celebrate(amount: number, reason: string): void {
  if (amount <= 0) return;
  listeners.forEach((l) => l(amount, reason));
}

export function CoinToast() {
  const [toast, setToast] = useState<{ id: number; amount: number; reason: string } | null>(null);
  useEffect(() => {
    let timer = 0;
    const listener: Listener = (amount, reason) => {
      window.clearTimeout(timer);
      setToast({ id: Date.now(), amount, reason });
      timer = window.setTimeout(() => setToast(null), 2600);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      window.clearTimeout(timer);
    };
  }, []);
  return (
    <div className="coin-toast-region" aria-live="polite" role="status">
      {toast && (
        <div key={toast.id} className="coin-toast">
          <span className="coin-disc" aria-hidden="true" />
          <strong className="num">+{toast.amount}</strong>
          <span>{toast.reason}</span>
        </div>
      )}
    </div>
  );
}
