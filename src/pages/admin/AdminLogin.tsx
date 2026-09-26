import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';

export function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'AMSCODE' && password === 'ams@123@1101') {
      setError('');
      onLogin();
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-start relative overflow-hidden pt-0">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex justify-center items-center">
        <div className="w-[800px] h-[800px] bg-primary rounded-full blur-3xl opacity-20 animate-[pulse_4s_ease-in-out_infinite]"></div>
      </div>
      
      {/* ID Badge Container */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center animate-in slide-in-from-top-[100%] duration-1000 ease-out origin-top">
        
        {/* Lanyard string */}
        <div className="w-1.5 h-16 bg-gradient-to-b from-primary-container to-primary shadow-sm rounded-b-sm z-0"></div>
        
        {/* ID Badge Card */}
        <div 
          className={`bg-surface-container-lowest w-full pt-12 pb-8 px-8 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border-2 border-outline-variant/40 relative overflow-hidden group transition-transform duration-500 ${isHovered ? 'rotate-1' : 'rotate-0'}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Badge Hole */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-3 bg-surface rounded-full shadow-inner border border-outline-variant/20"></div>

          {/* Top color bar */}
          <div className="absolute top-10 left-0 right-0 h-16 bg-primary/10"></div>
          
          <div className="text-center mb-8 relative z-10 mt-6">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-surface-container-lowest">
              <Icon name="person" className="text-on-primary text-4xl" filled />
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface uppercase tracking-widest mt-2">ADMIN ID</h1>
            <p className="text-on-surface-variant font-body-sm mt-1 uppercase font-semibold">Admin Access Required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {error && (
              <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm text-center font-medium">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="badge" className="text-outline-variant text-lg" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container pl-12 pr-4 py-3.5 rounded-xl border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all duration-300 font-body-md shadow-inner"
                  placeholder="USERNAME"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="relative">
    
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container pl-12 pr-4 py-3.5 rounded-xl border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all duration-300 font-body-md shadow-inner"
                  placeholder="PASSWORD"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-container text-on-primary py-3.5 rounded-xl font-label-md text-label-md uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 mt-6 active:scale-95 flex justify-center items-center gap-2 group/btn cursor-pointer"
            >
              <Icon name="lock_open" className="text-lg group-hover/btn:scale-110 transition-transform" />
              <span>Authenticate</span>
            </button>
          </form>

          {/* Barcode decorative element */}
          <div className="mt-10 flex flex-col items-center opacity-40">
            <div className="w-48 h-8 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#000_2px,#000_4px,transparent_4px,transparent_8px,#000_8px,#000_10px)]"></div>
            <p className="font-mono text-[10px] mt-1 tracking-widest text-outline">AUTH-99482-AD</p>
          </div>
        </div>
        
        {/* Animated shadow at bottom */}
        <div className={`mx-auto h-3 bg-black/10 rounded-[100%] blur-sm transition-all duration-500 mt-8 ${isHovered ? 'w-3/4 opacity-40' : 'w-full opacity-20'}`}></div>
      </div>
    </div>
  );
}
