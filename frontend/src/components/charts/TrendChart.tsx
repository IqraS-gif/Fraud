
"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";

export const TrendChart = () => {
  const { t } = useLanguage();

  const data = [
    { name: t('mon'), transactions: 2400 },
    { name: t('tue'), transactions: 1398 },
    { name: t('wed'), transactions: 9800 },
    { name: t('thu'), transactions: 3908 },
    { name: t('fri'), transactions: 4800 },
    { name: t('sat'), transactions: 3800 },
    { name: t('sun'), transactions: 4300 },
  ];

  return (
    <Card className="col-span-4 border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="text-slate-200">{t('transaction_volume')}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
              <Tooltip
                cursor={{ fill: '#1e293b' }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }}
              />
              <Bar dataKey="transactions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
