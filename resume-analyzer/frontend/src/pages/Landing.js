import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Target, TrendingUp, Shield, ArrowRight, Check } from 'lucide-react';

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="card" style={{ transition: 'all 0.3s', cursor: 'default' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,92,191,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
      <Icon size={22} color="var(--accent-bright)" />
    </div>
    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
    <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
  </div>
);

export default function Landing() {
  return (
    <div>
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center' }}>
        <div className="badge badge-purple" style={{ marginBottom: 24, fontSize: 13 }}>
          <Sparkles size={13} /> Powered by Claude AI
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 24 }}>
          Your Resume,{' '}
          <span style={{ background: 'linear-gradient(135deg, var(--accent-bright), var(--cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Perfected by AI
          </span>
        </h1>
        <p style={{ fontSize: 20, color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Upload your resume and get instant AI-powered analysis with ATS scores, keyword optimization, and actionable improvement suggestions.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: 15, textDecoration: 'none' }}>
            Analyze My Resume <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn btn-outline" style={{ padding: '14px 28px', fontSize: 15, textDecoration: 'none' }}>Sign In</Link>
        </div>
        <div style={{ marginTop: 80, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, maxWidth: 700, margin: '80px auto 0', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: 'Clash Display', fontSize: 18, fontWeight: 600 }}>Resume Score</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Senior_Dev_Resume.pdf</div>
            </div>
            <div style={{ fontFamily: 'Clash Display', fontSize: 52, fontWeight: 700, color: 'var(--green)' }}>87</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[['ATS Score', 92, 'var(--green)'], ['Skills Match', 78, 'var(--yellow)'], ['Clarity', 88, 'var(--cyan)']].map(([label, score, color]) => (
              <div key={label} style={{ background: 'var(--bg)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ width: score + "%", height: '100%', background: color, borderRadius: 3 }}></div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color }}>{score}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40 }}>
          {[['50K+', 'Resumes Analyzed'], ['94%', 'ATS Pass Rate'], ['3x', 'More Interviews'], ['<30s', 'Analysis Time']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Clash Display', fontSize: 42, fontWeight: 700, color: 'var(--accent-bright)' }}>{v}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Everything you need to land the job</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 48, fontSize: 16 }}>Comprehensive AI analysis in seconds</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <Feature icon={Target} title="ATS Optimization" desc="Know exactly how well your resume passes Applicant Tracking Systems used by top companies." />
          <Feature icon={Zap} title="Instant Analysis" desc="Get detailed feedback in under 30 seconds. No waiting, no human review needed." />
          <Feature icon={TrendingUp} title="Score Breakdown" desc="Section-by-section scoring for Contact, Experience, Skills, Education and more." />
          <Feature icon={Shield} title="Job Match Score" desc="Paste a job description and see exactly how well your resume matches the role." />
          <Feature icon={Sparkles} title="AI Suggestions" desc="Get concrete, actionable rewrite suggestions tailored to your target role." />
        </div>
      </section>
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Ready to optimize your resume?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 16 }}>Join thousands of job seekers who landed their dream jobs with ResumeAI</p>
        <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 15, textDecoration: 'none' }}>
          Start for Free <ArrowRight size={16} />
        </Link>
        <div style={{ marginTop: 24, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['No credit card required', 'Instant results', 'Supports PDF & DOCX'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-muted)' }}>
              <Check size={14} color="var(--green)" /> {t}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
