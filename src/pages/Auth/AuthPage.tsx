import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { authApi } from '../../api/auth';
import { useAuth } from '../../store/authStore';
import type { LoginRequest, OtpVerifyPayload, RegisterRequest } from '../../types/auth';

type Tab = 'signin' | 'signup';

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 bg-error-container text-error text-sm font-body px-3 py-2 rounded-xl">
      <span className="material-symbols-outlined text-base">error</span>
      {message}
    </div>
  );
}

export default function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('signin');

  // Sign-in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');

  // OTP state
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Sign-up state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      login(data.accessToken, data.user);
      navigate('/dashboard');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Invalid email or password';
      setSignInError(msg);
    },
  });

  const requestOtpMutation = useMutation({
    mutationFn: () => authApi.requestOtp({ phone: otpPhone }),
    onSuccess: () => {
      setOtpSent(true);
      setOtpError('');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP';
      setOtpError(msg);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: OtpVerifyPayload) => authApi.verifyOtp(data),
    onSuccess: (data) => {
      login(data.accessToken, data.user);
      navigate('/dashboard');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Invalid OTP';
      setOtpError(msg);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      login(data.accessToken, data.user);
      navigate('/dashboard');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setRegError(msg);
    },
  });

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    loginMutation.mutate({ email: signInEmail, password: signInPassword });
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    requestOtpMutation.mutate();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    verifyOtpMutation.mutate({ phone: otpPhone, code: otpCode });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    registerMutation.mutate({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-container flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-on-primary rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">diamond</span>
          </div>
          <span className="font-headline font-bold text-2xl text-on-primary">AuraWealth</span>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-outline-variant">
            <button
              onClick={() => setTab('signin')}
              className={clsx(
                'flex-1 py-4 font-body font-semibold text-sm transition-colors',
                tab === 'signin'
                  ? 'text-primary border-b-2 border-primary bg-primary-fixed/10'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('signup')}
              className={clsx(
                'flex-1 py-4 font-body font-semibold text-sm transition-colors',
                tab === 'signup'
                  ? 'text-primary border-b-2 border-primary bg-primary-fixed/10'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              Sign Up
            </button>
          </div>

          <div className="p-6">
            {tab === 'signin' && (
              <div className="space-y-6">
                {/* Email + Password */}
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="label-field">Email address</label>
                    <input
                      type="email"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="input-field"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="label-field">Password</label>
                    <input
                      type="password"
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="input-field"
                      placeholder="Enter your password"
                    />
                  </div>
                  {signInError && <ErrorMessage message={signInError} />}
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-outline-variant" />
                  <span className="font-body text-xs text-on-surface-variant">or</span>
                  <div className="flex-1 h-px bg-outline-variant" />
                </div>

                {/* OTP */}
                {!otpSent ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <label className="label-field">Phone number</label>
                      <input
                        type="tel"
                        required
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value)}
                        className="input-field"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    {otpError && <ErrorMessage message={otpError} />}
                    <button
                      type="submit"
                      disabled={requestOtpMutation.isPending}
                      className="btn-outlined w-full flex items-center justify-center gap-2"
                    >
                      {requestOtpMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-base">sms</span>
                          Send OTP
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="flex items-center gap-2 text-secondary text-sm font-body">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      OTP sent to {otpPhone}
                    </div>
                    <div>
                      <label className="label-field">Enter OTP</label>
                      <input
                        type="text"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="input-field tracking-widest text-center text-lg"
                        placeholder="• • • • • •"
                        maxLength={6}
                      />
                    </div>
                    {otpError && <ErrorMessage message={otpError} />}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtpCode(''); }}
                        className="btn-outlined flex-1"
                      >
                        Change Number
                      </button>
                      <button
                        type="submit"
                        disabled={verifyOtpMutation.isPending}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                      >
                        {verifyOtpMutation.isPending ? (
                          <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          'Verify & Sign In'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {tab === 'signup' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="label-field">Full name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="input-field"
                    placeholder="Priya Sharma"
                  />
                </div>
                <div>
                  <label className="label-field">Email address</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="input-field"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="label-field">Phone number</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="input-field"
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="label-field">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="input-field"
                    placeholder="Min 8 characters"
                    minLength={8}
                  />
                </div>
                {regError && <ErrorMessage message={regError} />}
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {registerMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
                <p className="text-center font-body text-xs text-on-surface-variant">
                  By creating an account you agree to our{' '}
                  <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>{' '}
                  and{' '}
                  <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
