export interface PriceRow {
  year: number;
  week: number;
  publication_date: string;
  producto: string;
  variety: string;
  quality: string;
  size: string;
  sale_format: string;
  unit: string;
  price: number | null;
}

export interface ProductStats {
  producto: string;
  unit: string;
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
}
