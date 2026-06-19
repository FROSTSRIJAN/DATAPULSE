import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAnalyses } from '../lib/supabase';
import { Download, FileText, CheckCircle } from 'lucide-react';

export default function SavedReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    async function loadReports() {
      try {
        const userId = user?.id || 'demo-user';
        const data = await getAnalyses(userId);
        setReports(data.filter(a => a.trust_score !== undefined));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [user]);

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f4f4f5', marginBottom: 4 }}>Saved Reports</h1>
        <p style={{ color: '#a1a1aa', fontSize: 13 }}>Access previously saved audit packages, clean CSV profiles, and AI reports.</p>
      </div>

      {loading ? (
        <div style={{ color: '#71717a', fontSize: 14, textAlign: 'center', padding: '60px 0' }}>Loading saved reports...</div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderStyle: 'dashed', borderColor: 'rgba(63,63,70,0.4)' }}>
          <FileText size={32} style={{ color: '#52525b', marginBottom: 12, margin: '0 auto' }} />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e4e4e7', marginBottom: 4 }}>No Reports Available</h3>
          <p style={{ color: '#71717a', fontSize: 13, maxW: 400, margin: '0 auto' }}>Generate clean datasets in the New Analysis wizard to save export jobs.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {reports.map((report) => (
            <div key={report.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e4e4e7' }}>{report.filename}</h3>
                  <p style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>{new Date(report.created_at).toLocaleDateString()} • {report.dataset_type}</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={12} /> Ready
                </span>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(63,63,70,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: '#a1a1aa' }}>Total Rows:</span>
                  <span style={{ color: '#f4f4f5', fontWeight: 600 }}>{report.total_rows}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#a1a1aa' }}>Trust Score:</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>{report.trust_score}%</span>
                </div>
              </div>

              <button
                onClick={() => alert('Re-downloading clean dataset package...')}
                className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}
              >
                <Download size={14} />
                <span>Download Clean CSV</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
