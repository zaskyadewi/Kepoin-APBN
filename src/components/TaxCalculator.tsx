import React, { useState } from "react";
import { Calculator, ArrowRight, Loader2, RefreshCw, Lightbulb, MessageSquare } from "lucide-react";
import { AllocationResult } from "../types";
import { calculateAllocation } from "../calculations";

interface TaxCalculatorProps {
  onSuggestPrompt: (prompt: string) => void;
}

export default function TaxCalculator({ onSuggestPrompt }: TaxCalculatorProps) {
  const [nominalStr, setNominalStr] = useState<string>("1000000");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<AllocationResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    { label: "Rp 50 Ribu", value: 50000 },
    { label: "Rp 500 Ribu", value: 500000 },
    { label: "Rp 1 Juta", value: 1000000 },
    { label: "Rp 5 Juta", value: 5000000 },
    { label: "Rp 10 Juta", value: 10000000 }
  ];

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleCalculate = async (valToCalc?: number) => {
    setError(null);
    setLoading(true);

    const checkValue = valToCalc || parseFloat(nominalStr.replace(/[^0-9]/g, ""));
    if (!checkValue || isNaN(checkValue) || checkValue <= 0) {
      setError("Masukkan angka nominal di atas Rp 0 ya, guys!");
      setLoading(false);
      return;
    }

    try {
      // Calculate locally instantly for 100% reliability regardless of hosting
      const calculated = calculateAllocation(checkValue);
      setResults(calculated);
    } catch (err: any) {
      setError("Wah, ada kendala saat menghitung alokasi anggaran.");
    } finally {
      setLoading(false);
    }
  };

  // Perform initial calculation on load
  React.useEffect(() => {
    handleCalculate(1000000);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    setNominalStr(rawVal);
  };

  return (
    <div className="bg-white rounded-2xl border border-mist shadow-xs p-6" id="tax-calculator-panel">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-ice rounded-lg text-cobalt">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-navy-deep text-lg">Simulator Kontribusi APBN</h3>
          <p className="text-xs text-pebble">Masukkan nominal pajakmu atau iuran belanja, cek kemana saja lari uangmu!</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-pebble uppercase tracking-wider mb-2">
            Masukan Uang Nominal (Rupiah)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-pebble text-sm">Rp</span>
            <input
              type="text"
              value={nominalStr ? parseInt(nominalStr).toLocaleString("id-ID") : ""}
              onChange={handleInputChange}
              placeholder="Misal: 1.000.000"
              className="w-full pl-11 pr-32 py-3 bg-paper rounded-xl text-obsidian font-bold placeholder-pebble/60 border border-mist focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt transition-colors"
              id="tax-nominal-input"
            />
            <button
              onClick={() => handleCalculate()}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold bg-cobalt text-white hover:bg-navy-deep px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              id="calc-submit-btn"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Kepoin"}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Presets */}
        <div>
          <span className="block text-[11px] font-semibold text-pebble uppercase tracking-wider mb-2">Preset Nominal Cepat:</span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  setNominalStr(p.value.toString());
                  handleCalculate(p.value);
                }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  parseFloat(nominalStr) === p.value
                    ? "bg-cobalt text-white border-cobalt shadow-xs"
                    : "bg-paper text-pebble border-mist/60 hover:border-pebble"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* Calculator Results */}
      {results && (
        <div className="mt-8 space-y-4 animate-fadeIn">
          <div className="bg-ice/30 border border-cobalt/15 p-4 rounded-xl text-center">
            <span className="text-xs text-pebble block">Alokasi Pembelian dari Dana Sebesar:</span>
            <span className="text-xl font-black text-navy-deep">{formatRupiah(parseFloat(nominalStr) || 0)}</span>
          </div>

          <div className="space-y-3">
            {results.map((r) => {
              const formattedAlloc = formatRupiah(r.allocatedValue);
              const percentage = (r.pct * 100).toFixed(2);

              return (
                <div key={r.key} className="p-4 rounded-xl border border-mist/40 bg-linear-to-r hover:bg-ice/5 transition-all">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div>
                      <span className="text-[11px] font-bold text-cobalt bg-ice px-2 py-0.5 rounded-md inline-block uppercase">
                        {percentage}% Alokasi
                      </span>
                      <h4 className="font-bold text-sm text-navy-deep mt-1 leading-tight">{r.label}</h4>
                    </div>
                    <span className="font-black text-sm text-obsidian shrink-0">{formattedAlloc}</span>
                  </div>

                  <p className="text-xs text-pebble mb-2 leading-relaxed">{r.desc}</p>

                  <div className="mt-2.5 bg-mint/45 border border-lime/20 rounded-lg p-2.5 flex gap-2 items-start text-xs text-leaf">
                    <Lightbulb className="w-4 h-4 text-lime shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block">Analogi Seru:</strong>
                      <span className="italic leading-normal text-pebble">{r.analogy}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connected Action */}
          <div className="pt-4 mt-6 border-t border-mist/50">
            <button
              onClick={() => {
                const calculatedText = parseFloat(nominalStr);
                onSuggestPrompt(`Gaji gue dipotong pajak sebesar ${formatRupiah(calculatedText)} setahun. Jelasin kemana aja distribusinya dong dan kasih analogi gaul yang gokil!`);
              }}
              className="w-full bg-linear-to-r from-navy-deep to-cobalt text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              Tanya Asisten AI Tentang Simulasi Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
