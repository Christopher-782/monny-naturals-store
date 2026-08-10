import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Leaf, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";

export default function Hero() {
  const { heroSlides, homepage } = useContent();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= heroSlides.length && heroSlides.length) setIndex(0);
  }, [heroSlides.length, index]);

  useEffect(() => {
    if (heroSlides.length < 2) return undefined;
    const seconds = Math.max(
      2,
      Math.min(12, Number(homepage.heroRotationSeconds) || 2),
    );
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % heroSlides.length);
    }, seconds * 3000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length, homepage.heroRotationSeconds]);

  if (!heroSlides.length) return null;

  const go = (next) => setIndex((next + heroSlides.length) % heroSlides.length);
  const activeSlide = heroSlides[index] || heroSlides[0];

  return (
    <section className="hero">
      {heroSlides.map((slide, i) => (
        <div
          key={`${slide.image}-${i}`}
          className={`hero-slide ${i === index ? "active" : ""}`}
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(18,49,18,.88) 0%, rgba(25,66,23,.64) 31%, rgba(37,77,31,.16) 60%, rgba(37,77,31,.02) 78%), url(${slide.image})`,
          }}
        />
      ))}

      <div className="container hero-content">
        <div className="hero-copy-panel">
          <span className="hero-kicker">
            <Sparkles size={15} />
            {activeSlide.kicker}
          </span>
          <h1>{activeSlide.title}</h1>
          <div className="gold-rule" />
          <p>{activeSlide.text}</p>

          <div className="hero-actions">
            <Link
              className="btn hero-btn"
              to={activeSlide.ctaLink || "/products"}
            >
              {activeSlide.ctaLabel || "Shop now"} <Leaf size={17} />
            </Link>
            {activeSlide.secondaryLabel && (
              <Link
                className="hero-secondary-link"
                to={activeSlide.secondaryLink || "/about"}
              >
                {activeSlide.secondaryLabel} <ChevronRight size={16} />
              </Link>
            )}
          </div>

          {activeSlide.trustText && (
            <div className="hero-trust">
              <span></span>
              {activeSlide.trustText}
            </div>
          )}
        </div>
      </div>

      <button
        className="hero-arrow left"
        onClick={() => go(index - 1)}
        aria-label="Previous slide"
      >
        <ChevronLeft />
      </button>
      <button
        className="hero-arrow right"
        onClick={() => go(index + 1)}
        aria-label="Next slide"
      >
        <ChevronRight />
      </button>
      <div className="hero-dots">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            className={i === index ? "active" : ""}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
