import { HERO_STATS } from '../utils/constants'
import BreedExplorer from './BreedExplorer'

export default function Home() {
  return (
    <>
    <section className="hero">
      <div className="hero-image" role="img" aria-label="Cattle grazing on a green hillside at golden hour" />
      <div className="hero-overlay" />

      <div className="hero-content">
        <span className="eyebrow">AI-Powered Livestock Intelligence</span>

       <h1 className="hero-title">
  Smarter Livestock Starts with
  <br />
  <span className="hero-title-accent">Better Understanding.</span>
</h1>

        <p className="hero-subtitle">
          BreedDex helps identify, explore, and understand cattle and buffalo breeds using
          AI-powered livestock intelligence.
        </p>

        <div className="hero-actions">
          <a href="#explore" className="btn btn-primary">
            Explore Breeds <span aria-hidden="true">→</span>
          </a>
        <a href="/marketplace" className="btn btn-secondary">
            Explore TradeHub <span aria-hidden="true">→</span>
          </a>
        </div>

        <dl className="hero-stats">
          {HERO_STATS.map((stat) => (
            <div className="hero-stat" key={stat.label}>
              <dt>{stat.value}</dt>
              <dd>
                {stat.label}
                {stat.sublabel && <span className="hero-stat-sub">{stat.sublabel}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="scroll-indicator">
        <span className="scroll-line" />
        <span>Scroll to Explore</span>
      </div>
    </section>

    <BreedExplorer />
    </>
  )
}
