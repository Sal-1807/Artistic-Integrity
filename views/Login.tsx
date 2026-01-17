
import React from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-deepPurple via-indigoPurple to-brightOrange rounded-2xl flex items-center justify-center text-pureWhite font-bold text-3xl mx-auto shadow-xl shadow-deepPurple/30 mb-6">AI</div>
          <h1 className="text-3xl font-black text-charcoal mb-2 tracking-tight">Artistic Integrity</h1>
          <p className="text-mutedGray font-medium">Platform Administration Portal</p>
        </div>

        <div className="bg-pureWhite p-8 md:p-10 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">Email Address</label>
              <input 
                type="email" 
                defaultValue="admin@artisticintegrity.com"
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-deepPurple focus:ring-4 focus:ring-deepPurple/5 outline-none transition-all text-charcoal font-medium" 
                placeholder="name@company.com" 
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-charcoal">Password</label>
                <a href="#" className="text-xs font-bold text-indigoPurple hover:text-brightOrange transition-colors">Forgot?</a>
              </div>
              <input 
                type="password" 
                defaultValue="password123"
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-deepPurple focus:ring-4 focus:ring-deepPurple/5 outline-none transition-all text-charcoal font-medium" 
                placeholder="••••••••" 
              />
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="remember" className="w-4 h-4 text-deepPurple bg-gray-100 border-gray-300 rounded focus:ring-deepPurple" />
              <label htmlFor="remember" className="ml-2 text-sm font-medium text-mutedGray">Remember me for 30 days</label>
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-deepPurple via-indigoPurple to-brightOrange text-pureWhite py-4 rounded-2xl font-black shadow-lg shadow-indigoPurple/30 hover:opacity-90 transition-all active:scale-[0.98]"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-xs font-medium text-lightGray">Unauthorized access is prohibited.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
