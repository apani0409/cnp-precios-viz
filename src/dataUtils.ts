import Papa from "papaparse";
import type { PriceRow, ProductStats } from "./types";

export async function loadPrices(): Promise<PriceRow[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}raw_prices.csv`);
  const text = await res.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data.map((r) => ({
    year: Number(r.year),
    week: Number(r.week),
    publication_date: r.publication_date,
    producto: r.NOMBRE,
    variety: r.variety,
    quality: r.quality,
    size: r.size,
    sale_format: r.sale_format,
    unit: r.unit,
    price: r.price === "" || r.price === undefined ? null : Number(r.price),
  }));
}

export function uniqueProducts(rows: PriceRow[]): string[] {
  return Array.from(new Set(rows.map((r) => r.producto))).sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

function quantile(sorted: number[], q: number): number {
  const pos = q * (sorted.length - 1);
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

export function computeStats(rows: PriceRow[], products: string[]): ProductStats[] {
  return products.map((producto) => {
    const productRows = rows.filter((r) => r.producto === producto && r.price !== null);
    const prices = productRows.map((r) => r.price as number).sort((a, b) => a - b);
    const unit = productRows[0]?.unit ?? "";
    const count = prices.length;
    if (count === 0) {
      return { producto, unit, count: 0, mean: 0, median: 0, min: 0, max: 0, stdDev: 0 };
    }
    const mean = prices.reduce((a, b) => a + b, 0) / count;
    const variance = prices.reduce((a, b) => a + (b - mean) ** 2, 0) / count;
    return {
      producto,
      unit,
      count,
      mean,
      median: quantile(prices, 0.5),
      min: prices[0],
      max: prices[count - 1],
      stdDev: Math.sqrt(variance),
    };
  });
}

export function toCsv(rows: PriceRow[]): string {
  const header = "year,week,publication_date,producto,variety,quality,size,sale_format,unit,price";
  const lines = rows.map((r) =>
    [
      r.year,
      r.week,
      r.publication_date,
      r.producto,
      r.variety,
      r.quality,
      r.size,
      r.sale_format,
      r.unit,
      r.price ?? "",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header, ...lines].join("\n");
}

export function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const fmt = new Intl.NumberFormat("es-CR", { maximumFractionDigits: 0 });
export function formatColones(n: number): string {
  return `₡${fmt.format(n)}`;
}
