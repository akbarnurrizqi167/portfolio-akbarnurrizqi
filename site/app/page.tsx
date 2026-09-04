"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  fallbackData,
  fetchLivePortfolioData,
  PortfolioData,
  SheetRow,
} from "./portfolio-data";

const isTrue = (value: string | undefined) =>
  String(value || "").toLowerCase() === "true";

const isPlaceholder = (value: string | undefined) =>
  !value || value.includes("TODO_NEEDS_INPUT");

const safeUrl = (value: string | undefined) => {
  if (isPlaceholder(value)) return "";
  return /^(https?:\/\/|mailto:|#|\/)/.test(value || "") ? value || "" : "";
};

const imageUrlFrom = (value: string | undefined) => {
  const url = safeUrl(value);
  if (!url) return "";

  const driveFileId =
    url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/)?.[1] ||
    url.match(/[?&]id=([^&#]+)/)?.[1];

  return driveFileId
    ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveFileId)}&sz=w1200`
    : url;
};

const splitValues = (value: string | undefined) =>
  (value || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

const splitAchievements = (value: string | undefined) =>
  (value || "")
    .split(/\n+/)
    .map((item) => item.replace(/^[•*-]\s*/, "").trim())
    .filter(Boolean);

const formatLabel = (value: string) =>
  value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatDate = (value: string | undefined) => {
  if (!value) return "";
  if (/^\d{4}$/.test(value)) return value;
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en", {
      month: "short",
      year: "numeric",
    }).format(new Date(Date.UTC(year, month - 1, 1)));
  }
  return value;
};

function Arrow({ direction = "north-east" }: { direction?: "north-east" | "east" }) {
  return <span aria-hidden="true">{direction === "east" ? "→" : "↗"}</span>;
}

function SectionHeading({
  index,
  label,
  title,
  description,
}: {
  index: string;
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <div className="section-kicker">
        <span>{index}</span>
        <p>{label}</p>
      </div>
      <div className="section-title-wrap">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<PortfolioData>(fallbackData);
  const [dataStatus, setDataStatus] = useState<"loading" | "live" | "fallback">(
    "loading",
  );
  const [activeRole, setActiveRole] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleProjects, setVisibleProjects] = useState(6);
  const [showAllExperience, setShowAllExperience] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState("");

  useEffect(() => {
    let active = true;
    fetchLivePortfolioData()
      .then((liveData) => {
        if (!active) return;
        setData(liveData);
        setDataStatus("live");
      })
      .catch(() => {
        if (active) setDataStatus("fallback");
      });

    return () => {
      active = false;
    };
  }, []);

  const settings = useMemo(
    () =>
      Object.fromEntries(
        data.site_settings.map((item) => [item.key, item.value]),
      ),
    [data.site_settings],
  );

  const profile = data.profile[0] || fallbackData.profile[0];
  const roles = splitValues(profile.rotating_titles);

  useEffect(() => {
    if (roles.length < 2) return;
    const timer = window.setInterval(
      () => setActiveRole((current) => (current + 1) % roles.length),
      2600,
    );
    return () => window.clearInterval(timer);
  }, [roles.length]);

  const projectCategories = useMemo(
    () => ["all", ...Array.from(new Set(data.projects.map((item) => item.category)))],
    [data.projects],
  );

  const filteredProjects = useMemo(() => {
    const items = activeCategory === "all"
      ? data.projects
      : data.projects.filter((item) => item.category === activeCategory);
    return [...items].sort((a, b) => {
      const featureDelta = Number(isTrue(b.featured)) - Number(isTrue(a.featured));
      return featureDelta || Number(a.sort_order || 999) - Number(b.sort_order || 999);
    });
  }, [activeCategory, data.projects]);

  const skillsByGroup = useMemo(() => {
    const groups = new Map<string, SheetRow[]>();
    data.skills.forEach((skill) => {
      const group = skill.skill_group || "Other";
      groups.set(group, [...(groups.get(group) || []), skill]);
    });
    return Array.from(groups.entries());
  }, [data.skills]);

  const navItems = [
    { label: "Expertise", section: "services" },
    { label: "Projects", section: "projects" },
    { label: "Experience", section: "experience" },
    { label: "Profile", section: "profile" },
    { label: "Credentials", section: "credentials" },
  ];

  const resumeUrl = safeUrl(profile.resume_url);
  const imageUrl = imageUrlFrom(profile.photo_url);
  const primaryUrl = safeUrl(profile.primary_cta_url) || "#projects";
  const secondaryUrl = safeUrl(profile.secondary_cta_url) || "#contact";

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    setFormStatus("Sending…");
    const form = event.currentTarget;
    event.preventDefault();
    const entries = Array.from(new FormData(form).entries()).map(
      ([key, value]) => [key, String(value)] as [string, string],
    );
    const body = new URLSearchParams(entries).toString();
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Submission failed");
        form.reset();
        setFormStatus("Message received. Thank you.");
      })
      .catch(() => {
        setFormStatus(
          "The form is available after Netlify deployment. You can also email me directly.",
        );
      });
  };

  return (
    <main id="top">
      <a className="skip-link" href="#content">
        Skip to content
      </a>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Akbar Nur Rizqi home">
          ANR<span>.</span>
        </a>
        <nav className={mobileMenuOpen ? "site-nav open" : "site-nav"} aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              href={`#${item.section}`}
              key={item.section}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-contact" href="#contact">
            Let&apos;s talk <Arrow />
          </a>
          <button
            className="menu-button"
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div id="content">
        <section className="hero section-shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">{profile.eyebrow || "Data · Intelligence · Vision"}</p>
            <p className="intro-name">Hello, I&apos;m {profile.full_name}.</p>
            <h1 id="hero-title">
              I turn messy data into
              <span>useful intelligence.</span>
            </h1>
            <p className="role-line" aria-live="polite">
              <span>Currently shaping work as a</span>
              <strong>{roles[activeRole] || profile.headline}</strong>
            </p>
            <p className="hero-summary">{profile.summary}</p>
            <div className="hero-actions">
              <a className="button button-primary" href={primaryUrl}>
                {profile.primary_cta_label || "View Projects"} <Arrow direction="east" />
              </a>
              {isTrue(settings.show_resume) && resumeUrl && (
                <a className="button button-secondary" href={resumeUrl} target="_blank" rel="noreferrer">
                  View Résumé <Arrow />
                </a>
              )}
              <a className="button button-secondary" href={secondaryUrl}>
                {profile.secondary_cta_label || "Contact Me"} <Arrow />
              </a>
            </div>
          </div>

          <aside className="hero-panel" aria-label="Professional highlights">
            <div className="hero-portrait">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={profile.full_name} />
              ) : (
                <div className="monogram" aria-hidden="true">
                  <span>A</span>
                  <span>R</span>
                </div>
              )}
              <div className="scan-line" />
              <p>CV / DATASET / 001</p>
            </div>
            <div className="status-line">
              <span className="status-dot" />
              {profile.availability_text || "Open to opportunities"}
            </div>
            <div className="metric metric-main">
              <strong>99.55%</strong>
              <span>validation accuracy</span>
            </div>
            <div className="metric-row">
              <div className="metric compact">
                <strong>600K+</strong>
                <span>records analyzed</span>
              </div>
              <div className="metric compact">
                <strong>4.8+</strong>
                <span>mentor rating</span>
              </div>
            </div>
          </aside>

          <div className="hero-footnote">
            <span>{profile.location}</span>
            <span className={`data-indicator ${dataStatus}`}>
              <i /> {dataStatus === "live" ? "Synced with Google Sheets" : "Loading portfolio data"}
            </span>
          </div>
        </section>

        <section className="section-shell section-pad" id="services">
          <SectionHeading
            index="01"
            label="Expertise"
            title="Systems that connect data to decisions."
            description="From raw information to deployed models, each engagement is grounded in a measurable problem."
          />
          <div className="services-grid">
            {data.services.map((service, index) => (
              <article className="service-card" key={service.id}>
                <div className="service-index">0{index + 1}</div>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.short_description}</p>
                </div>
                <span className={`service-glyph glyph-${index + 1}`} aria-hidden="true" />
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell section-pad" id="projects">
          <SectionHeading
            index="02"
            label="Selected work"
            title="Projects built around real constraints."
            description="A selection of analytics, machine learning, and computer vision work. Project media and links appear automatically when added to the Sheet."
          />
          <div className="filter-row" aria-label="Project filters">
            {projectCategories.map((category) => (
              <button
                className={activeCategory === category ? "filter-button active" : "filter-button"}
                key={category}
                type="button"
                onClick={() => {
                  setActiveCategory(category);
                  setVisibleProjects(Number(settings.default_projects_limit || 6));
                }}
              >
                {category === "all" ? "All work" : formatLabel(category)}
              </button>
            ))}
          </div>
          <div className="projects-grid">
            {filteredProjects.slice(0, visibleProjects).map((project, index) => {
              const projectImage = safeUrl(project.image_url);
              const demoUrl = safeUrl(project.demo_url);
              const repositoryUrl = safeUrl(project.repository_url);
              return (
                <article className="project-card" key={project.id}>
                  <div className={`project-visual visual-${(index % 4) + 1}`}>
                    {projectImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={projectImage} alt="" />
                    ) : (
                      <>
                        <span className="project-code">{String(index + 1).padStart(2, "0")}</span>
                        <div className="data-shape" aria-hidden="true"><i /><i /><i /></div>
                        <p>{formatLabel(project.category)}</p>
                      </>
                    )}
                  </div>
                  <div className="project-body">
                    <div className="project-meta">
                      <span>{formatLabel(project.category)}</span>
                      <time>{formatDate(project.project_date)}</time>
                    </div>
                    <h3>{project.title}</h3>
                    <p>{project.long_description || project.short_description}</p>
                    <div className="tag-list">
                      {splitValues(project.tech_tags).map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                    {(demoUrl || repositoryUrl) && (
                      <div className="project-actions">
                        {demoUrl && (
                          <a className="project-link project-link-primary" href={demoUrl} target="_blank" rel="noreferrer">
                            Live Demo <Arrow />
                          </a>
                        )}
                        {repositoryUrl && (
                          <a className="project-link" href={repositoryUrl} target="_blank" rel="noreferrer">
                            {repositoryUrl.includes("github.com") ? "GitHub Repository" : "Repository"} <Arrow />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          {visibleProjects < filteredProjects.length && (
            <button
              className="button button-secondary centered-button"
              type="button"
              onClick={() => setVisibleProjects((count) => count + 3)}
            >
              Load more projects <Arrow direction="east" />
            </button>
          )}
        </section>

        {settings.show_experience !== "FALSE" && (
          <section className="section-shell section-pad" id="experience">
            <SectionHeading
              index="03"
              label="Experience"
              title="Applied work across industry and education."
              description="Roles spanning AI engineering, analytics, research, and technical mentorship."
            />
            <div className="timeline">
              {data.experience
                .slice(0, showAllExperience ? data.experience.length : 6)
                .map((item, index) => (
                  <article className="timeline-item" key={item.id}>
                    <div className="timeline-count">{String(index + 1).padStart(2, "0")}</div>
                    <div className="timeline-when">
                      <time>{formatDate(item.start_date)}</time>
                      <span>—</span>
                      <time>{isTrue(item.is_current) ? "Present" : formatDate(item.end_date)}</time>
                    </div>
                    <div className="timeline-content">
                      <p className="timeline-type">{item.employment_type} · {item.location}</p>
                      <h3>{item.job_title}</h3>
                      <h4>{item.company}</h4>
                      <p>{item.summary}</p>
                      <ul>
                        {splitAchievements(item.achievements).map((achievement) => (
                          <li key={achievement}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
            </div>
            {data.experience.length > 6 && (
              <button
                className="timeline-toggle"
                type="button"
                onClick={() => setShowAllExperience((show) => !show)}
              >
                {showAllExperience ? "Show concise timeline" : `Show all ${data.experience.length} roles`}
                <Arrow direction="east" />
              </button>
            )}
          </section>
        )}

        <section className="section-shell section-pad profile-section" id="profile">
          <SectionHeading index="04" label="Profile" title="A foundation in Information Systems." />
          <div className="profile-grid">
            <div className="education-panel" id="education">
              {data.education.map((item) => (
                <article key={item.id}>
                  <div className="education-topline">
                    <span>{item.start_year} — {item.end_year}</span>
                    <strong>GPA {item.gpa}/4.00</strong>
                  </div>
                  <h3>{item.institution}</h3>
                  <p className="education-degree">{item.degree} · {item.major}</p>
                  <div className="thesis-card">
                    <span>Undergraduate thesis</span>
                    <p>{item.thesis_title}</p>
                  </div>
                </article>
              ))}
              {isTrue(settings.show_resume) && resumeUrl && (
                <a className="resume-link" href={resumeUrl} target="_blank" rel="noreferrer">
                  View résumé <Arrow />
                </a>
              )}
            </div>

            <div className="skills-panel" id="skills">
              <p className="panel-label">Technical toolkit</p>
              <div className="skill-groups">
                {skillsByGroup.map(([group, skills]) => (
                  <div className="skill-group" key={group}>
                    <h3>{group}</h3>
                    <div>
                      {skills.map((skill) => <span key={skill.id}>{skill.skill_name}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell section-pad" id="credentials">
          <SectionHeading
            index="05"
            label="Research & recognition"
            title="Published, awarded, and always learning."
          />

          {settings.show_publications !== "FALSE" && (
            <div className="publication-list">
              {data.publications.map((publication, index) => {
                const publicationUrl = safeUrl(publication.doi_or_url);
                const Wrapper = publicationUrl ? "a" : "article";
                return (
                  <Wrapper
                    className="publication-item"
                    href={publicationUrl || undefined}
                    target={publicationUrl ? "_blank" : undefined}
                    rel={publicationUrl ? "noreferrer" : undefined}
                    key={publication.id}
                  >
                    <span className="publication-index">P.{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <p>{publication.venue} · {publication.publication_year}</p>
                      <h3>{publication.title}</h3>
                      <span className="authors">{splitValues(publication.authors).join(", ")}</span>
                    </div>
                    {publicationUrl && <Arrow />}
                  </Wrapper>
                );
              })}
            </div>
          )}

          <div className="credentials-grid">
            {settings.show_awards !== "FALSE" && (
              <div className="credential-column">
                <p className="panel-label">Honors & awards</p>
                {data.awards.map((award) => (
                  <article className="award-item" key={award.id}>
                    <time>{formatDate(award.award_date)}</time>
                    <h3>{award.title}</h3>
                    <p>{award.issuer}</p>
                    <span>{award.description}</span>
                  </article>
                ))}
              </div>
            )}
            {settings.show_certifications !== "FALSE" && (
              <div className="credential-column certifications-column">
                <p className="panel-label">Selected certifications</p>
                {data.certifications.map((certification) => {
                  const credentialUrl = safeUrl(certification.credential_url);
                  const Wrapper = credentialUrl ? "a" : "article";
                  return (
                    <Wrapper
                      className="certification-item"
                      href={credentialUrl || undefined}
                      target={credentialUrl ? "_blank" : undefined}
                      rel={credentialUrl ? "noreferrer" : undefined}
                      key={certification.id}
                    >
                      <span>{certification.issue_year}</span>
                      <div>
                        <h3>{certification.name}</h3>
                        <p>{certification.issuer}</p>
                      </div>
                      {credentialUrl && <Arrow />}
                    </Wrapper>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="section-shell contact-grid">
            <div className="contact-copy">
              <p className="eyebrow">06 · Contact</p>
              <h2>Have a data problem worth solving?</h2>
              <p>
                I&apos;m open to roles, research collaborations, and projects where analytics or AI can create clear, practical value.
              </p>
              <div className="contact-details">
                {data.contact_items.map((item) => {
                  const itemUrl = safeUrl(item.url);
                  return (
                    <div key={item.id}>
                      <span>{item.label}</span>
                      {itemUrl ? (
                        <a href={itemUrl} target={itemUrl.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                          {item.value}
                        </a>
                      ) : (
                        <p>{item.value}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <form
              className="contact-form"
              name="contact"
              method="POST"
              action="/success/"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={submitForm}
            >
              <input type="hidden" name="form-name" value="contact" />
              <p className="hidden-field">
                <label>Do not fill this field <input name="bot-field" /></label>
              </p>
              <div className="form-row">
                <label>
                  <span>Name</span>
                  <input type="text" name="name" autoComplete="name" required placeholder="Your name" />
                </label>
                <label>
                  <span>Email</span>
                  <input type="email" name="email" autoComplete="email" required placeholder="you@company.com" />
                </label>
              </div>
              <label>
                <span>Subject</span>
                <input type="text" name="subject" required placeholder="What would you like to discuss?" />
              </label>
              <label>
                <span>Message</span>
                <textarea name="message" rows={6} required placeholder="Tell me a little about the opportunity or project." />
              </label>
              <div className="form-footer">
                <button className="button button-primary" type="submit">
                  Send message <Arrow direction="east" />
                </button>
                <p aria-live="polite">{formStatus}</p>
              </div>
            </form>
          </div>
        </section>
      </div>

      <footer className="site-footer section-shell">
        <div>
          <a className="wordmark" href="#top">ANR<span>.</span></a>
          <p>{settings.footer_quote || "Data-driven solutions."}</p>
        </div>
        <div className="footer-links">
          {data.social_links
            .filter((item) => safeUrl(item.url))
            .map((item) => (
              <a href={safeUrl(item.url)} target={item.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer" key={item.id}>
                {item.label} <Arrow />
              </a>
            ))}
        </div>
        <div className="footer-meta">
          <p>{settings.copyright_text || "© 2026 Akbar Nur Rizqi."}</p>
          <p>Content synced via Google Sheets</p>
        </div>
      </footer>
    </main>
  );
}
