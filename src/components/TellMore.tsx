import { rich } from './Rich';

export function TellMore({ title = 'Tell me more', body }: { title?: string; body: string }) {
  return (
    <details className="more">
      <summary>{title}</summary>
      <div className="more-body">
        <p>{rich(body)}</p>
      </div>
    </details>
  );
}
