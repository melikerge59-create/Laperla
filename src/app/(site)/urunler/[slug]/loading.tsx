export default function ProductDetailLoading() {
  return (
    <section className="section white" style={{ paddingTop: 36 }}>
      <div className="lp-container">
        <p style={{ marginBottom: 16, height: 18, width: 140, borderRadius: 8, background: "rgba(245, 224, 224, 0.45)" }} />
        <div className="contact">
          <div
            className="panel"
            style={{
              padding: 0,
              minHeight: 420,
              background: "linear-gradient(180deg, rgba(255,250,250,0.95) 0%, rgba(245, 224, 224, 0.35) 100%)",
            }}
          />
          <div className="panel" style={{ minHeight: 320 }}>
            <div style={{ height: 14, width: 100, borderRadius: 8, background: "rgba(245, 224, 224, 0.5)", marginBottom: 12 }} />
            <div style={{ height: 36, width: "75%", borderRadius: 8, background: "rgba(245, 224, 224, 0.4)" }} />
            <div style={{ marginTop: 16, height: 72, borderRadius: 12, background: "rgba(245, 224, 224, 0.35)" }} />
            <div style={{ marginTop: 20, height: 28, width: 120, borderRadius: 8, background: "rgba(245, 224, 224, 0.45)" }} />
            <div style={{ marginTop: 24, height: 48, borderRadius: 14, background: "rgba(183, 142, 75, 0.2)" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
