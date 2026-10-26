import type { CSSProperties } from "react";
import Image from "next/image";
import CaveScene from "../components/CaveScene";
import { Reveal, ScrollProgress, Tilt } from "../components/Motion";

const PHONE = "+918091484748";
const PHONE_LABEL = "080914 84748";
const MAPS_QUERY = "Meraki The Culinary Art Space, Kotwali Bazar Rd, Dharamshala";
const DIRECTIONS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAPS_QUERY)}`;
const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(MAPS_QUERY)}&output=embed`;

const DISHES = [
  { img: "momos.webp", tag: "Signature", name: "Momos", note: "Hand-folded, steamed or fried, the reason most guests come back." },
  { img: "pizza.webp", tag: "Guest favourite", name: "Pizza", note: "Crisp-edged and generously topped, one of the most-praised plates." },
  { img: "pasta.webp", tag: "Continental", name: "Pasta", note: "Creamy, saucy, made to order for slow evenings in the cave." },
  { img: "momos-plate.webp", tag: "Himalayan", name: "Thukpa & more", note: "Warming Himalayan bowls for cold Dharamshala nights." },
  { img: "papad.webp", tag: "To share", name: "Small plates", note: "Crunchy starters to pass around the table." },
  { img: "cocktails.webp", tag: "Bar", name: "Mocktails", note: "Bright, fruity pours, from citrus coolers to pineapple tiki." },
];

const RING = [
  "hall.webp",
  "cave-interior.webp",
  "bougainvillea-arch.webp",
  "table.webp",
  "cocktails.webp",
  "cave-door.webp",
  "pizza.webp",
  "momos.webp",
];

export default function Home() {
  return (
    <main>
      <div className="cave-fallback" />
      <CaveScene />
      <nav className="nav">
        <a href="#top" className="serif" style={{ fontSize: "1.7rem", fontStyle: "italic" }}>
          Meraki
        </a>
        <div className="nav-links">
          <a href="#story">The Cave</a>
          <a href="#menu">Menu</a>
          <a href="#gallery">Gallery</a>
          <a href="#visit">Visit</a>
        </div>
        <a href={`tel:${PHONE}`} className="btn btn-ghost" style={{ padding: "10px 20px" }}>
          Reserve
        </a>
      </nav>

      {/* Hero: scroll flies the camera deeper into a 3D cave */}
      <section id="top" className="hero" data-cave>
        <div className="hero-stage">
          <div className="hero-copy">
            <span className="eyebrow">Dharamshala · Fine dining</span>
            <h1 className="hero-title">Meraki</h1>
            <p className="hero-sub serif" style={{ fontStyle: "italic" }}>
              The Culinary Art Space
            </p>
            <div className="hero-actions">
              <a href={`tel:${PHONE}`} className="btn btn-bloom">
                Book a table
              </a>
              <a href="#menu" className="btn btn-ghost">
                Explore the menu
              </a>
            </div>
          </div>
          <div className="hero-second">
            <p>
              Carved stone, <em>bougainvillea</em> and lamplight. Dinner, deep in the cave.
            </p>
          </div>
          <div className="scroll-cue">Scroll to enter</div>
        </div>
      </section>

      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {[0, 1].map((k) =>
            ["Momos", "Thukpa", "Pizza", "Pasta", "Mocktails", "Cave dining", "Dharamshala"].map((w) => (
              <span key={`${k}-${w}`}>{w}</span>
            )),
          )}
        </div>
      </div>

      {/* Story */}
      <section id="story" className="section">
        <div className="wrap story">
          <div>
            <Reveal>
              <span className="eyebrow">Meraki (n.): to do something with soul</span>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="h2" style={{ marginTop: 18 }}>
                A cave in the <em>middle of town.</em>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="lede" style={{ marginTop: 26 }}>
                Step off Kotwali Bazar, near Fountain Chowk, and through a door framed in bougainvillea. Inside,
                hand-sculpted stone ceilings, rattan lamps and pampas walls glow warm amber. It is a quiet room for
                momos, thukpa and wood-fired pizza, served by a team guests describe as polite, friendly and attentive.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="stats">
                <div className="stat">
                  <b>4.7★</b>
                  <span>481 Google reviews</span>
                </div>
                <div className="stat">
                  <b>₹400+</b>
                  <span>₹400–1,600 per person</span>
                </div>
                <div className="stat">
                  <b>11 pm</b>
                  <span>Open late</span>
                </div>
              </div>
            </Reveal>
          </div>
          <Reveal delay={150}>
            <div className="stack">
              <div className="stack-card a">
                <Image src="/photos/cave-door.webp" alt="Bougainvillea framing Meraki's cave door" fill sizes="(max-width: 860px) 80vw, 40vw" style={{ objectFit: "cover" }} />
              </div>
              <div className="stack-card b">
                <Image src="/photos/bougainvillea-arch.webp" alt="Carved stone arch with bougainvillea" fill sizes="(max-width: 860px) 70vw, 35vw" style={{ objectFit: "cover" }} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">From the kitchen</span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="h2" style={{ marginTop: 18, maxWidth: "14ch" }}>
              Plates people <em>write about.</em>
            </h2>
          </Reveal>
          <div className="menu-grid">
            {DISHES.map((d, i) => (
              <Reveal key={d.name} delay={(i % 3) * 120}>
                <Tilt>
                  <Image src={`/photos/${d.img}`} alt={d.name} fill sizes="(max-width: 560px) 92vw, (max-width: 960px) 46vw, 380px" style={{ objectFit: "cover" }} />
                  <span className="dish-tag">{d.tag}</span>
                  <div className="dish-meta">
                    <h3>{d.name}</h3>
                    <p>{d.note}</p>
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div style={{ marginTop: 44, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="https://merakidharamshala.com" target="_blank" rel="noreferrer" className="btn btn-ghost">
                See the full menu ↗
              </a>
              <a href={`tel:${PHONE}`} className="btn btn-bloom">
                Order: dine-in · takeaway · delivery
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3D ring gallery, rotates with scroll */}
      <div id="gallery">
        <ScrollProgress className="ring-section">
          <div className="ring-stage">
            <div className="ring-head">
              <span className="eyebrow">Inside Meraki</span>
              <h2 className="h2" style={{ marginTop: 12, fontSize: "clamp(2.2rem, 5vw, 4rem)" }}>
                Take a <em>walk around.</em>
              </h2>
            </div>
            <div className="ring-floor" />
            <div className="ring">
              {RING.map((img, i) => (
                <div key={img} className="ring-item" style={{ "--i": i } as CSSProperties}>
                  <Image src={`/photos/${img}`} alt="" fill sizes="(max-width: 760px) 130px, 270px" style={{ objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>
        </ScrollProgress>
      </div>

      {/* What guests say (from the Google review summary) */}
      <section className="section">
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">4.7 out of 5 · 481 reviews on Google</span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="h2" style={{ marginTop: 18, maxWidth: "16ch" }}>
              What guests <em>keep saying.</em>
            </h2>
          </Reveal>
          <div className="praise">
            {[
              ["01", "The food", "Pizza, momos and thukpa come up again and again, along with a wide multi-cuisine menu."],
              ["02", "The ambiance", "Beautiful, cozy and aesthetic. The cave theme makes the room itself part of the meal."],
              ["03", "The people", "Staff are praised as polite, friendly and attentive, with service that feels personal."],
            ].map(([n, h, p], i) => (
              <Reveal key={n} delay={i * 120}>
                <div className="praise-card">
                  <div className="num">{n}</div>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" className="section" style={{ paddingTop: 0 }}>
        <div className="wrap visit">
          <div>
            <Reveal>
              <span className="eyebrow">Find the cave</span>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="h2" style={{ marginTop: 18 }}>
                Come <em>hungry.</em>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <dl className="info-list">
                <div>
                  <dt>Address</dt>
                  <dd>
                    Kotwali Bazar Rd, near Fountain Chowk,
                    <br />
                    Sudher, Dharamshala, Himachal Pradesh 176215
                  </dd>
                </div>
                <div>
                  <dt>Hours</dt>
                  <dd>Open today · closes 11 pm</dd>
                </div>
                <div>
                  <dt>Reservations</dt>
                  <dd>
                    <a href={`tel:${PHONE}`}>{PHONE_LABEL}</a>
                  </dd>
                </div>
                <div>
                  <dt>Service</dt>
                  <dd className="chips">
                    <span>Dine-in</span>
                    <span>Takeaway</span>
                    <span>Delivery</span>
                    <span>LGBTQ+ friendly</span>
                  </dd>
                </div>
              </dl>
            </Reveal>
            <Reveal delay={300}>
              <div style={{ marginTop: 36, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href={DIRECTIONS} target="_blank" rel="noreferrer" className="btn btn-bloom">
                  Get directions
                </a>
                <a href={`tel:${PHONE}`} className="btn btn-ghost">
                  Call now
                </a>
              </div>
            </Reveal>
          </div>
          <Reveal delay={150} className="map">
            <iframe src={MAP_EMBED} title="Meraki on Google Maps" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </Reveal>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap" style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <span className="serif" style={{ fontSize: "1.6rem", fontStyle: "italic", color: "var(--stone)" }}>
            Meraki
          </span>
          <span>The Culinary Art Space · Dharamshala · Concept website demo</span>
        </div>
      </footer>

      <div className="mobile-bar">
        <a href={`tel:${PHONE}`} className="btn btn-bloom">
          Call
        </a>
        <a href={DIRECTIONS} target="_blank" rel="noreferrer" className="btn btn-ghost">
          Directions
        </a>
      </div>
    </main>
  );
}
