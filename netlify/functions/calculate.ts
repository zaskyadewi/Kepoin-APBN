import { calculateAllocation } from "../../src/calculations";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await req.json();
    const { nominal } = body;

    if (!nominal || isNaN(nominal) || nominal <= 0) {
      return new Response(JSON.stringify({ error: "Nominal harus berupa angka positif" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const results = calculateAllocation(nominal);
    return new Response(JSON.stringify({ nominal, results }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Gagal menghitung alokasi anggaran", details: error?.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
