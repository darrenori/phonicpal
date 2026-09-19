/** The slice of TensorFlow.js that face-api exposes but doesn't declare. */
interface Tf {
  setBackend(name: string): Promise<boolean>;
  ready(): Promise<void>;
}

/** Runs the models on the graphics card when the browser allows it, and on the processor otherwise. */
export async function pickBackend(tf: unknown): Promise<void> {
  const t = tf as Tf;
  try {
    if (!(await t.setBackend('webgl'))) await t.setBackend('cpu');
  } catch {
    await t.setBackend('cpu');
  }
  await t.ready();
}
