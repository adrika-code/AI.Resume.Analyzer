import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload as UploadIcon, FileText, X, Sparkles, Briefcase } from 'lucide-react';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('upload'); // upload | details | analyzing
  const navigate = useNavigate();

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) return toast.error('File rejected. Use PDF, DOCX, or TXT under 5MB.');
    if (accepted.length > 0) { setFile(accepted[0]); setStep('details'); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'], 'text/plain': ['.txt'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!file) return toast.error('Please select a file');
    setLoading(true);
    setStep('analyzing');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (jobTitle) formData.append('jobTitle', jobTitle);
      if (jobDesc) formData.append('jobDescription', jobDesc);

      const uploadRes = await axios.post('/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const resumeId = uploadRes.data.resume.id;
      toast.success('Resume uploaded! Starting analysis...');

      const analysisRes = await axios.post(`/api/analysis/analyze/${resumeId}`, { jobTitle, jobDescription: jobDesc });
      
      if (analysisRes.data.success) {
        toast.success('Analysis complete!');
        navigate(`/analysis/${resumeId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload or analysis failed');
      setStep('details');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (b) => b > 1048576 ? (b/1048576).toFixed(1) + ' MB' : (b/1024).toFixed(0) + ' KB';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Analyze Resume</h1>
        <p style={{ color: 'var(--text-muted)' }}>Upload your resume and get instant AI-powered feedback</p>
      </div>

      {step === 'analyzing' ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 24px', position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            <Sparkles size={24} color="var(--accent-bright)" style={{ position: 'absolute', inset: 0, margin: 'auto' }} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Analyzing your resume...</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Claude AI is reviewing your resume for ATS compatibility, keywords, and structure.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320, margin: '0 auto' }}>
            {['Extracting text content', 'Checking ATS compatibility', 'Analyzing section scores', 'Generating suggestions'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'var(--bg)', borderRadius: 8, animation: `fadeIn 0.3s ${i * 0.3}s both` }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s infinite' }}></div>
                <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Drop zone */}
          <div {...getRootProps()} className="card" style={{ borderStyle: 'dashed', borderColor: isDragActive ? 'var(--accent)' : file ? 'var(--green)' : 'var(--border-light)', background: isDragActive ? 'rgba(124,92,191,0.05)' : 'var(--bg-card)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', padding: '48px 24px', marginBottom: 24 }}>
            <input {...getInputProps()} />
            {file ? (
              <div>
                <div style={{ width: 56, height: 56, background: 'rgba(34,197,94,0.12)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <FileText size={28} color="var(--green)" />
                </div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{file.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{formatBytes(file.size)}</div>
                <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={e => { e.stopPropagation(); setFile(null); setStep('upload'); }}>
                  <X size={14} /> Remove file
                </button>
              </div>
            ) : (
              <div>
                <div style={{ width: 56, height: 56, background: 'rgba(124,92,191,0.12)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <UploadIcon size={28} color="var(--accent-bright)" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>or click to browse</p>
                <span className="badge badge-purple">PDF, DOCX, TXT · Max 5MB</span>
              </div>
            )}
          </div>

          {/* Optional job context */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Briefcase size={18} color="var(--accent-bright)" />
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Target Job (Optional)</h3>
              <span className="badge badge-purple" style={{ fontSize: 11 }}>Improves accuracy</span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Job Title</label>
              <input type="text" placeholder="e.g. Senior React Developer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
            </div>
            <div>
              <label>Job Description</label>
              <textarea placeholder="Paste the job description here for personalized keyword analysis and match scoring..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} style={{ minHeight: 120, resize: 'vertical' }} />
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleAnalyze} disabled={!file || loading} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}>
            <Sparkles size={16} /> Analyze with AI
          </button>
        </>
      )}
    </div>
  );
}
