import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Sparkles, Tag, Target, TrendingUp } from 'lucide-react';

const ScoreCircle = ({ score, size = 100 }) => {
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--yellow)' : 'var(--red)';
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`} style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'Clash Display', fontSize: size * 0.28, fontWeight: 700, color }}>{score}</span>
      </div>
    </div>
  );
};

const ProgressBar = ({ score, label }) => {
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--yellow)' : 'var(--red)';
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{score}</span>
      </div>
      <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: score + '%', height: '100%', background: color, borderRadius: 4, transition: 'width 0.8s ease' }}></div>
      </div>
    </div>
  );
};

export default function Analysis() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await axios.get(`/api/resume/${id}`);
        setResume(res.data.resume);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="loading-spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: 24 }}>
      <XCircle size={48} color="var(--red)" style={{ marginBottom: 16 }} />
      <h2 style={{ fontSize: 24, marginBottom: 8 }}>Failed to load analysis</h2>
      <p style={{ color: 'var(--text-muted)' }}>{error}</p>
      <Link to="/history" className="btn btn-primary" style={{ textDecoration: 'none', marginTop: 20 }}>Go to History</Link>
    </div>
  );

  const { analysis, originalName, targetJobTitle } = resume;
  if (!analysis) return (
    <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: 24 }}>
      <AlertCircle size={48} color="var(--yellow)" style={{ marginBottom: 16 }} />
      <h2>Analysis not available</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>This resume hasn't been analyzed yet.</p>
      <Link to={`/upload`} className="btn btn-primary" style={{ textDecoration: 'none', marginTop: 20 }}>Analyze Now</Link>
    </div>
  );

  const radarData = Object.entries(analysis.sections || {}).map(([key, val]) => ({ subject: key.charAt(0).toUpperCase() + key.slice(1), score: val.score || 0 }));

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }} className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <Link to="/history" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, marginBottom: 16 }}>
          <ArrowLeft size={14} /> Back to History
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{originalName}</h1>
            {targetJobTitle && <span className="badge badge-cyan"><Target size={11} /> {targetJobTitle}</span>}
          </div>
          <Link to="/upload" className="btn btn-primary" style={{ textDecoration: 'none' }}><Sparkles size={15} /> Analyze Another</Link>
        </div>
      </div>

      {/* Score Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, minWidth: 200 }}>
          <ScoreCircle score={analysis.overallScore} size={140} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Overall Score</div>
            <span className={"badge " + (analysis.overallScore >= 80 ? 'badge-green' : analysis.overallScore >= 60 ? 'badge-yellow' : 'badge-red')}>
              {analysis.overallScore >= 80 ? 'Excellent' : analysis.overallScore >= 60 ? 'Good' : 'Needs Work'}
            </span>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>ATS Compatibility</div>
            <div style={{ fontFamily: 'Clash Display', fontSize: 28, color: analysis.atsScore >= 80 ? 'var(--green)' : 'var(--yellow)' }}>{analysis.atsScore}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {/* Section Scores */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Section Scores</h3>
            {Object.entries(analysis.sections || {}).map(([key, val]) => (
              <ProgressBar key={key} label={key} score={val.score || 0} />
            ))}
          </div>

          {/* Job Match */}
          {analysis.jobMatch?.percentage != null && (
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}><Target size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Job Match</h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <ScoreCircle score={analysis.jobMatch.percentage} size={100} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Matched Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(analysis.jobMatch.matchedSkills || []).slice(0, 6).map(s => <span key={s} className="badge badge-green" style={{ fontSize: 11 }}>{s}</span>)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Missing Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(analysis.jobMatch.missingSkills || []).slice(0, 6).map(s => <span key={s} className="badge badge-red" style={{ fontSize: 11 }}>{s}</span>)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
        {/* Strengths */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--green)' }}><CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Strengths</h3>
          {(analysis.strengths || []).map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, padding: '10px 12px', background: 'rgba(34,197,94,0.06)', borderRadius: 8, borderLeft: '3px solid var(--green)' }}>
              <CheckCircle size={15} color="var(--green)" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 14, lineHeight: 1.5 }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Weaknesses */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--red)' }}><XCircle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Areas to Improve</h3>
          {(analysis.weaknesses || []).map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, padding: '10px 12px', background: 'rgba(239,68,68,0.06)', borderRadius: 8, borderLeft: '3px solid var(--red)' }}>
              <XCircle size={15} color="var(--red)" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 14, lineHeight: 1.5 }}>{w}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}><TrendingUp size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />AI Suggestions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
          {(analysis.suggestions || []).map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', background: 'rgba(124,92,191,0.06)', borderRadius: 10, border: '1px solid rgba(124,92,191,0.2)' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700 }}>{i+1}</div>
              <span style={{ fontSize: 14, lineHeight: 1.6 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
        {/* Keywords */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}><Tag size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Keywords</h3>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--green)', marginBottom: 8, fontWeight: 600 }}>FOUND ({(analysis.keywords?.found || []).length})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(analysis.keywords?.found || []).map(k => <span key={k} className="badge badge-green" style={{ fontSize: 11 }}>{k}</span>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 8, fontWeight: 600 }}>MISSING ({(analysis.keywords?.missing || []).length})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(analysis.keywords?.missing || []).map(k => <span key={k} className="badge badge-red" style={{ fontSize: 11 }}>{k}</span>)}
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Section Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke="var(--accent-bright)" fill="var(--accent)" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Feedback */}
      {analysis.detailedFeedback && (
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}><Sparkles size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Detailed AI Feedback</h3>
          <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-dim)', whiteSpace: 'pre-wrap' }}>{analysis.detailedFeedback}</div>
        </div>
      )}

      {/* Section Feedback */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Section-by-Section Feedback</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {Object.entries(analysis.sections || {}).map(([key, val]) => (
            <div key={key} style={{ padding: '16px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 14 }}>{key}</span>
                <span style={{ fontFamily: 'Clash Display', fontWeight: 700, fontSize: 20, color: val.score >= 80 ? 'var(--green)' : val.score >= 60 ? 'var(--yellow)' : 'var(--red)' }}>{val.score}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{val.feedback}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
