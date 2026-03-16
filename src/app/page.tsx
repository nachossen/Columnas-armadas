'use client';

import { useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import MainTabs from '@/components/MainTabs';
import TipologiaSelector from '@/components/TipologiaSelector';
import { UPN_CATALOG } from '@/data/upn_catalog';
import { ANGULOS_CATALOG } from '@/data/angulos_catalog';
import { calculate } from '@/lib/calculator';
import type { ColumnInputs, CalculationResults, TipologiaColumna } from '@/types';

const DEFAULT_UPN = UPN_CATALOG.find(p => p.designation === 'UPN 200') ?? UPN_CATALOG[6];
const DEFAULT_ANGULO = ANGULOS_CATALOG.find(p => p.designation === 'L 60×60×6') ?? ANGULOS_CATALOG[9];

function makeDefaultInputs(tipologia: TipologiaColumna): ColumnInputs {
  const base: ColumnInputs = {
    tipologia,
    profile: DEFAULT_UPN,
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
    celosia_tipo: 'simple',
    angulo_lacing: DEFAULT_ANGULO,
    angulo_contacto: DEFAULT_ANGULO,
    t_cp: 12,
  };
  // Tipología-specific adjustments
  if (tipologia === 'celosia') {
    return { ...base, a: 600, h_sep: 150 };
  }
  if (tipologia === 'perfiles_contacto') {
    return { ...base, h_sep: 10, a: 600 }; // platina 10mm
  }
  if (tipologia === 'cajón' || tipologia === 'chapas_continuas') {
    return { ...base, conexion: 'soldadura', a: 0 };
  }
  return base;
}

export default function Home() {
  const [mode, setMode] = useState<'selector' | 'calculator'>('selector');
  const [inputs, setInputs] = useState<ColumnInputs>(makeDefaultInputs('empresillada'));
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'memoria'>('dashboard');

  const handleSelectTipologia = useCallback((tipologia: TipologiaColumna) => {
    setInputs(makeDefaultInputs(tipologia));
    setResults(null);
    setMode('calculator');
  }, []);

  const handleChangeTipologia = useCallback(() => {
    setMode('selector');
  }, []);

  const handleCalculate = useCallback(() => {
    const res = calculate(inputs);
    setResults(res);
  }, [inputs]);

  if (mode === 'selector') {
    return (
      <TipologiaSelector
        onSelect={handleSelectTipologia}
        currentTipologia={inputs.tipologia}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      <Sidebar
        inputs={inputs}
        onChange={setInputs}
        onCalculate={handleCalculate}
        onChangeTipologia={handleChangeTipologia}
      />
      <MainTabs
        results={results}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
