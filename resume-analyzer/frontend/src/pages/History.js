import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FileText, Trash2, Eye, Upload, Search, Calendar, RefreshCw } from 'lucide-react';

export default function History() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/resume/all?limit=50');
      setResumes(res.data.resumes || []);
    } catch (err) {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResumes(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/resume/${id}`);
      setResumes(prev => prev.filter(r => r._id !== id));
      toast.success('Resume deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const statusBadge = (status) => {
    const map = { completed: 'badge-green', pending: 'badge-yellow', analyzing: 'badge-cyan', failed: 'badge-red' };
    return <span className={"badge " + (map[status] || 'badge-purple')} style={{ fontSize: 11 }}>{status}</span>;
  };

  const filtered = resumes.filter(r => r.originalName?.toLowerCase().includes(search.toLowerCase()) || r.targetJobTitle?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Resume History</h1>
          <p style={{ color: 'var(--text-muted)' }}>{resumes.length} resume{resumes.length !== 1 ? 's' : ''} analyzed</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={fetchResumes}><RefreshCw size={15} /></button>
          <Link to="/upload" className="btn btn-primary" style={{ textDecoration: 'none' }}><Upload size={15} /> New Analysis</Link>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
        <input type="text" placeholder="Search by filename or job title..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 42 }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="loading-spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <FileText size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: 16 }} />
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{search ? 'No matching resumes' : 'No resumes yet'}</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{search ? 'Try a different search' : 'Upload your first resume to get started'}</p>
          {!search && <Link to="/upload" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}><Upload size={15} /> Upload Resume</Link>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(r => (
            <div key={r._id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, transition: 'border-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-light)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={20} color="var(--text-muted)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300 }}>{r.originalName}</span>
                  {statusBadge(r.status)}
                  {r.targetJobTitle && <span className="badge badge-cyan" style={{ fontSize: 11 }}>{r.targetJobTitle}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} />{new Date(r.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {r.fileType && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>.{r.fileType.toUpperCase()}</span>}
                </div>
              </div>
              {r.analysis?.overallScore != null && (
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Clash Display', fontSize: 28, fontWeight: 700, color: r.analysis.overallScore >= 80 ? 'var(--green)' : r.analysis.overallScore >= 60 ? 'var(--yellow)' : 'var(--red)' }}>{r.analysis.overallScore}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Score</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {r.status === 'completed' && (
                  <Link to={`/analysis/${r._id}`} className="btn btn-outline" style={{ padding: '7px 12px', textDecoration: 'none', fontSize: 13 }}>
                    <Eye size={14} /> View
                  </Link>
                )}
                <button className="btn btn-danger" style={{ padding: '7px 10px', fontSize: 13 }} onClick={() => handleDelete(r._id, r.originalName)} disabled={deleting === r._id}>
                  {deleting === r._id ? <div className="loading-spinner" style={{ borderColor: 'rgba(239,68,68,0.3)', borderTopColor: 'var(--red)' }}></div> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
