import { Leaf, Heart, Recycle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";

const valueIcons = [Leaf, Recycle, Heart, Sparkles];

export default function About() {
  const { about = {} } = useContent();

  const storyBlocks = String(about.storyText || "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section className="about-page">
      <div className="about-hero">
        <div className="container">
          <span className="eyebrow light">{about.heroEyebrow}</span>
          <h1>{about.heroTitle}</h1>
          {about.heroText && <p>{about.heroText}</p>}
        </div>
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
          {about.storyTitle && about.storyTitle !== about.heroTitle && (
            <h2>{about.storyTitle}</h2>
          )}

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
