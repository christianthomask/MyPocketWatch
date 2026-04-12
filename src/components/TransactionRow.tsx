export default function TransactionRow({
  transaction,
}: {
  transaction: {
    date: string;
    merchant_name: string;
    amount: number;
    category: string;
    pending: boolean;
  };
}) {
  return (
    <div className={`flex items-center justify-between py-3 px-1 ${transaction.pending ? 'opacity-50' : ''}`}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{transaction.merchant_name}</p>
        <p className="text-xs text-text-muted">
          {transaction.category} &bull; {new Date(transaction.date).toLocaleDateString()}
          {transaction.pending && ' \u2022 Pending'}
        </p>
      </div>
      <span className="text-sm font-medium ml-3">
        -${Number(transaction.amount).toFixed(2)}
      </span>
    </div>
  );
}
