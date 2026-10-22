import React, { useState } from "react";
import { Coins, TrendingDown, Users, FileText, ChevronRight, ChevronDown, CheckCircle2 } from "lucide-react";

export default function APBNCharts() {
  const [activeTab, setActiveTab] = useState<"belanja" | "pendapatan">("belanja");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleExpand = (item: string) => {
    setExpandedItem(expandedItem === item ? null : item);
  };

  // Official audited variables for percentages
  const totalBelanja = 3359.76;
  const totalPendapatan = 2850.60;

  const belanjaItems = [
    { key: "tkd", label: "Transfer ke Daerah & Dana Desa (TKD)", amount: 863.54, desc: "Pemerataan dana pembangunan ke 38 provinsi & ribuan desa seluruh Indonesia.", details: "Termasuk Dana Desa sebesar Rp 70,93 Triliun untuk pembangunan jalan desa, BUMDes, dan air bersih.", color: "bg-lime-600" },
    { key: "barang", label: "Belanja Barang & Jasa", amount: 523.37, desc: "Biaya operasional pelayanan publik dan program penting nasional.", details: "Digunakan antara lain untuk logistik pemilu nasional, penanganan dampak El Nino, pemeliharaan fasilitas umum.", color: "bg-cobalt" },
    { key: "utang", label: "Pembayaran Bunga Utang", amount: 488.43, desc: "Pembayaran bunga atas obligasi negara (SBN) secara tepat waktu.", details: "Menjamin kredibilitas keuangan Indonesia di mata dunia agar iklim investasi tetap kondusif.", color: "bg-pebble" },
    { key: "pegawai", label: "Belanja Pegawai (Gaji ASN/TNI/Polri)", amount: 464.86, desc: "Gaji, tunjangan harian, jaminan kesehatan aparatur sipil negara.", details: "Untuk kelancaran layanan birokrasi, administrasi kependudukan, keamanan TNI & penegakan hukum Polri.", color: "bg-navy-deep" },
    { key: "modal", label: "Belanja Modal & Infrastruktur", amount: 355.51, desc: "Pembangunan aset fisik berwujud jangka panjang negara.", details: "Termasuk pembangunan sarana prasarana Gedung Pemerintahan IKN, bendungan ketahanan pangan, jembatan, bandara, dan alutsista TNI.", color: "bg-leaf" },
    { key: "subsidi", label: "Belanja Subsidi Energi & Non-Energi", amount: 292.69, desc: "Menjaga stabilitas daya beli masyarakat ekonomi kelas bawah.", details: "Dipakai untuk menyubsidi BBM (Solar/Pertalite), tarif listrik rumah tangga sederhana, LPG 3kg, dan pupuk petani.", color: "bg-sky-blue" },
    { key: "bansos", label: "Belanja Bantuan Sosial (Bansos)", amount: 154.95, desc: "Perlindungan sosial darurat langsung untuk masyarakat miskin.", details: "Digunakan untuk Program Keluarga Harapan (PKH), Kartu Sembako murah, Kartu Indonesia Pintar (KIP) Kuliah, dan bantuan iuran jaminan kesehatan BPJS (PBI-JKN).", color: "bg-emerald-500" }
  ];

  const pendapatanItems = [
    { key: "pajak", label: "Penerimaan Pajak", amount: 2231.84, desc: "Uang iuran wajib warga negara dan perusahaan berdasarkan UU.", details: "Pondasi utama APBN (sekitar 78.2%). Berasal dari PPh (Pajak Penghasilan), PPN (Pajak Pertambahan Nilai), PPnBM, Bea & Cukai.", color: "bg-cobalt" },
    { key: "pnbp", label: "Penerimaan Negara Bukan Pajak (PNBP)", amount: 584.38, desc: "Pendapatan dari pemanfaatan kekayaan sumber daya alam & layanan publik.", details: "Berasal dari royalti tambang, minyak bumi, dividen BUMN (seperti BRI, Mandiri, Telkom), dan biaya layanan paspor/SIM.", color: "bg-lime-600" },
    { key: "hibah", label: "Penerimaan Hibah", amount: 34.39, desc: "Sumbangan sukarela dari dalam maupun luar negeri tanpa janji timbal balik.", details: "Bantuan kerja sama internasional untuk pelestarian lingkungan hidup, bantuan kemanusiaan, atau riset strategis.", color: "bg-sky-blue" }
  ];

  return (
    <div className="bg-white rounded-2xl border border-mist shadow-xs overflow-hidden" id="apbn-charts-panel">
      {/* Tab controls */}
      <div className="flex border-b border-mist bg-ice/30">
        <button
          onClick={() => setActiveTab("belanja")}
          className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            activeTab === "belanja"
              ? "bg-white text-navy-deep border-b-2 border-cobalt"
              : "text-pebble hover:text-navy-deep hover:bg-ice/20"
          }`}
          id="tab-belanja-btn"
        >
          <Coins className="w-4 h-4 text-cobalt" />
          Detail Belanja Negara
        </button>
        <button
          onClick={() => setActiveTab("pendapatan")}
          className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            activeTab === "pendapatan"
              ? "bg-white text-navy-deep border-b-2 border-cobalt"
              : "text-pebble hover:text-navy-deep hover:bg-ice/20"
          }`}
          id="tab-pendapatan-btn"
        >
          <Coins className="w-4 h-4 text-leaf" />
          Sumber Pendapatan Negara
        </button>
      </div>

      <div className="p-6">
        {activeTab === "belanja" ? (
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-semibold text-pebble uppercase tracking-wider">Total Belanja Negara 2024</span>
                <span className="text-2xl font-black text-navy-deep">Rp 3.359,76 Triliun</span>
              </div>
              <p className="text-xs text-pebble">
                Belanja disalurkan langsung untuk menjamin layanan publik, pembangunan masa depan, dan subsidi daya beli masyarakat.
              </p>
            </div>

            {/* List with visual progress */}
            <div className="space-y-4">
              {belanjaItems.map((item) => {
                const percentage = ((item.amount / totalBelanja) * 100).toFixed(1);
                const isExpanded = expandedItem === item.key;

                return (
                  <div key={item.key} className="p-4 rounded-xl border border-mist/50 hover:border-cobalt/30 hover:bg-ice/5 transition-all">
                    <div
                      className="flex items-start justify-between gap-3 cursor-pointer"
                      onClick={() => toggleExpand(item.key)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`${item.color} w-2.5 h-2.5 rounded-full inline-block`}></span>
                          <h4 className="font-semibold text-sm text-obsidian tracking-tight">{item.label}</h4>
                        </div>
                        <p className="text-xs text-pebble line-clamp-2 md:line-clamp-none mb-2">{item.desc}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-sm text-navy-deep block">Rp {item.amount.toLocaleString("id-ID")} T</span>
                        <span className="text-xs font-semibold text-cobalt bg-ice px-1.5 py-0.5 rounded-sm inline-block mt-0.5">{percentage}%</span>
                      </div>
                    </div>

                    {/* Progress bar container */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2" onClick={() => toggleExpand(item.key)}>
                      <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-mist/40 text-xs text-obsidian bg-ice/20 p-3 rounded-lg flex items-start gap-2 animate-fadeIn bg-linear-to-r from-ice/30 to-white">
                        <CheckCircle2 className="w-4 h-4 text-cobalt shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-navy-deep block mb-1">Pemanfaatan Nyata:</strong>
                          <p className="leading-relaxed text-pebble">{item.details}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-semibold text-pebble uppercase tracking-wider">Total Pendapatan Negara 2024</span>
                <span className="text-2xl font-black text-leaf">Rp 2.850,60 Triliun</span>
              </div>
              <p className="text-xs text-pebble">
                Didominasi sektor perpajakan (sekitar 78.2%), menunjukkan besarnya peran patungan masyarakat membangun bangsa.
              </p>
            </div>

            {/* List with visual progress */}
            <div className="space-y-4">
              {pendapatanItems.map((item) => {
                const percentage = ((item.amount / totalPendapatan) * 100).toFixed(1);
                const isExpanded = expandedItem === item.key;

                return (
                  <div key={item.key} className="p-4 rounded-xl border border-mist/50 hover:border-lime/30 hover:bg-mint/10 transition-all">
                    <div
                      className="flex items-start justify-between gap-3 cursor-pointer"
                      onClick={() => toggleExpand(item.key)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`${item.color} w-2.5 h-2.5 rounded-full inline-block`}></span>
                          <h4 className="font-semibold text-sm text-obsidian tracking-tight">{item.label}</h4>
                        </div>
                        <p className="text-xs text-pebble line-clamp-2 md:line-clamp-none mb-2">{item.desc}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-sm text-leaf block">Rp {item.amount.toLocaleString("id-ID")} T</span>
                        <span className="text-xs font-semibold text-lime-700 bg-mint px-1.5 py-0.5 rounded-sm inline-block mt-0.5">{percentage}%</span>
                      </div>
                    </div>

                    {/* Progress bar container */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2" onClick={() => toggleExpand(item.key)}>
                      <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-mist/40 text-xs text-obsidian bg-mint/20 p-3 rounded-lg flex items-start gap-2 animate-fadeIn bg-linear-to-r from-mint/30 to-white">
                        <CheckCircle2 className="w-4 h-4 text-lime-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-leaf block mb-1">Penjelasan Sektor:</strong>
                          <p className="leading-relaxed text-pebble">{item.details}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Highlight panels for State Health */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-ice border border-cobalt/10">
            <div className="flex items-center gap-2 mb-1 text-navy-deep font-bold text-sm">
              <TrendingDown className="w-4 h-4 text-cobalt" />
              Defisit Anggaran LKPP 2024
            </div>
            <div className="text-xl font-black text-navy-deep mt-1">Rp 509,16 Triliun</div>
            <div className="text-xs font-semibold text-cobalt/83 mt-1 inline-flex items-center bg-white border border-cobalt/20 px-2 py-0.5 rounded-md">
              Level 2,30% dari PDB (Sangat Aman)
            </div>
            <p className="text-xs text-pebble mt-2 leading-relaxed">
              Defisit ditutup dengan pembiayaan investasi produktif. Rasio defisit ditekan aman di bawah batas maksimal Konstitusi RI (3.0%).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-mint border border-leaf/10">
            <div className="flex items-center gap-2 mb-1 text-leaf font-bold text-sm">
              <Users className="w-4 h-4 text-leaf" />
              Indikator Kesejahteraan Rakyat
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-white p-2 rounded-lg text-center border border-leaf/10">
                <span className="text-xs text-pebble block">Kemiskinan</span>
                <span className="text-sm font-black text-leaf">Turun ke 8,57%</span>
              </div>
              <div className="bg-white p-2 rounded-lg text-center border border-leaf/10">
                <span className="text-xs text-pebble block">Pengangguran</span>
                <span className="text-sm font-black text-leaf">Turun ke 4,91%</span>
              </div>
            </div>
            <p className="text-xs text-pebble mt-2 leading-relaxed font-medium">
              Kualitas hidup membaik secara bertahap seiring percepatan redistribusi bansos dan alokasi dana pembangunan desa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
