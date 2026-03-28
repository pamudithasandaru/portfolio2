import React, { useEffect, useMemo, useState } from 'react';
import {
  FaCertificate,
  FaExternalLinkAlt,
  FaIdCard,
  FaCalendarAlt,
  FaRegClock,
  FaCircle,
} from 'react-icons/fa';
import useScrollAnimation from '../hooks/useScrollAnimation';
import '../styles/Certifications.css';

const formatDate = (value) => {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

const Certifications = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategorySlug, setActiveCategorySlug] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const sectionRef = useScrollAnimation();

  useEffect(() => {
    const controller = new AbortController();
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    const fetchCertifications = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${apiBaseUrl}/api/certification-categories`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const normalizedData = Array.isArray(data) ? data : [];
        setCategories(normalizedData);

        if (normalizedData.length > 0) {
          setActiveCategorySlug(normalizedData[0].slug);
        }
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError('Unable to load certifications right now.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();

    return () => {
      controller.abort();
    };
  }, []);

  const activeCategory = useMemo(
    () => categories.find((category) => category.slug === activeCategorySlug) || null,
    [categories, activeCategorySlug]
  );

  const filteredCertificates = useMemo(() => {
    if (!activeCategory || !Array.isArray(activeCategory.certificates)) {
      return [];
    }

    const normalized = searchTerm.trim().toLowerCase();

    const sorted = [...activeCategory.certificates].sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );

    if (!normalized) {
      return sorted;
    }

    return sorted.filter((certificate) => {
      const titleMatch = certificate.certificateTitle?.toLowerCase().includes(normalized);
      const orgMatch = certificate.issuingOrganization?.toLowerCase().includes(normalized);
      const idMatch = certificate.credentialId?.toLowerCase().includes(normalized);
      const skillMatch = Array.isArray(certificate.skills)
        ? certificate.skills.some((skill) => skill.toLowerCase().includes(normalized))
        : false;

      return titleMatch || orgMatch || idMatch || skillMatch;
    });
  }, [activeCategory, searchTerm]);

  return (
    <section id="skills" className="certifications" ref={sectionRef}>
      <div className="certifications-shell">
        <aside className="certifications-network-nav">
          <div className="network-nav-head">
            <h2>Certification Network</h2>
            <p>Knowledge clusters and verified credentials</p>
          </div>

          <div className="network-tree">
            {categories.map((category, index) => {
              const isActive = category.slug === activeCategorySlug;
              return (
                <button
                  key={category.slug}
                  type="button"
                  className={`network-node ${isActive ? 'active' : ''}`}
                  style={{ animationDelay: `${0.12 * index}s` }}
                  onClick={() => setActiveCategorySlug(category.slug)}
                >
                  <span className="node-pulse" aria-hidden="true"></span>
                  <span className="node-content">
                    <span className="node-title">{category.name}</span>
                    <span className="node-meta">
                      {(Array.isArray(category.certificates) ? category.certificates.length : 0)} certificates
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="network-legend" aria-hidden="true">
            <span>
              <FaCircle /> Category Nodes
            </span>
            <span>
              <FaCircle /> Credential Links
            </span>
          </div>
        </aside>

        <main className="certifications-content">
          <header className="certifications-header">
            <div>
              <h3>{activeCategory?.name || 'Certifications & Skills'}</h3>
              <p>{activeCategory?.description || 'Select a category from the network to explore credentials.'}</p>
            </div>
            <div className="cert-search-wrap">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title, org, id, or skill"
                aria-label="Search certificates"
              />
            </div>
          </header>

          {loading && <p className="certifications-feedback">Loading certifications...</p>}
          {!loading && error && <p className="certifications-feedback certifications-feedback-error">{error}</p>}

          {!loading && !error && (
            <div className="certificates-grid">
              {filteredCertificates.map((certificate, index) => (
                <article
                  className="certificate-card"
                  key={`${activeCategorySlug}-${certificate.certificateTitle}-${certificate.credentialId || index}`}
                  style={{ animationDelay: `${0.08 * index}s` }}
                >
                  <div className="certificate-image-wrap">
                    {certificate.mediaFileUrl ? (
                      <img
                        src={certificate.mediaFileUrl}
                        alt={`${certificate.certificateTitle} certificate`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="certificate-image-fallback">
                        <FaCertificate aria-hidden="true" />
                        <span>No certificate image</span>
                      </div>
                    )}
                  </div>

                  <div className="certificate-body">
                    <h4>{certificate.certificateTitle}</h4>
                    <p className="certificate-org">{certificate.issuingOrganization}</p>

                    <div className="certificate-meta-grid">
                      <div>
                        <FaCalendarAlt aria-hidden="true" />
                        <span>Issued: {formatDate(certificate.issueDate)}</span>
                      </div>
                      <div>
                        <FaRegClock aria-hidden="true" />
                        <span>
                          Expires:{' '}
                          {certificate.expireDate ? formatDate(certificate.expireDate) : 'No Expiry'}
                        </span>
                      </div>
                      <div>
                        <FaIdCard aria-hidden="true" />
                        <span>ID: {certificate.credentialId || 'Not Provided'}</span>
                      </div>
                    </div>

                    {Array.isArray(certificate.skills) && certificate.skills.length > 0 && (
                      <div className="certificate-skills">
                        {certificate.skills.map((skill) => (
                          <span key={`${certificate.certificateTitle}-${skill}`}>{skill}</span>
                        ))}
                      </div>
                    )}

                    {certificate.credentialUrl && (
                      <a
                        className="certificate-link"
                        href={certificate.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Verify Credential <FaExternalLinkAlt aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </article>
              ))}

              {filteredCertificates.length === 0 && (
                <p className="certifications-feedback">No certificates matched your search in this category.</p>
              )}
            </div>
          )}
        </main>
      </div>
    </section>
  );
};

export default Certifications;
