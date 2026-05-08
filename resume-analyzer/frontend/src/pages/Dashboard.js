import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, TrendingUp, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

const ScoreRing = ({ score }) => {
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--yellow)' : 'var(--red)';
  const data = [{ name: 'score', value: score, fill: color }];
  return (
    <div style={{ position: 'relative', width: 160, height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" data={data} startAngle={90} endAngle={-270}>
          <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'var(--border)' }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Clash Display', fontSize: 36, fontWeight: 700, color }}>{score}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Overall</div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentResumes, setRecentResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, resumesRes] = await Promise.all([
          axios.get('/api/analysis/stats/overview'),
          axios.get('/api/resume/all?limit=5')
        ]);
        setStats(statsRes.data.stats);
        setRecentResumes(resumesRes.data.resumes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusBadge = (status) => {
    const map = { completed: 'badge-green', pending: 'badge-yellow', analyzing: 'badge-cyan', failed: 'badge-red' };
    return <span className={"badge " + (map[status] || 'badge-purple')}>{status}</span>;
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      {/* Welcome */}
      <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with your resumes</p>
        </div>
        <Link to="/upload" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <Upload size={16} /> Analyze New Resume
        </Link>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        {[
          { icon: FileText, label: 'Total Resumes', value: user?.resumeCount || 0, color: 'var(--accent-bright)' },
          { icon: TrendingUp, label: 'Avg Score', value: stats ? stats.avgScore : '--', color: 'var(--green)', suffix: '' },
          { icon: Sparkles, label: 'Avg ATS Score', value: stats ? stats.avgAtsScore : '--', color: 'var(--cyan)' },
          { icon: Clock, label: 'Best Score', value: stats ? stats.bestScore : '--', color: 'var(--yellow)' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${color === 'var(--green)' ? '34,197,94' : color === 'var(--cyan)' ? '6,182,212' : color === 'var(--yellow)' ? '234,179,8' : '124,92,191'},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
            </div>
            <div style={{ fontFamily: 'Clash Display', fontSize: 36, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24, alignItems: 'start' }}>
        {/* Recent Resumes */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Recent Resumes</h2>
            <Link to="/history" style={{ fontSize: 13, color: 'var(--accent-bright)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View all <ArrowRight size={13} /></Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="loading-spinner" style={{ width: 32, height: 32 }}></div></div>
          ) : recentResumes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <FileText size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>No resumes yet</p>
              <Link to="/upload" className="btn btn-primary" style={{ textDecoration: 'none', marginTop: 16, display: 'inline-flex' }}>Upload your first resume</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentResumes.map(r => (
                <Link key={r._id} to={r.status === 'completed' ? `/analysis/${r._id}` : '#'} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, textDecoration: 'none', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={18} color="var(--text-muted)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.originalName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(r.uploadedAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {r.analysis?.overallScore && <span style={{ fontFamily: 'Clash Display', fontSize: 18, fontWeight: 700, color: r.analysis.overallScore >= 80 ? 'var(--green)' : r.analysis.overallScore >= 60 ? 'var(--yellow)' : 'var(--red)' }}>{r.analysis.overallScore}</span>}
                    {statusBadge(r.status)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Best Score Card */}
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Best Resume</h2>
          {stats ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <ScoreRing score={stats.bestScore} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Score</p>
              <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 20 }}>{stats.bestResumeName}</p>
              <Link to="/upload" className="btn btn-outline" style={{ textDecoration: 'none', width: '100%', justifyContent: 'center' }}>
                <Upload size={14} /> Upload Better Resume
              </Link>
            </>
          ) : (
            <div style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
              <Sparkles size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: 14 }}>Analyze a resume to see your score</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
