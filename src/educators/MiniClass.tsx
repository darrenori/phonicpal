import { SAMPLE_LEARNERS } from './sampleData';
import { DayRods, SupportChips, WordsSecured } from './parts';
import './dashboard.css';

/** A compact, read-only slice of the educator table for the landing page. */
export function MiniClass() {
  const rows = SAMPLE_LEARNERS.slice(0, 5);
  const max = Math.max(...rows.flatMap((l) => l.minutes.slice(-7)));
  return (
    <figure className="mini-class">
      <figcaption>
        <strong>P2 Kindness, this week</strong>
        <span className="sample-badge">Sample data</span>
      </figcaption>
      <div className="table-scroll">
        <table className="ltable ltable--mini">
          <thead>
            <tr>
              <th scope="col">Learner</th>
              <th scope="col" className="col-wide">Last 7 days</th>
              <th scope="col">Words secured</th>
              <th scope="col">Needs support</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <th scope="row">{l.name}</th>
                <td className="col-wide">
                  <DayRods minutes={l.minutes.slice(-7)} max={max} label={`Minutes per day: ${l.minutes.slice(-7).join(', ')}`} />
                </td>
                <td>
                  <WordsSecured l={l} />
                </td>
                <td>
                  <SupportChips items={l.support.slice(0, 1)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
