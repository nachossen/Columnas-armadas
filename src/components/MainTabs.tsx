'use client';

import type { CalculationResults } from '@/types';
import Dashboard from './Dashboard';
import MemoriaCalculo from './MemoriaCalculo';

interface MainTabsProps {
  results: CalculationResults | null;
  activeTab: 'dashboard' | 'memoria';
  setActiveTab: (tab: 'dashboard' | 'memoria') => void;
}

export default function MainTabs({ results, activeTab, setActiveTab }: MainTabsProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-1 h-10 shrink-0">
        {[
          { id: 'dashboard', label: '⊞ Dashboard de Verificación' },
          { id: 'memoria', label: '📄 Memoria de Cálculo Profesional' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="flex-1" />
        {results && (
          <div
            className={`text-xs font-bold mono px-3 py-1 rounded ${
              results.overallResult
                ? 'text-green-400 bg-green-950 border border-green-800'
                : 'text-red-400 bg-red-950 border border-red-800'
            }`}
          >
            {results.overallResult ? '✓ CUMPLE' : '✗ NO CUMPLE'}
          </div>
        )}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'dashboard' ? (
          <Dashboard results={results} />
        ) : (
          <MemoriaCalculo results={results} />
        )}
      </div>
    </div>
  );
}
