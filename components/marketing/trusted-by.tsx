const brands = [
  "Northwind",
  "Cohort Labs",
  "Paytm",
  "Stellaris",
  "Monograph",
  "Lattice",
  "Kestrel",
]

export function TrustedBy() {
  return (
    <section
      className="relative border-y border-border bg-surface/40"
      aria-label="Trusted by leading teams"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-7 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
          Trusted by teams hiring faster
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12">
          {brands.map((b) => (
            <li
              key={b}
              className="font-serif text-lg font-medium text-text-muted/80 transition-colors hover:text-text-secondary sm:text-xl"
            >
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
