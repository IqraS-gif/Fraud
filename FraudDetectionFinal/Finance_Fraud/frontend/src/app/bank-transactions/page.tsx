
"use client"

import { TransactionTable } from "@/components/tables/TransactionTable";
import { TransactionSimulator } from "@/components/transactions/TransactionSimulator";
import { useLanguage } from "@/context/LanguageContext";

export default function TransactionsPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">{t('bank_transactions')}</h2>
          <p className="text-slate-400 mt-1">{t('transactions_subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Side: Simulator (Top) */}
        <div className="lg:col-span-12">
          <TransactionSimulator />
        </div>

        {/* Bottom: Transaction History */}
        <div className="lg:col-span-12 space-y-4">
          <h3 className="text-xl font-semibold text-slate-200">{t('recent_transactions')}</h3>
          <TransactionTable />
        </div>
      </div>
    </div>
  );
}
