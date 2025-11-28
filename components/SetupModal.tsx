import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { BookOpen, User, GraduationCap, Brain, Sparkles } from 'lucide-react';
import splashlogo from '../assets/splashlogo.png';

interface SetupModalProps {
  onComplete: (profile: StudentProfile) => void;
}

const SetupModal: React.FC<SetupModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<StudentProfile>({
    name: '',
    grade: '',
    favoriteSubject: '',
    struggleTopic: '',
    learningStyle: 'visual',
  });

  const handleChange = (field: keyof StudentProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = () => {
    if (profile.name && profile.grade) {
      onComplete(profile);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-fade-in safe-area-inset overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden animate-bounce-in my-auto max-h-[90vh] overflow-y-auto">
        {/* Enhanced Decorative background blobs */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 sm:w-40 sm:h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 sm:w-48 sm:h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10">
          {/* Splash Logo with Animation */}
          <div className="flex justify-center mb-4 sm:mb-6 animate-bounce-in">
            <div className="relative">
              <div className="absolute inset-0 bg-fuchsia-500/20 rounded-full blur-2xl animate-pulse-glow"></div>
              <img 
                src={splashlogo} 
                alt="Lumi Logo" 
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain relative z-10 animate-float"
              />
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 text-center animate-slide-up bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 via-pink-300 to-cyan-300 animate-gradient" style={{ backgroundSize: '200% 200%' }}>
            Welcome to Lumi
          </h2>
          <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>Let's set up your personal study companion.</p>

          {step === 1 && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in">
              <div className="animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Child's Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 text-slate-500 w-5 h-5 pointer-events-none group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="text" 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 sm:py-2.5 pl-10 pr-4 text-base sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none touch-manipulation transition-all duration-300 hover:border-slate-600"
                    placeholder="e.g. Maya"
                    value={profile.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </div>
              <div className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Grade Level</label>
                <div className="relative group">
                  <GraduationCap className="absolute left-3 top-3 text-slate-500 w-5 h-5 pointer-events-none group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="text" 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 sm:py-2.5 pl-10 pr-4 text-base sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none touch-manipulation transition-all duration-300 hover:border-slate-600"
                    placeholder="e.g. 5th Grade"
                    value={profile.grade}
                    onChange={(e) => handleChange('grade', e.target.value)}
                  />
                </div>
              </div>
              <div className="pt-2 sm:pt-4 flex justify-end animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
                <button 
                  onClick={nextStep}
                  disabled={!profile.name || !profile.grade}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 active:from-indigo-500 active:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-2.5 sm:py-2 rounded-full font-semibold transition-all touch-manipulation text-base sm:text-sm hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-indigo-500/50 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Next</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in">
              <div className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Favorite Subject</label>
                <div className="relative group">
                  <BookOpen className="absolute left-3 top-3 text-slate-500 w-5 h-5 pointer-events-none group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="text" 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 sm:py-2.5 pl-10 pr-4 text-base sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none touch-manipulation transition-all duration-300 hover:border-slate-600"
                    placeholder="e.g. Science"
                    value={profile.favoriteSubject}
                    onChange={(e) => handleChange('favoriteSubject', e.target.value)}
                  />
                </div>
              </div>
              <div className="animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Topic needing help</label>
                <div className="relative group">
                  <Brain className="absolute left-3 top-3 text-slate-500 w-5 h-5 pointer-events-none group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="text" 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 sm:py-2.5 pl-10 pr-4 text-base sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none touch-manipulation transition-all duration-300 hover:border-slate-600"
                    placeholder="e.g. Fractions, Photosynthesis"
                    value={profile.struggleTopic}
                    onChange={(e) => handleChange('struggleTopic', e.target.value)}
                  />
                </div>
              </div>
              <div className="pt-2 sm:pt-4 flex justify-between items-center gap-3 animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
                <button 
                  onClick={prevStep}
                  className="text-slate-400 active:text-white transition-all touch-manipulation px-3 py-2 text-base sm:text-sm hover:scale-105 rounded-lg"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 active:from-indigo-500 active:via-purple-500 active:to-pink-500 text-white px-6 sm:px-8 py-2.5 sm:py-2 rounded-full font-semibold transition-all flex items-center gap-2 touch-manipulation text-base sm:text-sm hover:scale-105 shadow-lg hover:shadow-purple-500/50 relative overflow-hidden group animate-bounce-in"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Start Learning</span>
                  <Sparkles size={16} className="w-4 h-4 sm:w-4 sm:h-4 relative z-10 animate-pulse" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupModal;