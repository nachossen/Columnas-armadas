'use client';

import { useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import MainTabs from '@/components/MainTabs';
import { UPN_CATALOG } from '@/data/upn_catalog';
import { calculate } from '@/lib/calculator';
import type { ColumnInputs, CalculationResults } from '@/types';

const DEFAULT_PROFILE = UPN_CATALOG.find(p => p.designation === 'UPN 200') ?? UPN_CATALOG[6];

const DEFAULT_INPUTS: ColumnInputs = {
  tipologia: 'empresillada',
  profile: DEFAULT_PROFILE,
  L: 6.0,
  h_sep: 150,
  a: 800,
  K: 1.0,
  conexion: 'bulones',
  Fy: 250,
  Fu: 400,
  E: 200000,
  Pu: 500,
  Vu: 10,
  Mu: 0,
};

export default function Home() {
  const [inputs, setInputs] = useState<ColumnInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'memoria'>('dashboard');

  const handleCalculate = useCallback(() => {
    const res = calculate(inputs);
    setResults(res);
  }, [inputs]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      <Sidebar
        inputs={inputs}
        onChange={setInputs}
        onCalculate={handleCalculate}
      />
      <MainTabs
        results={results}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
