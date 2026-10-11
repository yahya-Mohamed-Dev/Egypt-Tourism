import { useEffect, useRef, useState } from "react";
import ScrollReveal from "scrollreveal";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Compass, Menu, Search, X } from "lucide-react";
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { destinations, experiences, slides } from "./data.js";

const navLinks = [
  ["About Egypt", "/about"],
  ["Destinations", "/destinations"],
  ["Experiences", "/experiences"],
  ["Plan your trip", "/plan"],
];

function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Egypt home">
      <span className="brand-mark" aria-hidden="true">☥</span>
      <span><em>Egypt</em></span>
    </Link>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const results = query.trim()
    ? destinations.filter((place) => place.title.toLowerCase().includes(query.trim().toLowerCase()))
    : destinations.slice(0, 3);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function openDestination(place) {
    navigate(`/destinations/${place.slug}`);
    setSearchOpen(false);
    setMenuOpen(false);
    setQuery("");
  }

  function submitSearch(event) {
    event.preventDefault();
    if (results[0]) openDestination(results[0]);
    else navigate("/destinations");
  }

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Brand />
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          {navLinks.map(([label, path]) => (
            <Link key={path} to={path} onClick={() => setMenuOpen(false)}>{label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <button
            type="button"
            className="search-toggle"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label={searchOpen ? "Close search" : "Search destinations"}
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X size={17} /> : <><span>Search</span><Search size={16} /></>}
          </button>
          <button
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {searchOpen && (
          <form className="search-box" onSubmit={submitSearch}>
            <label className="sr-only" htmlFor="site-search">Search destinations</label>
            <div className="search-input-wrap">
              <Search size={18} aria-hidden="true" />
              <input
                ref={searchRef}
                id="site-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try Cairo, Luxor, Red Sea…"
              />
            </div>
            <p className="search-label">{query.trim() ? "Matching places" : "Popular places"}</p>
            <div className="search-results">
              {results.length ? results.map((place) => (
                <button type="button" key={place.slug} onClick={() => openDestination(place)}>
                  <span>{place.title}<small>{place.subtitle}</small></span><ArrowUpRight size={16} />
                </button>
              )) : <p className="search-empty">No matches yet. Try “Cairo” or “Aswan”.</p>}
            </div>
          </form>
        )}
      </div>
    </header>
  );
}

function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = slides[active];

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [paused]);

  function changeSlide(step) {
    setActive((current) => (current + step + slides.length) % slides.length);
  }

  return (
    <section
      className="hero"
      id="home"
      aria-label="Welcome to Egypt"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <img key={slide.image} className="hero-photo animate__animated animate__fadeIn" src={slide.image} alt="" fetchPriority="high" />
      <div key={slide.caption} className="hero-content animate__animated animate__fadeInUp">
        <p className="eyebrow">{slide.eyebrow}</p>
        <h1>{slide.title}</h1>
        <p className="hero-copy">{slide.text}</p>
        <Link to="/destinations" className="button-gold">Start exploring <ArrowRight size={17} /></Link>
      </div>
      <div className="hero-bottom">
        <span className="hero-caption">{slide.caption}</span>
        <div className="hero-controls">
          <div className="hero-dots" aria-label="Choose a slide">
            {slides.map((item, index) => (
              <button
                key={item.caption}
                type="button"
                className={`hero-dot ${active === index ? "is-active" : ""}`}
                onClick={() => setActive(index)}
                aria-label={`Show slide ${index + 1}`}
                aria-current={active === index ? "true" : undefined}
              />
            ))}
          </div>
          <span aria-live="polite">{String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => changeSlide(-1)} aria-label="Previous slide"><ArrowLeft size={19} /></button>
          <button type="button" onClick={() => changeSlide(1)} aria-label="Next slide"><ArrowRight size={19} /></button>
        </div>
      </div>
    </section>
  );
}

function PageBanner({ eyebrow, title, text, image }) {
  return (
    <section className="page-banner" style={{ "--banner-image": `url("${image}")` }}>
      <div className="container page-banner-content">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
    </section>
  );
}

function DestinationCards({ featured = false }) {
  const places = featured ? destinations.slice(0, 3) : destinations;
  return (
    <div className="destination-grid">
      {places.map((place) => (
        <Link
          className="destination-card reveal"
          key={place.slug}
          to={`/destinations/${place.slug}`}
          aria-label={`Discover ${place.title}`}
        >
          <img src={place.image} alt="" loading="lazy" />
          <span className="destination-arrow" aria-hidden="true"><ArrowUpRight size={17} /></span>
          <span className="destination-info">
            <span>{place.subtitle}</span>
            <span className="destination-title">{place.title}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

function DestinationSection({ featured = false }) {
  return (
    <section className="section destination-section">
      <div className="container">
        <div className={`section-heading ${featured ? "reveal" : ""}`}>
          <div>
            <p className="section-kicker">Somewhere for every kind of curious</p>
            <h2 className="section-title">{featured ? "Find your place in Egypt." : "A country of many worlds."}</h2>
          </div>
          {featured && <Link className="text-link" to="/destinations">All destinations <ArrowRight size={16} /></Link>}
        </div>
        <DestinationCards featured={featured} />
      </div>
    </section>
  );
}

function ExperienceCards() {
  return (
    <div className="experience-grid">
      {experiences.map(([number, title, text]) => (
        <article className="experience-card reveal" key={number}>
          <span className="number">{number} / EXPERIENCE</span>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}

function ExperiencesSection({ featured = false }) {
  return (
    <section className="section experience-section">
      <div className="container">
        <div className={featured ? "reveal" : undefined}>
          <p className="section-kicker">Go beyond the expected</p>
          <h2 className="section-title">{featured ? <>The best stories happen<br />when you look closer.</> : "Choose your own kind of wonder."}</h2>
          <p className="section-lead">A destination of contrasts, connected by a warmth you’ll remember long after you return.</p>
        </div>
        <ExperienceCards />
        {featured && <Link className="button-gold experience-more" to="/experiences">Explore all experiences <ArrowRight size={17} /></Link>}
      </div>
    </section>
  );
}

function Newsletter({ featured = false }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function subscribe(event) {
    event.preventDefault();
    setMessage("You’re on the list. Look out for a little inspiration soon!");
    setEmail("");
  }

  return (
    <section className="newsletter">
      <div className={`container ${featured ? "reveal" : ""}`}>
        <h2>A little Egypt in your inbox.</h2>
        <p>Get thoughtful travel ideas, seasonal inspiration and stories from across the country.</p>
        <form className="newsletter-form" onSubmit={subscribe}>
          <label className="sr-only" htmlFor="newsletter-email">Your email address</label>
          <input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" required />
          <button type="submit">Sign me up</button>
        </form>
        <p className="form-message" role="status" aria-live="polite">{message}</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Brand />
            <p className="footer-note">Ancient stories, generous hospitality and a thousand ways to see the extraordinary.</p>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            {navLinks.map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}
            <Link to="/inspiration">Get inspired</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Egypt travel inspiration</span>
          <Link to="/">Back to home ↑</Link>
        </div>
      </div>
    </footer>
  );
}

function HomePage() {
  return (
    <>
      <Hero />
      <section className="section intro">
        <div className="container reveal">
          <p className="section-kicker">A place that stays with you</p>
          <h2 className="section-title">The land where stories begin.</h2>
          <p className="section-lead">In Egypt, the past and present share the same horizon. Follow the Nile, wander through living cities, and find your own kind of wonder.</p>
        </div>
      </section>
      <DestinationSection featured />
      <ExperiencesSection featured />
      <section className="planner">
        <img className="planner-image reveal" src="https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=1200&q=85" alt="Ancient stone monuments in Egypt" loading="lazy" />
        <div className="planner-content reveal">
          <p className="section-kicker">Your trip, your rhythm</p>
          <h2 className="section-title">Make it yours.</h2>
          <p>Whether you have a long weekend or a little longer, begin with what inspires you and build a journey that feels like your own.</p>
          <Link to="/plan" className="button-gold">Plan your trip <ArrowRight size={17} /></Link>
        </div>
      </section>
      <Newsletter featured />
    </>
  );
}

function AboutPage() {
  return (
    <>
      <PageBanner
        eyebrow="Welcome to Egypt"
        title="The land where stories begin."
        text="A place shaped by a great river, remarkable histories and a spirit of welcome that reaches across generations."
        image={slides[1].image}
      />
      <section className="section">
        <div className="container about-content">
          <p className="section-kicker">A country that stays with you</p>
          <h2 className="section-title">Ancient roots. A living, breathing present.</h2>
          <p className="section-lead">Egypt is more than a collection of extraordinary monuments. It is a place of vibrant cities, quiet river journeys, generous tables and traditions that continue to evolve.</p>
          <div className="about-links">
            <Link className="button-gold" to="/destinations">Meet the destinations <ArrowRight size={17} /></Link>
            <Link className="text-link" to="/experiences">Explore experiences <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
      <section className="about-highlights">
        <article><span>01 / THE RIVER</span><h3>Life along the Nile</h3><p>Follow the river that has connected communities and landscapes for thousands of years.</p></article>
        <article><span>02 / THE CULTURE</span><h3>Many ways of living</h3><p>Discover local traditions, contemporary creativity and the warm welcome of Egyptian hospitality.</p></article>
        <article><span>03 / THE LAND</span><h3>From sea to desert</h3><p>Explore a landscape of contrasts, from fertile riverbanks to sunlit deserts and blue coastlines.</p></article>
      </section>
    </>
  );
}

function DestinationsPage() {
  return (
    <>
      <PageBanner
        eyebrow="Choose your own horizon"
        title="Find your place in Egypt."
        text="From lively city streets to the stillness of the desert, every destination has a different story to tell."
        image={destinations[0].image}
      />
      <DestinationSection />
    </>
  );
}

function DestinationDetailPage() {
  const { slug } = useParams();
  const place = destinations.find((item) => item.slug === slug);

  if (!place) {
    return <PageBanner eyebrow="A little off the map" title="We couldn’t find that place." text="Browse our destinations and find somewhere new to explore." image={slides[1].image} />;
  }

  const otherPlaces = destinations.filter((item) => item.slug !== place.slug).slice(0, 3);
  return (
    <>
      <PageBanner eyebrow={place.subtitle} title={place.title} text={place.description} image={place.image} />
      <section className="section destination-detail">
        <div className="container detail-copy">
          <p className="section-kicker">Take your time here</p>
          <h2 className="section-title">An invitation to explore.</h2>
          <p className="section-lead">{place.description} Leave room for unplanned stops, conversations and the small moments that turn a trip into a memory.</p>
          <div className="about-links">
            <Link className="button-gold" to="/plan">Plan a visit <ArrowRight size={17} /></Link>
            <Link className="text-link" to="/destinations">See every destination <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
      <section className="section destination-section">
        <div className="container">
          <div className="section-heading"><div><p className="section-kicker">Keep exploring</p><h2 className="section-title">More places to discover.</h2></div></div>
          <div className="destination-grid">
            {otherPlaces.map((otherPlace) => (
              <Link className="destination-card reveal" key={otherPlace.slug} to={`/destinations/${otherPlace.slug}`}>
                <img src={otherPlace.image} alt="" loading="lazy" />
                <span className="destination-arrow" aria-hidden="true"><ArrowUpRight size={17} /></span>
                <span className="destination-info"><span>{otherPlace.subtitle}</span><span className="destination-title">{otherPlace.title}</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ExperiencesPage() {
  return (
    <>
      <PageBanner
        eyebrow="Go beyond the expected"
        title="Choose your own kind of wonder."
        text="Make space for the ancient, the natural and all the moments you didn’t know you were looking for."
        image={slides[2].image}
      />
      <ExperiencesSection />
      <section className="section intro">
        <div className="container">
          <p className="section-kicker">Make it a journey</p>
          <h2 className="section-title">Ready to find your way?</h2>
          <Link className="button-gold" to="/plan">Start planning <ArrowRight size={17} /></Link>
        </div>
      </section>
    </>
  );
}

function PlanPage() {
  const [destination, setDestination] = useState(destinations[0].slug);
  const [duration, setDuration] = useState("A week");
  const [submitted, setSubmitted] = useState(false);
  const selected = destinations.find((place) => place.slug === destination) ?? destinations[0];

  function createPlan(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <PageBanner
        eyebrow="Your trip, your rhythm"
        title="Make it yours."
        text="Start with the places and experiences that call to you. We’ll help you find a way into the journey."
        image="https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=1600&q=85"
      />
      <section className="section plan-section">
        <div className="container plan-layout">
          <div>
            <p className="section-kicker">A good place to start</p>
            <h2 className="section-title">Build your Egypt trip.</h2>
            <p className="section-lead">Choose a starting point and the time you have. Your plan is just a first idea—leave room to make it your own.</p>
          </div>
          <form className="plan-form" onSubmit={createPlan}>
            <label htmlFor="trip-destination">Where would you like to begin?</label>
            <select id="trip-destination" value={destination} onChange={(event) => { setDestination(event.target.value); setSubmitted(false); }}>
              {destinations.map((place) => <option key={place.slug} value={place.slug}>{place.title}</option>)}
            </select>
            <label htmlFor="trip-duration">How long do you have?</label>
            <select id="trip-duration" value={duration} onChange={(event) => { setDuration(event.target.value); setSubmitted(false); }}>
              <option>A long weekend</option><option>A week</option><option>Two weeks or more</option>
            </select>
            <button type="submit" className="button-gold">Create my starting point <ArrowRight size={17} /></button>
            {submitted && (
              <div className="plan-result" role="status">
                <Compass size={21} />
                <p><strong>{duration} starting in {selected.title}</strong><br />{selected.description}</p>
                <Link to={`/destinations/${selected.slug}`}>Discover {selected.title} <ArrowUpRight size={15} /></Link>
              </div>
            )}
          </form>
        </div>
      </section>
      <section className="plan-note"><CalendarDays size={22} /><p>Use this as inspiration, not a fixed itinerary—your best days often leave a little room for surprise.</p></section>
    </>
  );
}

function InspirationPage() {
  return (
    <>
      <PageBanner
        eyebrow="Stay inspired"
        title="A little Egypt in your inbox."
        text="Get thoughtful travel ideas, seasonal inspiration and stories from across the country."
        image={slides[0].image}
      />
      <Newsletter />
    </>
  );
}

function NotFoundPage() {
  return (
    <section className="section intro not-found">
      <div className="container">
        <p className="section-kicker">404 · A little off the map</p>
        <h1 className="section-title">This page wandered off.</h1>
        <p className="section-lead">Let’s get you back to somewhere worth exploring.</p>
        <Link className="button-gold" to="/">Back to home <ArrowRight size={17} /></Link>
      </div>
    </section>
  );
}

function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const reveal = ScrollReveal();
    reveal.reveal(".reveal", {
      distance: "24px",
      duration: 700,
      interval: 90,
      origin: "bottom",
      easing: "ease-out",
      viewFactor: 0.12,
      cleanup: true,
    });
    return () => reveal.destroy();
  }, [location.pathname]);

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/destinations/:slug" element={<DestinationDetailPage />} />
          <Route path="/experiences" element={<ExperiencesPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/inspiration" element={<InspirationPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
