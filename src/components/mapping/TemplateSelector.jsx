import React from 'react';
import useAppStore from '../../store/useAppStore';

const TEMPLATES = [
  {
    id: 'customer',
    label: 'Customer Data',
    icon: '👤',
    description: 'CRM customer master records',
    fields: [
      { label: 'Customer ID', canonical: 'order_id' },
      { label: 'Full Name', canonical: 'customer_name' },
      { label: 'Email', canonical: 'email' },
      { label: 'Phone', canonical: 'phone' },
      { label: 'City/Region', canonical: 'country' },
      { label: 'Signup Date', canonical: 'order_date' },
    ],
  },
  {
    id: 'transaction',
    label: 'Transaction Data',
    icon: '💳',
    description: 'Sales orders and payment records',
    fields: [
      { label: 'Order ID', canonical: 'order_id' },
      { label: 'Product', canonical: 'product_name' },
      { label: 'Quantity', canonical: 'quantity' },
      { label: 'Amount', canonical: 'order_amount' },
      { label: 'Payment Method', canonical: 'payment_method' },
      { label: 'Transaction Date', canonical: 'order_date' },
    ],
  },
  {
    id: 'custom',
    label: 'Custom Dataset',
    icon: '🗂️',
    description: 'Define your own field mappings',
    fields: [],
  },
];

export default function TemplateSelector() {
  const { activeTemplate, setActiveTemplate } = useAppStore();

  return (
    <div>
      <div style={{ fontSize: 11, color: '#71717a', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        Quick Templates
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {TEMPLATES.map((t) => {
          const isActive = activeTemplate === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTemplate(isActive ? null : t.id)}
              style={{
                background: isActive ? 'rgba(99,102,241,0.15)' : 'rgba(24,24,27,0.8)',
                border: isActive ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(63,63,70,0.6)',
                borderRadius: 8, padding: '8px 14px',
                cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: isActive ? '#a5b4fc' : '#d4d4d8' }}>
                  {t.label}
                </div>
                <div style={{ fontSize: 11, color: '#52525b' }}>{t.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Show expected fields for active template */}
      {activeTemplate && activeTemplate !== 'custom' && (
        <div style={{
          marginTop: 12, padding: '10px 14px', borderRadius: 8,
          background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
        }}>
          <div style={{ fontSize: 11, color: '#818cf8', fontWeight: 500, marginBottom: 6 }}>
            Expected Fields for {TEMPLATES.find(t => t.id === activeTemplate)?.label}:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {TEMPLATES.find(t => t.id === activeTemplate)?.fields.map((f) => (
              <span key={f.canonical} style={{
                background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: 4, padding: '2px 8px', fontSize: 11, color: '#a5b4fc',
              }}>
                {f.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
