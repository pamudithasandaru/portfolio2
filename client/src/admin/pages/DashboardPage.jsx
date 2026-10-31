import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminQuery } from '../hooks';
import { formatBytes } from '../api';
import { Loading, PageHeader } from '../ui';

const RANGES = [7, 30, 90];

const number = (value) => value.toLocaleString();

const shortDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString([], { month: 'short', day: 'numeric', timeZone: 'UTC' });

const Delta = ({ now, before }) => {
  if (!before) {
    return <span className="adm-muted">no earlier data</span>;
  }
  const change = Math.round(((now - before) / before) * 100);
  return (
    <span className={change >= 0 ? 'adm-up' : 'adm-down'}>
      {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% vs previous period
    </span>
  );
};

const Stat = ({ label, value, children, to }) => {
  const body = (
    <>
      <span className="adm-stat-label">{label}</span>
      <strong className="adm-stat-value">{value}</strong>
      <span className="adm-stat-note">{children}</span>
    </>
  );
  return to ? (
    <Link className="adm-card adm-stat" to={to}>
      {body}
    </Link>
  ) : (
    <div className="adm-card adm-stat">{body}</div>
  );
};

// Daily views as bars; the table below the chart gives screen readers the same numbers
const ViewsChart = ({ series }) => {
  const max = Math.max(1, ...series.map((day) => day.views));
  const width = 720;
  const height = 180;
  const gap = series.length > 45 ? 1 : 3;
  const barWidth = width / series.length - gap;

  return (
    <figure className="adm-chart">
      <svg viewBox={`0 0 ${width} ${height + 22}`} role="img" aria-label={`Page views per day, highest ${max}`} preserveAspectRatio="none">
        <line x1="0" x2={width} y1={height} y2={height} className="adm-chart-axis" />
        {series.map((day, index) => {
          const barHeight = (day.views / max) * (height - 8);
          return (
            <rect key={day.date} x={index * (barWidth + gap)} y={height - barHeight} width={barWidth} height={Math.max(barHeight, day.views ? 2 : 0)} rx="2" className="adm-chart-bar">
              <title>{`${shortDate(day.date)}: ${day.views} views, ${day.visitors} visitors`}</title>
            </rect>
          );
        })}
        <text x="0" y={height + 16} className="adm-chart-label">{shortDate(series[0].date)}</text>
        <text x={width} y={height + 16} textAnchor="end" className="adm-chart-label">{shortDate(series.at(-1).date)}</text>
        <text x={width} y="10" textAnchor="end" className="adm-chart-label">peak {max}</text>
      </svg>
      <table className="sr-only">
        <caption>Page views per day</caption>
        <thead><tr><th>Date</th><th>Views</th><th>Visitors</th></tr></thead>
        <tbody>
          {series.map((day) => (
            <tr key={day.date}><td>{day.date}</td><td>{day.views}</td><td>{day.visitors}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
};

const BarList = ({ rows, labelKey, empty }) => {
  const max = Math.max(1, ...rows.map((row) => row.views));
  if (rows.length === 0) {
    return <p className="adm-muted">{empty}</p>;
  }
  return (
    <ul className="adm-bars">
      {rows.map((row) => (
        <li key={row[labelKey]}>
          <span className="adm-bars-label" title={row[labelKey]}>{row[labelKey]}</span>
          <span className="adm-bars-track"><span style={{ width: `${(row.views / max) * 100}%` }} /></span>
          <span className="adm-bars-value">{number(row.views)}</span>
        </li>
      ))}
    </ul>
  );
};

const DashboardPage = () => {
  const [days, setDays] = useState(30);
  const { data, isPending, isError, error } = useAdminQuery(['stats', days], `/api/admin/stats?days=${days}`);

  return (
    <>
      <PageHeader title="Dashboard">
        <div className="adm-segmented" role="group" aria-label="Time range">
          {RANGES.map((range) => (
            <button key={range} type="button" aria-pressed={days === range} className={days === range ? 'is-active' : ''} onClick={() => setDays(range)}>
              {range} days
            </button>
          ))}
        </div>
      </PageHeader>

      {isPending && <Loading />}
      {isError && <p className="adm-error">{error.message}</p>}

      {data && (
        <>
          <div className="adm-stats">
            <Stat label="Page views" value={number(data.views)}>
              <Delta now={data.views} before={data.previousViews} />
            </Stat>
            <Stat label="Unique visitors" value={number(data.visitors)}>
              <Delta now={data.visitors} before={data.previousVisitors} />
            </Stat>
            <Stat label="Blog comments" value={number(data.engagement.comments)} to="/admin/inbox">
              {number(data.engagement.ratings)} ratings in total
            </Stat>
            <Stat label="Unread messages" value={number(data.engagement.unreadMessages)} to="/admin/inbox">
              {number(data.engagement.messages)} received in total
            </Stat>
          </div>

          <section className="adm-card">
            <h2 className="adm-section-title">Views per day</h2>
            {data.views === 0 && (
              <p className="adm-muted">No visits recorded yet. Counting starts once the site is live: visits from localhost, bots and you (while signed in here) are not counted.</p>
            )}
            <ViewsChart series={data.series} />
          </section>

          <div className="adm-two-col">
            <section className="adm-card">
              <h2 className="adm-section-title">Top pages</h2>
              <BarList rows={data.topPages} labelKey="path" empty="No page views yet." />
            </section>
            <section className="adm-card">
              <h2 className="adm-section-title">Where visitors come from</h2>
              <BarList rows={data.referrers} labelKey="source" empty="No outside referrers yet (direct visits are not listed)." />
            </section>
          </div>

          <section className="adm-card adm-table-wrap">
            <h2 className="adm-section-title">Blog performance</h2>
            {data.blogs.length === 0 ? (
              <p className="adm-muted">No blog posts yet.</p>
            ) : (
              <table className="adm-table">
                <thead>
                  <tr><th>Post</th><th>Views ({days}d)</th><th>Rating</th><th>Comments</th></tr>
                </thead>
                <tbody>
                  {data.blogs.map((blog) => (
                    <tr key={blog.slug}>
                      <td>
                        {blog.title} {blog.draft && <span className="adm-badge is-draft">Private</span>}
                      </td>
                      <td>{number(blog.views)}</td>
                      <td>{blog.ratingCount ? `${blog.average.toFixed(1)} ★ (${blog.ratingCount})` : '–'}</td>
                      <td>{blog.commentCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <div className="adm-two-col">
            <section className="adm-card">
              <h2 className="adm-section-title">Content on the site</h2>
              <dl className="adm-facts">
                <div><dt>Projects</dt><dd>{data.content.projects} in {data.content.projectCategories} categories</dd></div>
                <div><dt>Certificates</dt><dd>{data.content.certificates} in {data.content.certificationCategories} categories</dd></div>
                <div><dt>Volunteering</dt><dd>{data.content.volunteering}</dd></div>
                <div><dt>Blog posts</dt><dd>{data.content.blogs - data.content.drafts} published, {data.content.drafts} private</dd></div>
                <div><dt>Uploaded images</dt><dd>{data.content.mediaFiles} ({formatBytes(data.content.mediaBytes || 0)})</dd></div>
              </dl>
            </section>
            <section className="adm-card">
              <h2 className="adm-section-title">Latest comments</h2>
              {data.recentComments.length === 0 && <p className="adm-muted">No comments yet.</p>}
              <ul className="adm-stack">
                {data.recentComments.map((comment) => (
                  <li key={comment._id}>
                    <strong>{comment.name}</strong> <span className="adm-muted">on /blogs/{comment.slug}</span>
                    <p className="adm-clamp">{comment.message}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </>
  );
};

export default DashboardPage;
