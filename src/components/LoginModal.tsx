'use client';
import { useState } from 'react';

export default function LoginModal({ onClose, onSuccess }: { onClose: () => void, onSuccess?: () => void }) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [error, setError] = useState('');

  const API_KEY = '8fbd93b2-7a03-11f1-803e-0200cd936042';

  const handleOtpChange = (val: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleSendOtp = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://2factor.in/API/V1/${API_KEY}/SMS/+91${phone}/AUTOGEN`);
      const data = await res.json();
      if (data.Status === 'Success') {
        setVerificationId(data.Details);
        setStep('otp');
      } else {
        setError(data.Details || 'Failed to send OTP');
      }
    } catch (e: any) {
      setError(e.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    const otpCode = otp.join('');
    try {
      const res = await fetch(`https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${verificationId}/${otpCode}`);
      const data = await res.json();
      if (data.Status === 'Success') {
        // Save session locally as customer phone
        localStorage.setItem('chotu_customer_phone', `+91${phone}`);
        // Optionally trigger a reload or context update here
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(data.Details || 'Invalid OTP');
      }
    } catch (e: any) {
      setError(e.message || 'Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 20, fontSize: 20, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        <div className="modal-logo">chotu<span style={{ color: 'var(--brand-orange)' }}>.</span></div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>India's local delivery app</p>

        {step === 'phone' ? (
          <>
            <div className="modal-title">Log in or Sign up</div>
            <p className="modal-subtitle">We'll send an OTP to verify your number</p>
            <div className="phone-input-group">
              <span className="phone-prefix">🇮🇳 +91</span>
              <input
                type="tel"
                placeholder="Enter mobile number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                id="phone-input"
                autoFocus
              />
            </div>
            <button className="btn-continue" onClick={handleSendOtp} disabled={loading || phone.length !== 10}
              style={{ opacity: phone.length !== 10 ? 0.5 : 1 }}>
              {loading ? 'Sending...' : 'Continue'}
            </button>
            {error && <p style={{ color: 'red', fontSize: 12, marginTop: 8 }}>{error}</p>}
            <p className="modal-terms">By continuing, you agree to our <a href="#">Terms of Service</a> &amp; <a href="#">Privacy Policy</a></p>
          </>
        ) : (
          <>
            <div className="modal-title">Enter OTP</div>
            <p className="modal-subtitle">Sent to +91 {phone}</p>
            <div className="otp-inputs">
              {otp.map((val, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  className="otp-input"
                  type="tel"
                  maxLength={1}
                  value={val}
                  onChange={e => handleOtpChange(e.target.value, idx)}
                  autoFocus={idx === 0}
                  style={{ width: '40px', height: '45px' }}
                />
              ))}
            </div>
            <button className="btn-continue" onClick={handleVerify} disabled={loading || otp.join('').length !== 6}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            {error && <p style={{ color: 'red', fontSize: 12, marginTop: 8 }}>{error}</p>}
            <button onClick={() => setStep('phone')} style={{ color: 'var(--brand-green)', fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}>
              ← Change number
            </button>
          </>
        )}
      </div>
    </div>
  );
}
