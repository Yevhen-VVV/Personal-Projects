import { UI } from './strings';

export interface PickerItem {
  id: string;
  title: string;
  /** Russian line under the title. */
  detail: string;
  /** Optional short badge, e.g. duration. */
  badge?: string;
}

/** A plain list of things to choose from: scenarios, recordings, phrase groups. */
export function Picker({
  title,
  hint,
  items,
  onPick,
  onBack,
  extra,
}: {
  title: string;
  hint: string;
  items: PickerItem[];
  onPick: (id: string) => void;
  onBack: () => void;
  /** Optional block above the list, for the daily drill button. */
  extra?: React.ReactNode;
}) {
  return (
    <div>
      <div className="topbar">
        <button onClick={onBack}>{UI.back}</button>
      </div>
      <h1>{title}</h1>
      <p className="muted">{hint}</p>

      {extra}

      <div className="stack">
        {items.map((item) => (
          <button key={item.id} onClick={() => onPick(item.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'baseline' }}>
              <strong>{item.title}</strong>
              {item.badge && <span className="pill">{item.badge}</span>}
            </div>
            <div className="muted small">{item.detail}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
