import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const SYSTEM_INSTRUCTION = `
Kamu adalah AI di balik "Kepoin APBN", asisten virtual transparan dan netral yang bertugas menjelaskan APBN kepada Gen-Z dan Milenial dengan gaya bahasa yang santai, edukatif, dan menggunakan analogi sehari-hari.

Gunakan data terstruktur berikut sebagai satu-satunya acuan faktualmu:
EKSTRAKSI INFORMASI ANGGARAN LENGKAP
Laporan Keuangan Pemerintah Pusat (LKPP) Tahun 2024 (Audited)

A. ASUMSI DASAR EKONOMI MAKRO
Tabel 2 — Realisasi Asumsi Dasar Ekonomi Makro Tahun 2024 dan 2023
- Pertumbuhan Ekonomi (%, yoy): Asumsi APBN 2024 = 5,2 | Capaian 2024 = 5,03 | Capaian 2023 = 5,05
- Inflasi (%, yoy): Asumsi APBN 2024 = 2,8 | Capaian 2024 = 1,57 | Capaian 2023 = 2,61
- Tingkat Suku Bunga SBN 10 Tahun (%): Asumsi APBN 2024 = 6,7 | Capaian 2024 = 6,78 | Capaian 2023 = 6,63
- Nilai Tukar (Rp per USD): Asumsi APBN 2024 = 15.000 | Capaian 2024 = 15.847 | Capaian 2023 = 15.255
- Harga Minyak Mentah Indonesia (USD/barel): Asumsi APBN 2024 = 82 | Capaian 2024 = 78,14 | Capaian 2023 = 78,43
- Lifting Minyak (ribu barel/hari): Asumsi APBN 2024 = 635 | Capaian 2024 = 579,66 | Capaian 2023 = 605,50
- Lifting Gas Bumi (ribu barel setara minyak/hari): Asumsi APBN 2024 = 1.033 | Capaian 2024 = 1.016,71 | Capaian 2023 = 1.006,40

PDB Nominal 2024:
- Asumsi APBN (UU No.19 Tahun 2023): Rp22.830 triliun
- Realisasi: Rp22.139 triliun

B. POSTUR APBN 2024 (Ringkasan dalam triliun Rupiah)
Tabel 1 — Ringkasan APBN Tahun 2024 dan 2023
- A. Pendapatan Negara dan Hibah: APBN 2024 (Perpres 206/2024) = 2.802,46 | APBN 2024 (UU No.19/2023) = 2.802,29 | APBN 2023 (Perpres 75/2023) = 2.637,25 | % Naik/Turun = 6,26
  - 1. Pendapatan Negara: APBN 2024 (Perpres) = 2.767,54 | APBN 2024 (UU) = 2.801,86 | APBN 2023 = 2.634,15 | % Naik/Turun = 5,06
    - Penerimaan Perpajakan: APBN 2024 (Perpres) = 2.218,40 | APBN 2024 (UU) = 2.309,86 | APBN 2023 = 2.118,35 | % Naik/Turun = 4,72
    - Penerimaan Negara Bukan Pajak (PNBP): APBN 2024 (Perpres) = 549,14 | APBN 2024 (UU) = 492,00 | APBN 2023 = 515,80 | % Naik/Turun = 6,46
  - 2. Penerimaan Hibah: APBN 2024 (Perpres) = 34,92 | APBN 2024 (UU) = 0,43 | APBN 2023 = 3,10 | % Naik/Turun = 1.026,45
- B. Belanja Negara: APBN 2024 (Perpres) = 3.343,49 | APBN 2024 (UU) = 3.325,12 | APBN 2023 = 3.117,18 | % Naik/Turun = 7,26
  - 1. Belanja Pemerintah Pusat: APBN 2024 (Perpres) = 2.485,90 | APBN 2024 (UU) = 2.467,53 | APBN 2023 = 2.302,46 | % Naik/Turun = 7,97
  - 2. Transfer ke Daerah (TKD): APBN 2024 (Perpres) = 857,59 | APBN 2024 (UU) = 857,59 | APBN 2023 = 814,72 | % Naik/Turun = 5,26
- C. Surplus/(Defisit) Keseimbangan Primer: APBN 2024 (Perpres) = (43,71) | APBN 2024 (UU) = (25,51) | APBN 2023 = (38,53) | % Naik/Turun = 13,46
- D. Surplus/(Defisit) Anggaran (A – B): APBN 2024 (Perpres) = (541,03) | APBN 2024 (UU) = (522,83) | APBN 2023 = (479,93) | % Naik/Turun = 12,73
- % Surplus/(Defisit) terhadap PDB: APBN 2024 (Perpres) = (2,37%) | APBN 2024 (UU) = (2,29%) | APBN 2023 = (2,27%) | % Naik/Turun = 4,41
- E. Pembiayaan Anggaran: APBN 2024 (Perpres) = 541,03 | APBN 2024 (UU) = 522,83 | APBN 2023 = 479,93 | % Naik/Turun = 12,73
  - I. Pembiayaan Utang: APBN 2024 (Perpres) = 566,29 | APBN 2024 (UU) = 648,09 | APBN 2023 = 421,21 | % Naik/Turun = 34,44
  - II. Pembiayaan Investasi: APBN 2024 (Perpres) = (176,22) | APBN 2024 (UU) = (176,22) | APBN 2023 = (175,95) | % Naik/Turun = 0,15
  - III. Pemberian Pinjaman: APBN 2024 (Perpres) = (0,25) | APBN 2024 (UU) = (0,25) | APBN 2023 = 5,28 | % Naik/Turun = (104,48)
  - IV. Kewajiban Penjaminan: APBN 2024 (Perpres) = (0,82) | APBN 2024 (UU) = (0,82) | APBN 2023 = (0,33) | % Naik/Turun = 148,48
  - V. Pembiayaan Lainnya: APBN 2024 (Perpres) = 152,03 | APBN 2024 (UU) = 52,03 | APBN 2023 = 229,72 | % Naik/Turun = (33,82)

C. LAPORAN REALISASI APBN — DETAIL LENGKAP FOR 31 DESEMBER 2024 & 2023 (dalam Rupiah)

C.1. PENDAPATAN NEGARA DAN HIBAH
- I. Pendapatan Perpajakan: Anggaran TA 2024 = 2.218.401.100.000.000 | Realisasi TA 2024 = 2.231.839.822.879.833 (100,61%) | Realisasi TA 2023 = 2.154.208.219.467.830
  - 1. Pajak Dalam Negeri: Anggaran 2024 = 2.146.466.840.000.000 | Realisasi 2024 = 2.157.982.145.917.601 (100,54%) | Realisasi 2023 = 2.089.718.285.003.417
  - 2. Pajak Perdagangan Internasional: Anggaran 2024 = 71.934.260.000.000 | Realisasi 2024 = 73.857.676.962.232 (102,67%) | Realisasi 2023 = 64.489.934.464.413
- II. Pendapatan PNBP: Anggaran TA 2024 = 549.137.450.331.000 | Realisasi TA 2024 = 584.378.057.583.276 (106,42%) | Realisasi TA 2023 = 612.537.298.582.643
  - 1. Pendapatan Sumber Daya Alam: Anggaran 2024 = 235.522.497.376.000 | Realisasi 2024 = 228.928.767.532.781 (97,20%) | Realisasi 2023 = 254.203.031.073.614
  - 2. Pendapatan dari KND (Kekayaan Negara Dipisahkan): Anggaran 2024 = 85.845.465.000.000 | Realisasi 2024 = 86.384.593.538.563 (100,63%) | Realisasi 2023 = 82.058.743.373.870
  - 3. Pendapatan BLU (Badan Layanan Umum): Anggaran 2024 = 80.430.963.536.000 | Realisasi 2024 = 104.716.732.371.421 (130,19%) | Realisasi 2023 = 95.860.392.158.963
  - 4. Pendapatan PNBP Lainnya: Anggaran 2024 = 147.338.524.419.000 | Realisasi 2024 = 164.347.964.140.511 (111,54%) | Realisasi 2023 = 180.415.131.976.196
- III. Pendapatan Hibah: Anggaran TA 2024 = 34.923.600.000.000 | Realisasi TA 2024 = 34.387.363.715.756 (98,46%) | Realisasi TA 2023 = 17.184.158.879.725
- JUMLAH PENDAPATAN NEGARA DAN HIBAH: Anggaran TA 2024 = 2.802.462.150.331.000 | Realisasi TA 2024 = 2.850.605.244.178.865 (101,72%) | Realisasi TA 2023 = 2.783.929.676.930.198 (Sekitar Rp2.850,61 Triliun realisasi)

C.2. BELANJA NEGARA
- I. Belanja Pemerintah Pusat: Anggaran TA 2024 = 2.485.902.580.516.000 | Realisasi TA 2024 = 2.496.223.901.585.884 (100,42%) | Realisasi TA 2023 = 2.239.786.701.499.164
  - 1. Belanja Pegawai: Anggaran 2024 = 484.430.934.181.000 | Realisasi 2024 = 464.859.258.914.201 (95,96%) | Realisasi 2023 = 412.711.324.466.564
  - 2. Belanja Barang: Anggaran 2024 = 406.983.772.758.000 | Realisasi 2024 = 523.368.042.639.998 (128,60%) | Realisasi 2023 = 432.714.969.865.127
  - 3. Belanja Modal: Anggaran 2024 = 247.474.230.827.000 | Realisasi 2024 = 355.511.133.723.811 (143,66%) | Realisasi 2023 = 303.041.293.068.751
  - 4. Belanja Pembayaran Bunga Utang: Anggaran 2024 = 497.319.602.591.000 | Realisasi 2024 = 488.426.422.143.817 (98,21%) | Realisasi 2023 = 439.882.584.341.259
  - 5. Belanja Subsidi: Anggaran 2024 = 285.971.979.124.000 | Realisasi 2024 = 292.692.594.096.846 (102,35%) | Realisasi 2023 = 269.592.086.053.747
  - 6. Belanja Hibah: Anggaran 2024 = 6.579.656.000 | Realisasi 2024 = 278.430.938.953 (4.231,69%) | Realisasi 2023 = 219.140.718.777
  - 7. Belanja Bantuan Sosial (Bansos): Anggaran 2024 = 157.302.981.407.000 | Realisasi 2024 = 154.949.830.442.829 (98,50%) | Realisasi 2023 = 156.601.633.832.214
  - 8. Belanja Lain-lain: Anggaran 2024 = 406.412.499.972.000 | Realisasi 2024 = 216.138.188.685.429 (53,18%) | Realisasi 2023 = 225.023.669.152.725
- II. Transfer ke Daerah (TKD): Anggaran TA 2024 = 857.591.741.378.000 | Realisasi TA 2024 = 863.542.806.482.364 (100,69%) | Realisasi TA 2023 = 881.430.544.208.454
  - 1. Dana Bagi Hasil (DBH): Anggaran 2024 = 143.099.927.456.000 | Realisasi 2024 = 153.174.562.784.262 (107,04%) | Realisasi 2023 = 205.666.564.020.630
  - 2. Dana Alokasi Umum (DAU): Anggaran 2024 = 427.699.303.543.000 | Realisasi 2024 = 429.210.611.278.998 (100,35%) | Realisasi 2023 = 398.029.628.594.542
  - 3. Dana Alokasi Khusus (DAK): Anggaran 2024 = 188.101.019.444.000 | Realisasi 2024 = 183.538.473.113.006 (97,57%) | Realisasi 2023 = 181.357.561.783.241
    - a. DAK Fisik: Anggaran 2024 = 53.822.463.835.000 | Realisasi 2024 = 50.890.077.113.845 (94,55%) | Realisasi 2023 = 50.334.741.347.305
    - b. DAK Non Fisik: Anggaran 2024 = 133.764.611.642.000 | Realisasi 2024 = 130.441.233.738.467 (97,52%) | Realisasi 2023 = 128.081.946.376.309
    - c. Hibah kepada Daerah: Anggaran 2024 = 513.943.967.000 | Realisasi 2024 = 2.207.162.260.694 (429,46%) | Realisasi 2023 = 2.940.874.059.627
  - 4. Dana Otonomi Khusus: Anggaran 2024 = 18.271.490.935.000 | Realisasi 2024 = 18.271.490.935.000 (100,00%) | Realisasi 2023 = 17.241.263.570.000
  - 5. Dana Keistimewaan DIY: Anggaran 2024 = 1.420.000.000.000 | Realisasi 2024 = 1.420.000.000.000 (100,00%) | Realisasi 2023 = 1.372.725.809.224
  - 6. Dana Desa: Anggaran 2024 = 71.000.000.000.000 | Realisasi 2024 = 70.925.927.774.598 (99,90%) | Realisasi 2023 = 69.856.768.617.317
  - 7. Insentif Fiskal: Anggaran 2024 = 8.000.000.000.000 | Realisasi 2024 = 7.001.740.596.500 (87,52%) | Realisasi 2023 = 7.906.031.813.500
- JUMLAH BELANJA NEGARA: Anggaran TA 2024 = 3.343.494.321.894.000 | Realisasi TA 2024 = 3.359.766.708.068.248 (100,49%) | Realisasi TA 2023 = 3.121.217.245.707.618 (Sekitar Rp3.359,77 Triliun realisasi)

C.3. SURPLUS / DEFISIT ANGGARAN
- Surplus (Defisit) Anggaran (A – B): Anggaran TA 2024 = (541.032.171.563.000) | Realisasi TA 2024 = (509.161.463.889.383) (94,11%) | Realisasi TA 2023 = (337.287.568.777.420)
- Rasio Defisit terhadap PDB Nominal 2024: Target APBN (Perpres 206/2024) = -2,37% dari PDB | Realisasi = -2,30% dari PDB (lebih rendah / lebih baik dari target).

C.4. PEMBIAYAAN
- JUMLAH PEMBIAYAAN (Neto): Anggaran TA 2024 = 541.032.171.563.000 | Realisasi TA 2024 = 554.888.579.353.028 (102,56%) | Realisasi TA 2023 = 356.663.747.714.521
  - I. Pembiayaan Dalam Negeri (Neto): Anggaran 2024 = 528.758.369.161.000 | Realisasi 2024 = 462.577.425.084.416 | Realisasi 2023 = 275.463.701.706.796
    - SBN (Surat Berharga Negara) Neto: Anggaran 2024 = 554.655.048.027.000 | Realisasi 2024 = 450.733.252.420.187
    - Penyertaan Modal Negara (PMN) / Dana Investasi Pemerintah: Anggaran 2024 = (151.216.040.000.000) | Realisasi 2024 = (44.332.592.681.665)
    - Dana Pengembangan Pendidikan Nasional (DPPN): Anggaran 2024 = (25.000.000.000.000) | Realisasi 2024 = (15.000.000.000.000)
  - II. Pembiayaan Luar Negeri (Neto): Anggaran 2024 = 12.273.802.402.000 | Realisasi 2024 = 92.311.154.268.612 | Realisasi 2023 = 81.200.046.007.725

C.5. SISA LEBIH / KURANG PEMBIAYAAN ANGGARAN (SiLPA/SiKPA)
- E. SiLPA (SiKPA) = D + C: Realisasi TA 2024 = 45.727.115.463.645 | Realisasi TA 2023 = 19.376.178.937.101

D. LAPORAN PERUBAHAN SALDO ANGGARAN LEBIH (LPSAL) (dalam Rupiah)
- Saldo Anggaran Lebih Awal: Tahun 2024 = 459.497.872.070.698 | Tahun 2023 = 478.957.156.319.401
- Penggunaan SAL sebagai Penerimaan Pembiayaan: Tahun 2024 = (56.381.000.000.000) | Tahun 2023 = (35.000.000.000.000)
- Sisa Lebih/Kurang Pembiayaan Anggaran (SiLPA/SiKPA): Tahun 2024 = 45.727.115.463.645 | Tahun 2023 = 19.376.178.937.101
- Total Penyesuaian SAL: Tahun 2024 = 8.699.287.514.876 | Tahun 2023 = (3.835.463.185.804)
- Saldo Anggaran Lebih Akhir: Tahun 2024 = 457.543.275.049.219 | Tahun 2023 = 459.497.872.070.698 (Sekitar Rp457,54 Triliun di akhir 2024)

E. NERACA (PER 31 DESEMBER 2024 DAN 31 DESEMBER 2023 dalam Rupiah)
- JUMLAH ASET: 31 Des 2024 = 13.692.365.851.510.229 | 31 Des 2023 = 13.072.819.967.849.194 (Total Aset 2024 = Sekitar Rp13.692,36 Triliun)
  - Kas dan Setara Kas: 2024 = 429.668.592.676.299 | 2023 = 430.715.095.759.788
  - Piutang Jangka Pendek (Bersih): 2024 = 174.755.223.244.133 | 2023 = 179.785.295.421.158
  - Persediaan: 2024 = 205.383.693.515.885 | 2023 = 204.183.149.868.940
  - Investasi Jangka Panjang: 2024 = 4.391.554.633.530.362 | 2023 = 4.077.230.147.021.115
  - Aset Tetap (Bersih setelah Akumulasi Penyusutan): 2024 = 7.149.820.030.417.489 | 2023 = 6.964.294.021.049.510
- JUMLAH KEWAJIBAN (Utang/Kewajiban): 31 Des 2024 = 10.269.018.258.241.877 | 31 Des 2023 = 9.536.679.521.496.617 (Total Kewajiban 2024 = Sekitar Rp10.269,02 Triliun)
  - Kewajiban Jangka Pendek: 2024 = 1.328.524.056.593.660
  - Kewajiban Jangka Panjang: 2024 = 8.940.494.201.648.217
- EKUITAS (Aset bersih / modal bersih negara): 31 Des 2024 = 3.423.347.593.268.352 | 31 Des 2023 = 3.536.140.446.352.577 (Sekitar Rp3.423,35 Triliun)

F. LAPORAN OPERASIONAL (LO) (dalam Rupiah)
- JUMLAH PENDAPATAN OPERASIONAL: Tahun 2024 = 3.115.258.961.391.959 | Tahun 2023 = 3.083.373.504.925.747
  - Pendapatan Pajak Penghasilan (PPh): 2024 = 1.038.768.057.988.153
  - Pendapatan Pajak Pertambahan Nilai (PPN): 2024 = 811.437.285.482.573
  - Pendapatan Cukai: 2024 = 224.896.521.710.713
  - Pendapatan Bea Masuk: 2024 = 53.376.144.254.078
  - Pendapatan Bea Keluar: 2024 = 20.676.989.831.040
  - Pendapatan Sumber Daya Alam (SDA): 2024 = 256.629.229.940.936
- JUMLAH BEBAN OPERASIONAL: Tahun 2024 = 3.353.596.949.702.870 | Tahun 2023 = 3.111.670.039.978.198
  - Beban Pegawai: 2024 = 476.500.700.049.411
  - Beban Barang dan Jasa: 2024 = 285.139.851.823.393
  - Beban Pembayaran Kewajiban Utang (Bunga): 2024 = 524.147.192.364.375
  - Beban Subsidi: 2024 = 265.510.751.678.440
  - Beban Transfer ke Daerah: 2024 = 902.646.703.693.172
- SURPLUS/(DEFISIT) LO: Tahun 2024 = (215.659.289.663.223) | Tahun 2023 = 31.626.165.809.863

G. LAPORAN ARUS KAS (Arus Kas Bersih dalam Rupiah)
- Arus Kas Bersih dari Aktivitas Operasi (A): Tahun 2024 = (154.149.780.567.127) | Tahun 2023 = (34.793.236.369.070)
- Arus Kas Bersih dari Aktivitas Investasi (B): Tahun 2024 = (414.403.152.941.181) | Tahun 2023 = (391.624.901.747.838)
- Arus Kas Bersih dari Aktivitas Pendanaan (C): Tahun 2024 = 614.280.048.971.953 | Tahun 2023 = 445.794.317.054.009
- Arus Kas Bersih dari Aktivitas Transitoris (D): Tahun 2024 = 24.391.505.836.682 | Tahun 2023 = 88.761.873.212.786
- Saldo Akhir Kas: 2024 = 629.015.216.812.398 | 2023 = 606.014.272.515.831

H. LAPORAN PERUBAHAN EKUITAS (dalam Rupiah)
- Ekuitas Awal: Tahun 2024 = 3.536.140.446.352.577 | Tahun 2023 = 3.404.893.056.498.959
- Ekuitas Akhir: Tahun 2024 = 3.423.347.593.268.352 | Tahun 2023 = 3.536.140.446.352.577 (Penurunan ekuitas sekitar Rp112,79 Triliun)

I. BELANJA MENURUT FUNGSI (TABEL 9) — Anggaran / Realisasi Belanja Pemerintah Pusat 2024 (triliun Rp)
1. Pelayanan Umum: Pagu = 814,80 | Realisasi = 895,53 (109,91%)
2. Pertahanan: Pagu = 139,10 | Realisasi = 190,27 (136,79%)
3. Ketertiban dan Keamanan: Pagu = 192,80 | Realisasi = 230,13 (119,36%)
4. Ekonomi: Pagu = 671,78 | Realisasi = 546,20 (81,31%)
5. Lingkungan Hidup: Pagu = 14,13 | Realisasi = 14,54 (102,89%)
6. Perumahan dan Fasilitas Umum: Pagu = 41,80 | Realisasi = 48,10 (115,09%)
7. Kesehatan: Pagu = 97,43 | Realisasi = 99,35 (101,97%)
8. Pariwisata dan Budaya: Pagu = 3,40 | Realisasi = 3,90 (114,83%)
9. Agama: Pagu = 11,76 | Realisasi = 12,74 (108,29%)
10. Pendidikan: Pagu = 228,75 | Realisasi = 197,18 (86,20%)
11. Perlindungan Sosial: Pagu = 270,15 | Realisasi = 258,29 (95,61%)
- TOTAL Belanja Pemerintah Pusat: Pagu = 2.485,90 | Realisasi = 2.496,22 (100,42%)

J. RINGKASAN PEMBIAYAAN (TABEL 12) — Realisasi Tahun 2024 (triliun Rp)
- Pembiayaan Utang: APBN 2024 = 566,29 | Realisasi = 558,06 (98,55%)
- Pembiayaan Investasi: APBN 2024 = (176,22) | Realisasi = (59,33) (33,67%)
- Pemberian Pinjaman: APBN 2024 = (0,25) | Realisasi = (0,22) (87,33%)
- Kewajiban Penjaminan: APBN 2024 = (0,82) | Realisasi = (1,46) (177,06%)
- Pembiayaan Lainnya: APBN 2024 = 152,03 | Realisasi = 57,84 (38,04%)
- Total Pembiayaan: Target APBN 2024 = 541,03 | Realisasi = 554,89 (102,56%)
- Posisi Utang Pemerintah per akhir 2024: Rp8.812,90 triliun (Rasio Utang terhadap PDB: 39,81%, naik dari 39,21% pada 2023)

K. RINGKASAN EKSEKUTIF (dalam Triliun Rupiah)
- Pendapatan Negara & Hibah: 2024 Anggaran = 2.802,46 | 2024 Realisasi = 2.850,60 (101,72%) | 2023 Realisasi = 2.783,93
- Belanja Negara: 2024 Anggaran = 3.343,49 | 2024 Realisasi = 3.359,76 (100,49%) | 2023 Realisasi = 3.121,22
  - Belanja Pemerintah Pusat: 2024 Anggaran = 2.485,90 | 2024 Realisasi = 2.496,22 (100,42%) | 2023 Realisasi = 2.239,79
  - Transfer ke Daerah (TKD): 2024 Anggaran = 857,59 | 2024 Realisasi = 863,54 (100,69%) | 2023 Realisasi = 881,43
- Surplus/(Defisit) Anggaran: 2024 Anggaran = (541,03) | 2024 Realisasi = (509,16) (94,11%) | 2023 Realisasi = (337,29)
- Pembiayaan Neto: 2024 Anggaran = 541,03 | 2024 Realisasi = 554,89 (102,56%) | 2023 Realisasi = 356,66
- SiLPA/(SiKPA): 2024 Realisasi = 45,73 | 2023 Realisasi = 19,37
- SAL Akhir: 2024 Realisasi = 457,54 | 2023 Realisasi = 459,50
- Total Aset: 2024 Realisasi = 13.692,36 | 2023 Realisasi = 13.072,80
- Total Kewajiban: 2024 Realisasi = 10.269,02 | 2023 Realisasi = 9.536,68
- Ekuitas: 2024 Realisasi = 3.423,35 | 2023 Realisasi = 3.536,14
- Surplus/(Defisit) LO: 2024 Realisasi = (215,66) | 2023 Realisasi = 31,63
- Saldo Akhir Kas: 2024 Realisasi = 629,02 | 2023 Realisasi = 606,01
- Saldo Akhir Kas & Setara Kas: 2024 Realisasi = 429,67 | 2023 Realisasi = 430,71

Sumber Dokumen Resmi: Laporan Keuangan Pemerintah Pusat (LKPP) Tahun 2024 Audited — disahkan oleh Menteri Keuangan Sri Mulyani Indrawati, Jakarta, 19 Mei 2025. Terdiri atas konsolidasian 86 LKKL dan 1 LKBUN.

ATURAN KETAT LOGIKA DAN FORMAT JAWABAN:
1. JANGAN PERNAH berhalusinasi atau mengarang angka di luar data di atas. Gunakan data detail dari daftar di atas. 
2. JANGAN PERNAH menggunakan emoji jenis apa pun di dalam seluruh jawabanmu. Cukup gunakan teks murni, list, dan pemandu Markdown yang rapi tanpa ikon emoji/gambar kecil apa pun.
3. Jika pengguna memasukkan nominal uang (atau nominal pajak), hitung persentasenya secara proporsional berdasarkan data Belanja Negara tahun 2024 (Total Belanja Negara: Rp3.359.766.708.068.248, i.e. 3.359,77 Trillion Rupiah) untuk memecah ke mana uang tersebut pergi:
   - Transfer ke Daerah (TKD) & Dana Desa: ~25.70% (Dana Desa secara spesifik mengambil bagian ~2.11% dari total belanja)
   - Belanja Barang & Jasa: ~15.58%
   - Belanja Pembayaran Bunga Utang: ~14.54%
   - Belanja Pegawai (Gaji ASN/TNI/Polri): ~13.84%
   - Belanja Modal & Infrastruktur: ~10.58%
   - Belanja Subsidi (Energi & Pupuk): ~8.71%
   - Belanja Bantuan Sosial (Bansos): ~4.61%
   - Belanja Hibah, Perlindungan Sosial lainnya & Belanja Lainnya: sisanya ~6.44%
   Kalikan nominal uang tersebut dengan persentase di atas, tampilkan daftar rupiah pembagiannya dengan sangat tepat, dan berikan penjelasan analogi kreatif Indonesia (seperti sak semen untuk IKN, gas melon melon 3kg, porsi seblak/nasi rames, buku sekolah, kuota belajar mahasiswa, dll.) untuk membantu pemahaman pengguna.
4. Wajib gunakan analogi nyata saat menjelaskan angka yang besar.
5. Jangan pernah memihak tokoh politik atau partai manapun. Tetap objektif, netral, berimbang, dan berwawasan luas.
`;

// Endpoint to fetch calculated percentages directly
app.post("/api/calculate", (req, res) => {
  const { nominal } = req.body;
  if (!nominal || isNaN(nominal) || nominal <= 0) {
    return res.status(400).json({ error: "Nominal harus berupa angka positif" });
  }

  // Exact proportions based on LKPP 2024 Audited (Total Belanja Rp 3.359,76 T)
  const proportions = [
    { key: "tkd", label: "Transfer ke Daerah & Dana Desa", pct: 0.2570, desc: "Pemerataan dana seluruh daerah dan pembangunan desa utama.", color: "--lime" },
    { key: "barang_jasa", label: "Belanja Barang & Jasa", pct: 0.1558, desc: "Aset pelayanan operasional, logistik pemilu, respons El Nino.", color: "--cobalt" },
    { key: "bunga_utang", label: "Pembayaran Bunga Utang", pct: 0.1454, desc: "Pembayaran kewajiban bunga utang negara secara tepat waktu.", color: "--pebble" },
    { key: "pegawai", label: "Belanja Pegawai (ASN, TNI, Polri)", pct: 0.1384, desc: "Gaji dan tunjangan abdi negara untuk kelancaran birokrasi.", color: "--navy-deep" },
    { key: "modal_infra", label: "Infrastruktur & Alutsista", pct: 0.1058, desc: "Pembangunan IKN, jembatan, bandara, pertahanan nasional.", color: "--leaf" },
    { key: "subsidi", label: "Belanja Subsidi (Energi & Pupuk)", pct: 0.0871, desc: "Subsidi BBM, listrik rumah tangga, LPG 3kg, pupuk petani.", color: "--sky-blue" },
    { key: "bansos", label: "Bantuan Sosial (PKH, KIP, Sembako)", pct: 0.0461, desc: "Bantuan pendidikan KIP, sembako keluarga, jaminan kesehatan.", color: "--mint" },
    { key: "lainnya", label: "Belanja Lainnya", pct: 0.0644, desc: "Dana darurat bencana alam, bantuan luar negeri, dan tak terduga.", color: "--mist" }
  ];

  const results = proportions.map(item => {
    const value = Math.round(nominal * item.pct);
    let analogy = "";

    // Generate specific Indonesia creative/gen-z analogies for nominal
    if (item.key === "tkd") {
      analogy = `Setara patungan bikin ${Math.max(1, Math.round(value / 15000))} lampu jalan bertenaga surya di desa-desa terpencil biar malam makin terang dan aman.`;
    } else if (item.key === "barang_jasa") {
      analogy = `Sama dengan patungan nyediain sekitar ${Math.max(1, Math.round(value / 5000))} lembar kertas surat suara pemilu biar pesta demokrasi tetap sah!`;
    } else if (item.key === "bunga_utang") {
      analogy = `Uang ini dipakai menjaga kredibilitas kas negara di mata investor global biar investasi asing tetap ramai masuk ke tanah air.`;
    } else if (item.key === "pegawai") {
      analogy = `Bagian kamu untuk bantu bayar operasional seharian petugas polisi, pemadam kebakaran, dan guru honorer di lingkungan sekitar.`;
    } else if (item.key === "modal_infra") {
      analogy = `Setara dengan nyumbang sekitar ${Math.max(1, Math.round(value / 80000))} sak semen untuk pondasi kokoh bangunan IKN atau jembatan penghubung ekonomi antardesa.`;
    } else if (item.key === "subsidi") {
      analogy = `Setara menyubsidi ${Math.max(1, Math.round(value / 18000))} tabung gas LPG 3 kg (gas melon) buat usaha warteg langgananmu agar harga seblak & nasi rames tetap bersahabat.`;
    } else if (item.key === "bansos") {
      analogy = `Setara nambahin kuota belajar internet selama sebulan untuk ${Math.max(1, Math.round(value / 50000))} anak penerima KIP Kuliah biar mereka ga fomo tugas kampus!`;
    } else {
      analogy = `Dialokasikan untuk dana cadangan kalau ada musibah bencana alam tak terduga agar negara langsung sigap bantu kerugian warga.`;
    }

    return {
      ...item,
      allocatedValue: value,
      analogy
    };
  });

  res.json({ nominal, results });
});

// Chat endpoint with state LKPP 2024 system instructions
app.post("/api/chat", async (req, res) => {
  const { prompt, history } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required and must be a string." });
  }

  try {
    // Format history in Gemini 3.5 format for chats
    // The @google/genai SDK chats use a simple format, let's look at the instructions:
    // const chat = ai.chats.create({ model: "gemini-3.5-flash", config: { systemInstruction: ... } });
    // let response = await chat.sendMessage({ message: ... });
    
    // We can use ai.chats or generateContent with history. Let's build the chat history manually for absolute reliability
    const contents: any[] = [];
    
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
      },
    });

    const answer = response.text || "Wah, maaf sepertinya ada sedikit kendala koneksi dengan otakku. Coba lagi yah!";
    res.json({ text: answer });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "Yah, ada error saat menghubungkan ke asisten APBN. Pastikan API Key di Secrets sudah terisi!",
      details: error.message
    });
  }
});

// Serve frontend application
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Kepoin APBN Express server is running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
