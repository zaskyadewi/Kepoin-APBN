import { AllocationResult } from "./types";

export interface ProportionItem {
  key: string;
  label: string;
  pct: number;
  desc: string;
  color: string;
}

export const PROPORTIONS: ProportionItem[] = [
  { key: "tkd", label: "Transfer ke Daerah & Dana Desa", pct: 0.2570, desc: "Pemerataan dana seluruh daerah dan pembangunan desa utama.", color: "--lime" },
  { key: "barang_jasa", label: "Belanja Barang & Jasa", pct: 0.1558, desc: "Aset pelayanan operasional, logistik pemilu, respons El Nino.", color: "--cobalt" },
  { key: "bunga_utang", label: "Pembayaran Bunga Utang", pct: 0.1454, desc: "Pembayaran kewajiban bunga utang negara secara tepat waktu.", color: "--pebble" },
  { key: "pegawai", label: "Belanja Pegawai (ASN, TNI, Polri)", pct: 0.1384, desc: "Gaji dan tunjangan abdi negara untuk kelancaran birokrasi.", color: "--navy-deep" },
  { key: "modal_infra", label: "Infrastruktur & Alutsista", pct: 0.1058, desc: "Pembangunan IKN, jembatan, bandara, pertahanan nasional.", color: "--leaf" },
  { key: "subsidi", label: "Belanja Subsidi (Energi & Pupuk)", pct: 0.0871, desc: "Subsidi BBM, listrik rumah tangga, LPG 3kg, pupuk petani.", color: "--sky-blue" },
  { key: "bansos", label: "Bantuan Sosial (PKH, KIP, Sembako)", pct: 0.0461, desc: "Bantuan pendidikan KIP, sembako keluarga, jaminan kesehatan.", color: "--mint" },
  { key: "lainnya", label: "Belanja Lainnya", pct: 0.0644, desc: "Dana darurat bencana alam, bantuan luar negeri, dan tak terduga.", color: "--mist" }
];

export function calculateAllocation(nominal: number): AllocationResult[] {
  if (!nominal || isNaN(nominal) || nominal <= 0) return [];

  return PROPORTIONS.map(item => {
    const value = Math.round(nominal * item.pct);
    let analogy = "";

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
      key: item.key,
      label: item.label,
      pct: item.pct,
      desc: item.desc,
      color: item.color,
      allocatedValue: value,
      analogy
    };
  });
}
