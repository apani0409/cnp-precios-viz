import { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";
import type { PriceRow } from "./types";
import {
  computeStats,
  downloadCsv,
  formatColones,
  loadPrices,
  toCsv,
  uniqueProducts,
} from "./dataUtils";
import "./App.css";

const DEFAULT_PRODUCTS = ["aguacate Hass", "banano criollo", "brócoli"];

function App() {
  const [rows, setRows] = useState<PriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(DEFAULT_PRODUCTS);
  const [startDate, setStartDate] = useState("2021-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");

  useEffect(() => {
    loadPrices()
      .then((data) => {
        setRows(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  const allProducts = useMemo(() => uniqueProducts(rows), [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter(
      (r) =>
        selectedProducts.includes(r.producto) &&
        r.price !== null &&
        r.publication_date >= startDate &&
        r.publication_date <= endDate
    );
  }, [rows, selectedProducts, startDate, endDate]);

  const stats = useMemo(
    () => computeStats(filteredRows, selectedProducts),
    [filteredRows, selectedProducts]
  );

  const traces = useMemo(() => {
    return selectedProducts.map((producto) => {
      const productRows = filteredRows
        .filter((r) => r.producto === producto)
        .sort((a, b) => a.publication_date.localeCompare(b.publication_date));
      return {
        x: productRows.map((r) => r.publication_date),
        y: productRows.map((r) => r.price),
        type: "scatter" as const,
        mode: "lines+markers" as const,
        name: producto,
        line: { width: 2 },
        marker: { size: 4 },
      };
    });
  }, [filteredRows, selectedProducts]);

  const toggleProduct = (producto: string) => {
    setSelectedProducts((prev) =>
      prev.includes(producto) ? prev.filter((p) => p !== producto) : [...prev, producto]
    );
  };

  if (loading) return <div className="status">Cargando datos del CNP...</div>;
  if (error) return <div className="status error">Error cargando datos: {error}</div>;

  return (
    <div className="app">
      <header>
        <h1>Precios Agrícolas del CNP — Costa Rica</h1>
        <p className="subtitle">
          9,184 registros semanales · 56 productos · 2021&ndash;2024 · Consejo Nacional de
          Producción
        </p>
      </header>

      <section className="controls">
        <div className="control-group">
          <label>Rango de fechas</label>
          <div className="date-range">
            <input
              type="date"
              value={startDate}
              min="2021-01-08"
              max="2024-09-06"
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>a</span>
            <input
              type="date"
              value={endDate}
              min="2021-01-08"
              max="2024-09-06"
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="control-group">
          <label>Productos ({selectedProducts.length} seleccionados)</label>
          <div className="product-chips">
            {allProducts.map((p) => (
              <button
                key={p}
                className={`chip ${selectedProducts.includes(p) ? "active" : ""}`}
                onClick={() => toggleProduct(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="chart-section">
        {traces.length > 0 ? (
          <Plot
            data={traces}
            layout={{
              autosize: true,
              height: 480,
              margin: { l: 60, r: 20, t: 20, b: 50 },
              xaxis: { title: { text: "Fecha de publicación" } },
              yaxis: { title: { text: "Precio (₡)" } },
              legend: { orientation: "h", y: -0.2 },
              hovermode: "x unified",
            }}
            useResizeHandler
            style={{ width: "100%" }}
            config={{ displayModeBar: true, displaylogo: false }}
          />
        ) : (
          <div className="status">Selecciona al menos un producto para graficar.</div>
        )}
      </section>

      <section className="stats-section">
        <div className="stats-header">
          <h2>Estadísticas por producto</h2>
          <button
            className="download-btn"
            onClick={() => downloadCsv("cnp_precios_filtrado.csv", toCsv(filteredRows))}
            disabled={filteredRows.length === 0}
          >
            Descargar CSV filtrado
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Unidad</th>
              <th>Registros</th>
              <th>Media</th>
              <th>Mediana</th>
              <th>Mínimo</th>
              <th>Máximo</th>
              <th>Desv. Est.</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.producto}>
                <td>{s.producto}</td>
                <td>{s.unit}</td>
                <td>{s.count}</td>
                <td>{formatColones(s.mean)}</td>
                <td>{formatColones(s.median)}</td>
                <td>{formatColones(s.min)}</td>
                <td>{formatColones(s.max)}</td>
                <td>{formatColones(s.stdDev)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer>
        <p>
          Datos: Consejo Nacional de Producción (CNP), Costa Rica. Visualización construida con
          React, TypeScript y Plotly.js.{" "}
          <a href="https://github.com/apani0409/cnp-precios-viz" target="_blank" rel="noreferrer">
            Código fuente
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
