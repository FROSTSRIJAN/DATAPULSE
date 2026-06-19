import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getAnalyses } from '../lib/supabase';
import {
  TrendingUp,
  FileCheck,
  AlertOctagon,
  Activity,
  ArrowRight,
  Database,
  ShieldCheck,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    avgTrustScore: 0,
    totalRows: 0,
    criticalErrors: 0
  });
  const [recentAnalyses, setRecentAnalyses] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const userId = user?.id || 'demo-user';
        const data = await getAnalyses(userId);
        setRecentAnalyses(data.slice(0, 5));
        
        if (data.length > 0) {
          const totalRows = data.reduce((acc, curr) => acc + (curr.total_rows || 0), 0);
          const criticalErrors = data.reduce((acc, curr) => acc + (curr.critical_errors || 0), 0);
          const avgTrust = Math.round(data.reduce((acc, curr) => acc + (curr.trust_score || 0), 0) / data.length);
          
          setStats({
            totalAnalyses: data.length,
            avgTrustScore: avgTrust,
            totalRows,
            criticalErrors
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  const displayName = user?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Header section */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: '#f4f4f5', marginBottom: 6 }}>
          Welcome back, {displayName}
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: 14 }}>
          Here is your enterprise dataset quality overview. Ensure raw data matches target CRM schemas.
        </p>
      </div>

      {/* Quick Actions Panel */}
      <div className="card card-glow" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f4f4f5', marginBottom: 4 }}>Ready to inspect a new dataset?</h3>
          <p style={{ color: '#a1a1aa', fontSize: 13 }}>Verify CRM compatibility, auto-map columns, and extract AI data insights instantly.</p>
        </div>
        <Link to="/dashboard/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Create New Analysis</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Grid Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
            <Database size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#71717a' }}>Total Datasets</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#f4f4f5' }}>{loading ? '...' : stats.totalAnalyses}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#71717a' }}>Avg. Trust Score</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#34d399' }}>
              {loading ? '...' : stats.avgTrustScore > 0 ? `${stats.avgTrustScore}%` : 'N/A'}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(244,63,94,0.1)', color: '#fb7185' }}>
            <AlertOctagon size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#71717a' }}>Critical Flaws Found</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#fb7185' }}>{loading ? '...' : stats.criticalErrors}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#71717a' }}>Total Rows Cleaned</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#f4f4f5' }}>{loading ? '...' : stats.totalRows.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Main sections layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Recent logs */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f4f4f5', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} /> Recent Analyses
          </h2>
          {loading ? (
            <div style={{ color: '#71717a', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>Loading system logs...</div>
          ) : recentAnalyses.length === 0 ? (
            <div style={{ color: '#71717a', fontSize: 13, padding: '32px 0', textAlign: 'center', border: '1px dashed rgba(63,63,70,0.3)', borderRadius: 8 }}>
              No analyses logged yet. Let's upload your first dataset.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentAnalyses.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(63,63,70,0.2)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>{item.filename}</div>
                    <div style={{ fontSize: 11, color: '#52525b', display: 'flex', gap: 12, marginTop: 2 }}>
                      <span>Rows: {item.total_rows}</span>
                      <span>Type: {item.dataset_type || 'Unknown'}</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                      background: item.trust_score >= 80 ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
                      color: item.trust_score >= 80 ? '#34d399' : '#f87171'
                    }}>
                      TS: {item.trust_score}
                    </div>
                    <button
                      onClick={() => navigate(`/dashboard/history`)}
                      className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f4f4f5' }}>System Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#a1a1aa' }}>Database connection</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>Active (PostgreSQL)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#a1a1aa' }}>Schema Engine</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>Ready</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#a1a1aa' }}>AI Processing</span>
              <span style={{ color: '#818cf8', fontWeight: 600 }}>On-Demand</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(63,63,70,0.3)', paddingTop: 14 }}>
              <div style={{ fontSize: 12, color: '#71717a', lineHeight: '1.5' }}>
                Note: supabase connection is dynamically verified. Fallback localStorage demo mode is automatically enabled if credentials are not configured.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
