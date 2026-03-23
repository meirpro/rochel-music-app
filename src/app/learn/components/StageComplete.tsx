"use client";

import { motion } from "motion/react";
import { LearnStage, STAGE_INFO } from "../page";
import { Confetti } from "@/components/Confetti";

interface StageCompleteProps {
  stage: LearnStage;
  onContinue: () => void;
  isFinalStage?: boolean;
}

export function StageComplete({
  stage,
  onContinue,
  isFinalStage = false,
}: StageCompleteProps) {
  const nextStage = stage < 5 ? ((stage + 1) as LearnStage) : null;

  return (
    <>
      <Confetti />
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-md mx-4 overflow-hidden"
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            type: "spring" as const,
            damping: 20,
            stiffness: 250,
            delay: 0.15,
          }}
        >
          {/* Header with gradient */}
          <motion.div
            className="bg-gradient-to-r from-teal-500 via-blue-500 to-primary-500 p-6 text-white text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="text-5xl mb-2"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring" as const,
                damping: 10,
                stiffness: 200,
                delay: 0.5,
              }}
            >
              {isFinalStage ? "🎓" : "🎊"}
            </motion.div>
            <motion.div
              className="text-2xl font-bold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {isFinalStage ? "Congratulations!" : "Stage Complete!"}
            </motion.div>
            <motion.div
              className="text-lg opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ delay: 0.7 }}
            >
              {isFinalStage
                ? "You've mastered the basics!"
                : `You finished "${STAGE_INFO[stage].title}"`}
            </motion.div>
          </motion.div>

          {/* Content */}
          <div className="p-6">
            <motion.p
              className="text-gray-700 mb-4 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {isFinalStage
                ? "You've learned everything you need to start creating music! The full editor is now unlocked."
                : "Great job! You're making excellent progress. Ready for the next stage?"}
            </motion.p>

            {/* Next stage preview */}
            {nextStage && (
              <motion.div
                className="bg-primary-50 rounded-lg p-4 mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="text-sm text-primary-600 font-medium mb-1">
                  Up Next: Stage {nextStage}
                </div>
                <div className="text-primary-800 font-semibold">
                  {STAGE_INFO[nextStage].title}
                </div>
                <div className="text-primary-600 text-sm">
                  {STAGE_INFO[nextStage].subtitle}
                </div>
              </motion.div>
            )}

            {/* Continue button */}
            <motion.button
              onClick={onContinue}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 text-white rounded-xl font-semibold shadow-lg transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {isFinalStage ? "Go to Editor →" : "Continue to Next Stage →"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
