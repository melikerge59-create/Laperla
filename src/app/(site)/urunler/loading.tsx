export default function ProductsLoading() {
  return (
    <section className="section white" style={{ paddingTop: 36 }}>
      <div className="lp-container">
        <div className="section-head">
          <span className="tag">✦ Katalog</span>
          <h2>
            Tüm <em>Ürünler</em>
          </h2>
          <div className="divider" />
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
          <div style={{ height: 40, width: "100%", maxWidth: 360, borderRadius: 14, background: "rgba(245, 224, 224, 0.4)" }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: 36, width: 72, borderRadius: 999, background: "rgba(245, 224, 224, 0.45)" }} />
          ))}
        </div>
        <div className="grid-products">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="card"
              style={{
                pointerEvents: "none",
                background: "rgba(255,250,250,0.6)",
                borderColor: "rgba(245, 224, 224, 0.6)",
              }}
            >
              <div className="thumb" style={{ background: "rgba(245, 224, 224, 0.35)", minHeight: 200 }} />
              <div className="card-body">
                <div style={{ height: 12, width: 80, borderRadius: 8, background: "rgba(245, 224, 224, 0.5)" }} />
                <div style={{ marginTop: 10, height: 22, width: "85%", borderRadius: 8, background: "rgba(245, 224, 224, 0.4)" }} />
                <div style={{ marginTop: 8, height: 40, borderRadius: 8, background: "rgba(245, 224, 224, 0.3)" }} />
                <div style={{ marginTop: 14, height: 24, width: 100, borderRadius: 8, background: "rgba(183, 142, 75, 0.2)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
