import DomainCard from './DomainCard';

interface DomainData {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
  status: string;
  detail?: string;
  streak?: number;
  done?: boolean;
}

export default function DomainGrid({ domains }: { domains: DomainData[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {domains.map((d) => (
        <DomainCard key={d.label} {...d} />
      ))}
    </div>
  );
}
