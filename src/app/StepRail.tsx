import { Check } from 'lucide-react';

export interface RailStep<T extends string> {
  id: T;
  label: string;
}

/** Numbered steps as one rod of unit cubes: done cubes are filled, the current one is lifted, later ones are empty slots. */
export function StepRail<T extends string>({
  steps,
  current,
  done,
  onSelect,
  label,
}: {
  steps: Array<RailStep<T>>;
  current: T;
  done: Partial<Record<T, unknown>>;
  onSelect: (id: T) => void;
  label: string;
}) {
  return (
    <ol className="rail" aria-label={label}>
      {steps.map((step, i) => {
        const isDone = Boolean(done[step.id]);
        const isCurrent = step.id === current;
        return (
          <li key={step.id}>
            <button
              type="button"
              className={`rail-step ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
              onClick={() => onSelect(step.id)}
            >
              <span className="rail-num" aria-hidden="true">
                {isDone && !isCurrent ? <Check size={16} strokeWidth={3} /> : i + 1}
              </span>
              <span className="rail-label">
                {step.label}
                {isDone && <span className="visually-hidden"> (done)</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
