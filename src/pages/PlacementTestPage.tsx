import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PLACEMENT_TEST_QUESTIONS } from '../data/academyData';
import { CEFRLevel } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  GraduationCap, 
  Award,
  Clock
} from 'lucide-react';
import { EnglishZoneEmblem } from '../components/common/Logo';

interface PlacementTestPageProps {
  navigate: (route: string, state?: { preselectedLevel?: CEFRLevel }) => void;
}

export const PlacementTestPage: React.FC<PlacementTestPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = PLACEMENT_TEST_QUESTIONS[currentIndex];
  const totalQuestions = PLACEMENT_TEST_QUESTIONS.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQ.id]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsCompleted(false);
  };

  // Calculate score and recommended CEFR Level
  const calculateResult = () => {
    let score = 0;
    PLACEMENT_TEST_QUESTIONS.forEach((q) => {
      const selectedIdx = selectedAnswers[q.id];
      if (selectedIdx !== undefined && q.options[selectedIdx]?.isCorrect) {
        score += 1;
      }
    });

    // Score evaluation matrix
    let recommended: CEFRLevel = 'A1';
    let labelEn = 'A1 — Beginner';
    let labelAr = 'A1 — مبتدئ أساسي';

    if (score >= 14) {
      recommended = 'C2';
      labelEn = 'C2 — Mastery / Proficiency';
      labelAr = 'C2 — إتقان تام وخبير';
    } else if (score >= 11) {
      recommended = 'C1';
      labelEn = 'C1 — Advanced';
      labelAr = 'C1 — متقدم';
    } else if (score >= 8) {
      recommended = 'B2';
      labelEn = 'B2 — Upper-Intermediate';
      labelAr = 'B2 — فوق المتوسط';
    } else if (score >= 5) {
      recommended = 'B1';
      labelEn = 'B1 — Intermediate';
      labelAr = 'B1 — متوسط';
    } else if (score >= 3) {
      recommended = 'A2';
      labelEn = 'A2 — Elementary';
      labelAr = 'A2 — مبتدئ متقدم';
    } else {
      recommended = 'A1';
      labelEn = 'A1 — Beginner';
      labelAr = 'A1 — مبتدئ أساسي';
    }

    return { score, recommended, labelEn, labelAr };
  };

  const result = isCompleted ? calculateResult() : null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            {t.placement.badge}
          </span>
          <h1 className="font-serif-luxury font-bold text-3xl sm:text-4xl text-[#0A192F] mt-1">
            {t.placement.title}
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            {t.placement.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isCompleted ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D4AF37]/30 shadow-xl">
            {/* Top progress & level indicator */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span className="font-bold text-[#0A192F]">
                {t.placement.questionCount} {currentIndex + 1} {t.placement.of} {totalQuestions}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0A192F] text-[#F3E5AB] font-bold">
                Assessing {currentQ.level} Level
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
              <div 
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#AA820A] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Question Text */}
            <div className="mb-8">
              <h2 className="font-serif-luxury font-bold text-lg sm:text-xl text-[#0A192F] leading-snug">
                {language === 'ar' ? currentQ.questionAr : currentQ.questionEn}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-10">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-2xl text-left rtl:text-right border-2 transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#0A192F] font-bold shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-[#0A192F] text-[#F3E5AB]' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm sm:text-base">
                        {language === 'ar' ? option.textAr : option.textEn}
                      </span>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                {t.placement.previousQuestion}
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={selectedAnswers[currentQ.id] === undefined}
                className="px-7 py-3 rounded-xl font-bold text-sm bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] disabled:opacity-40 transition-all flex items-center gap-2"
              >
                <span>{currentIndex === totalQuestions - 1 ? t.placement.completeTest : t.placement.submitAnswer}</span>
                <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        ) : (
          /* RESULT SCREEN */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-[#D4AF37]/50 shadow-2xl text-center space-y-6">
            <div className="flex justify-center">
              <EnglishZoneEmblem sizeClass="w-20 h-20 sm:w-24 sm:h-24" glow={true} />
            </div>

            <span className="text-xs uppercase font-bold tracking-widest text-[#AA820A]">
              {t.placement.resultTitle}
            </span>

            {/* Score & Recommended Level Badge */}
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-gray-200 inline-block max-w-md mx-auto w-full">
              <div className="text-xs text-gray-500 mb-1">{t.placement.yourScore}</div>
              <div className="text-3xl font-extrabold text-[#0A192F] font-serif-luxury">
                {result?.score} <span className="text-lg text-gray-400 font-normal">/ {totalQuestions}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-xs font-semibold text-[#AA820A] block">{t.placement.recommendedLevel}</span>
                <span className="font-serif-luxury font-bold text-2xl text-[#0A192F] block mt-1">
                  {language === 'ar' ? result?.labelAr : result?.labelEn}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
              {t.placement.levelAdvice}
            </p>

            {/* Actions: Proceed to Register with level preselected */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (result?.recommended) {
                    navigate('register', { preselectedLevel: result.recommended });
                  } else {
                    navigate('register');
                  }
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-5 h-5" />
                <span>{t.placement.proceedToRegister} ({result?.recommended})</span>
              </button>

              <button
                onClick={handleRestart}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4 text-gray-500" />
                <span>{t.placement.retakeTest}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
