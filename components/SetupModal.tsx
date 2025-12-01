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

  const StepOne = (
    <div className="space-y-4 animate-fade-in">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Child's Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            placeholder="e.g. Maya"
            value={profile.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Grade Level
        </label>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            placeholder="e.g. 5th Grade"
            value={profile.grade}
            onChange={(e) => handleChange('grade', e.target.value)}
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          onClick={nextStep}
          disabled={!profile.name || !profile.grade}
          className="bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2 rounded-full font-semibold transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );

  const StepTwo = (
    <div className="space-y-4 animate-fade-in">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Favorite Subject
        </label>
        <div className="relative">
          <BookOpen className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            placeholder="e.g. Science"
            value={profile.favoriteSubject}
            onChange={(e) => handleChange('favoriteSubject', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Topic needing help
        </label>
        <div className="relative">
          <Brain className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            placeholder="e.g. Fractions, Photosynthesis"
            value={profile.struggleTopic}
            onChange={(e) => handleChange('struggleTopic', e.target.value)}
          />
        </div>
      </div>

      <div className="pt-4 flex justify-between">
        <button
          onClick={prevStep}
          className="text-slate-400 hover:text-white transition-colors text-sm"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:from-fuchsia-400 hover:to-indigo-400 text-white px-6 py-2 rounded-full font-semibold transition-colors flex items-center gap-2"
        >
          Start Learning <Sparkles size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4 py-6 animate-fade-in">
      <div className="w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex flex-col md:flex-row">
          {/* Left: Mascot / Hero (desktop only) */}
          <div className="hidden md:flex flex-col items-center justify-center px-8 py-10 border-r border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="w-56 h-56 rounded-[2.5rem] overflow-hidden bg-yellow-400 flex items-center justify-center shadow-2xl shadow-yellow-500/40">
              <img
                src={splashlogo}
                alt="Lumi ghost mascot"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-8 text-center space-y-2">
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-slate-400">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Lumi AI Tutor
              </p>
              <h2 className="text-2xl font-bold text-white">
                Your child's friendly study companion
              </h2>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                Lumi learns with your child in real-time, keeping sessions fun, focused, and safe.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="flex-1 px-6 py-8 md:px-8 md:py-10">
            {/* Compact hero for mobile */}
            <div className="flex items-center gap-4 mb-6 md:mb-8 md:hidden">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-500/40 flex-shrink-0">
                <img
                  src={splashlogo}
                  alt="Lumi ghost mascot"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-yellow-400" />
                  <span>Welcome to Lumi</span>
                </h2>
                <p className="text-slate-400 text-sm">
                  Let's set up your personal study companion.
                </p>
              </div>
            </div>

            {step === 1 ? StepOne : StepTwo}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupModal;