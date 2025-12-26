import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AnswerOption {
  value: string;
  label: string;
  description?: string;
}

interface ModernQuestionLayoutProps {
  // Header
  onBack: () => void;
  currentQuestion: number;
  totalQuestions: number;
  
  // Question
  category?: string;
  categoryColor?: string;
  questionText: string;
  
  // Options
  options: AnswerOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  
  // Navigation
  onPrevious?: () => void;
  onNext?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  isLastQuestion?: boolean;
  showAutoProgress?: boolean;
}

const ModernQuestionLayout: React.FC<ModernQuestionLayoutProps> = ({
  onBack,
  currentQuestion,
  totalQuestions,
  category,
  categoryColor = "bg-blue-100 text-blue-600",
  questionText,
  options,
  selectedValue,
  onSelect,
  onPrevious,
  canGoBack = true,
  showAutoProgress = true,
}) => {
  const progress = ((currentQuestion) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 -ml-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600">
              질문 {currentQuestion} / {totalQuestions}
            </span>
            <span className="text-sm font-medium text-slate-600">
              {Math.round(progress)}% 완료
            </span>
          </div>
          
          <Progress value={progress} className="h-2 bg-slate-200" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 p-6 md:p-8"
          >
            {/* Category Badge */}
            {category && (
              <div className="mb-4">
                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${categoryColor}`}>
                  {category}
                </span>
              </div>
            )}

            {/* Question Text */}
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed mb-8">
              {questionText}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelect(option.value)}
                  className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 group ${
                    selectedValue === option.value
                      ? "border-blue-500 bg-blue-50/80 shadow-md shadow-blue-100"
                      : "border-slate-200/80 bg-white/60 hover:border-blue-300 hover:bg-blue-50/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Radio indicator */}
                    <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      selectedValue === option.value
                        ? "border-blue-500 bg-blue-500"
                        : "border-slate-300 group-hover:border-blue-400"
                    }`}>
                      {selectedValue === option.value && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className={`font-medium text-base md:text-lg ${
                        selectedValue === option.value ? "text-blue-700" : "text-slate-700"
                      }`}>
                        {option.label}
                      </div>
                      {option.description && (
                        <div className={`text-sm mt-1 ${
                          selectedValue === option.value ? "text-blue-500" : "text-slate-400"
                        }`}>
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoBack || currentQuestion <= 1}
            className="w-full py-6 rounded-2xl border-2 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModernQuestionLayout;
