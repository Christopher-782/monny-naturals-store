import { Leaf, Heart, Recycle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";

const valueIcons = [Leaf, Recycle, Heart, Sparkles];

const fallbackAbout = {
  heroEyebrow: "About Monny Naturals",
  heroTitle: "My MonnyNaturals Story",
  heroText:
    "What began as a parent's search for gentle care became a passion for creating thoughtful skincare and teaching the science and art of soap making.",
  heroImage: "/uploads/about/monny-about-hero.webp",
  storyEyebrow: "Our story",
  storyTitle: "My MonnyNaturals Story",
  storyImage: "/uploads/about/monny-about.webp",
  storyText: `If someone had told me years ago that I would one day build a skincare brand and teach others how to make soap, I probably would have smiled and said, "That wasn't part of my plan."

Like many great journeys, MonnyNaturals didn't begin as a business idea. It began as a parent's search for a solution.

My baby suffered from rashes and eczema. As a parent, there's a special kind of pain that comes from seeing your child uncomfortable and not knowing how to make it better. Every rash, every scratch, and every restless night reminded me that I needed to find products that would be gentle on delicate skin.

I tried different products, hoping each new purchase would finally solve the problem. Some worked only for a short time. Others didn't seem to help at all. That experience opened my eyes to something important: not every skincare product is made with the same care or the same understanding of sensitive skin.

Instead of giving up, I became curious.

I wanted to understand what was inside the products people used every day. I began reading, researching, asking questions, and learning about ingredients, oils, and the science behind soap making. What started as a search for answers slowly became a passion for creating better skincare.

The more I learned, the more I realized that making soap is both a science and an art. It's not simply about mixing ingredients together. Every oil has a purpose. Every measurement matters. Every step affects the quality of the final product.

My first successful product was a baby skincare product.

Holding that finished product in my hands brought a sense of accomplishment that is difficult to describe. It wasn't perfect because it looked beautiful. It was special because it represented hope. It reminded me that knowledge, patience, and persistence could produce something that genuinely served families like mine.

That success also gave me confidence to keep learning.

Looking back, I can honestly say that one of my biggest challenges wasn't finding customers. It was learning soap formulation.

Recipes are easy to copy.
Understanding why a recipe works is much harder.

There were moments when I felt overwhelmed by unfamiliar terms, percentages, and calculations. I discovered that changing one ingredient could affect hardness, lather, conditioning, curing time, or the overall feel of the soap. Every batch became a lesson.

Sometimes the results were encouraging.

Sometimes they taught me what not to do.`,
  closingText: "WELCOME TO THE WORLD OF NATURE.",
  ctaLabel: "Explore the collection",
  ctaLink: "/products",
  values: [
    {
      title: "Natural Ingredients",
      text: "Nature-inspired formulas and carefully selected ingredients.",
    },
    {
      title: "Sustainable Beauty",
      text: "Thoughtful choices designed with people and the planet in mind.",
    },
    {
      title: "Cruelty Free",
      text: "Compassion is part of the standard, never an afterthought.",
    },
    {
      title: "Empowering You",
      text: "Beauty care that supports confidence and your natural glow.",
    },
  ],
};

export default function About() {
  const contentContext = useContent() || {};

  // Supports both the newer context shape (`about`) and older versions
  // where About data is only available under `content.about`.
  const sourceAbout =
    contentContext.about || contentContext.content?.about || {};
  const about = {
    ...fallbackAbout,
    ...sourceAbout,
    values: Array.isArray(sourceAbout.values)
      ? sourceAbout.values
      : fallbackAbout.values,
  };

  const storyBlocks = String(about.storyText || "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section className="about-page">
      <div className="about-hero">
        <img
          src={about.heroImage || fallbackAbout.heroImage}
          alt="Monny Naturals skincare collection"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <div className="container about-hero-copy">
        <span className="eyebrow">{about.heroEyebrow}</span>
        <h1>{about.heroTitle}</h1>
        {about.heroText && <p>{about.heroText}</p>}
      </div>

      <div className="container about-story about-story--founder">
        {about.storyImage && (
          <img
            src={about.storyImage}
            alt={about.storyTitle || "Monny Naturals story"}
            loading="lazy"
            decoding="async"
          />
        )}

        <article className="about-story-copy">
          <span className="eyebrow">{about.storyEyebrow}</span>
          <h2>{about.storyTitle}</h2>

          {storyBlocks.map((paragraph, index) => {
            const lines = paragraph
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean);

            const isHighlight =
              lines[0]?.toLowerCase() === "recipes are easy to copy.";

            if (isHighlight) {
              return (
                <p
                  className="about-story-highlight"
                  key={`${index}-${paragraph.slice(0, 24)}`}
                >
                  {lines[0]}
                  {lines[1] && (
                    <>
                      <br />
                      <strong>{lines.slice(1).join(" ")}</strong>
                    </>
                  )}
                </p>
              );
            }

            return (
              <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
            );
          })}

          {about.closingText && (
            <p className="about-story-closing">{about.closingText}</p>
          )}
          {about.ctaLabel && about.ctaLink && (
            <Link to={about.ctaLink} className="btn btn-dark">
              {about.ctaLabel}
            </Link>
          )}
        </article>
      </div>

      <div className="container values-grid">
        {about.values.slice(0, 4).map((item, index) => {
          const Icon = valueIcons[index] || Sparkles;
          return (
            <div key={`${item?.title || "value"}-${index}`}>
              <Icon />
              <h3>{item?.title || ""}</h3>
              <p>{item?.text || ""}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
