import { APBNStat } from "./types";

export const APBN_STATS: { [key: string]: APBNStat } = {
  pendapatan: {
    label: "Total Pendapatan Negara",
    amount: "Rp 2.850,60 T",
    description: "Semua dana masuk negara dari pajak, PNBP, dan hibah.",
    subItems: [
      { label: "Pajak (Keringat Rakyat & Korporasi)", amount: "Rp 2.231,84 T" },
      { label: "PNBP (Sumber Daya Alam & Layanan)", amount: "Rp 584,38 T" },
      { label: "Hibah (Hadiah/Sumbangan Sukarela)", amount: "Rp 34,39 T" }
    ]
  },
  belanja: {
    label: "Total Belanja Negara",
    amount: "Rp 3.359,76 T",
    description: "Semua uang keluar untuk operasional rakyat dan negara.",
    subItems: [
      { label: "Transfer ke Daerah & Dana Desa (TKD)", amount: "Rp 863,54 T" },
      { label: "Belanja Barang & Jasa (Logistik/Operasi)", amount: "Rp 523,37 T" },
      { label: "Pembayaran Bunga Utang", amount: "Rp 488,43 T" },
      { label: "Belanja Pegawai (Gaji Guru, TNI, ASN)", amount: "Rp 464,86 T" },
      { label: "Modal & Infrastruktur (Jalan, IKN, Jembatan)", amount: "Rp 355,51 T" },
      { label: "Subsidi (BBM, Listrik, LPG Melon)", amount: "Rp 292,69 T" },
      { label: "Bantuan Sosial (KIP-K, PKH, Sembako)", amount: "Rp 154,95 T" }
    ]
  },
  defisit: {
    label: "Defisit Anggaran",
    amount: "Rp 509,16 T",
    description: "Selisih belanja di atas pendapatan. Masih aman terkendali di level 2,30% dari PDB (batas aman undang-undang adalah 3,00%).",
    badge: "2,30% PDB"
  },
  kesejahteraan: {
    label: "Indikator Kesejahteraan",
    amount: "Tingkat Membaik",
    description: "Hasil dari pemanfaatan belanja APBN untuk kesejahteraan hidup langsung.",
    subItems: [
      { label: "Tingkat Kemiskinan Nasional", amount: "Turun ke 8,57%" },
      { label: "Tingkat Pengangguran Terbuka", amount: "Turun ke 4,91%" }
    ]
  }
};

export const QUICK_PROMPTS = [
  { text: "Berapa belanja infrastruktur & IKN?", Category: "Infrastruktur" },
  { text: "Gaji gue dipotong pajak Rp 3.000.000 per tahun, jadinya apa aja?", Category: "Pajakku" },
  { text: "Apakah defisit APBN Indonesia aman?", Category: "Ekonomi" },
  { text: "Logistik pemilu kemarin diambil dari mana?", Category: "Pemilu" },
  { text: "Berapa jatah subsidi BBM dan LPG 3kg?", Category: "Subsidi" },
  { text: "Uang bansos lari ke KIP Kuliah atau apa saja?", Category: "Bansos" }
];
