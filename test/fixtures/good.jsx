export function Hero({ label }) {
  return (
    <section className="bg-stone-50 motion-safe:transition-colors">
      <h1 className="text-3xl font-semibold">Send invoices in two clicks</h1>
      <h2 className="text-lg">How it works</h2>
      <img src="/a.png" alt="Invoice editor" width={800} height={500} />
      <button aria-label="Search" className="rounded-md focus-visible:ring-2"><Icon /></button>
      <label htmlFor="q">Query</label>
      <input id="q" />
      <p>{label}</p>
    </section>
  );
}
