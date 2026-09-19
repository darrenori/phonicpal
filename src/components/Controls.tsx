import type { ReactNode } from 'react';
import { Volume2 } from 'lucide-react';
import { speak } from '../shared/speech';

/** Reads a piece of text aloud. Every instruction in the app carries one. */
export function Hear({ text, label = 'Hear this', size = 'sm', tone }: { text: string; label?: string; size?: 'sm' | 'md'; tone?: 'lemon' | 'leaf' }) {
  return (
    <button
      type="button"
      className={`cube ${size === 'sm' ? 'cube--sm' : ''} ${tone ? `cube--${tone}` : ''}`}
      aria-label={label}
      title={label}
      onClick={() => speak(text)}
    >
      <Volume2 size={size === 'sm' ? 16 : 20} strokeWidth={2.4} aria-hidden="true" />
    </button>
  );
}

export function Switch({ checked, onChange, children, id }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; id: string }) {
  return (
    <button type="button" role="switch" id={id} aria-checked={checked} className="switch" onClick={() => onChange(!checked)}>
      <span className="switch-track" aria-hidden="true">
        <span className="switch-knob" />
      </span>
      <span className="switch-label">{children}</span>
    </button>
  );
}
