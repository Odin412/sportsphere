import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const OFFSET = 16; // px gap between target and tooltip
const TOOLTIP_WIDTH = 340;

function getPosition(targetRect, placement) {
  if (!targetRect || placement === "center") {
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const scrollX = window.scrollX || 0;
  const scrollY = window.scrollY || 0;

  switch (placement) {
    case "right":
      return {
        top: targetRect.top + scrollY + targetRect.height / 2,
        left: targetRect.right + scrollX + OFFSET,
        transform: "translateY(-50%)",
      };
    case "left":
      return {
        top: targetRect.top + scrollY + targetRect.height / 2,
        left: targetRect.left + scrollX - OFFSET - TOOLTIP_WIDTH,
        transform: "translateY(-50%)",
      };
    case "top":
      return {
        top: targetRect.top + scrollY - OFFSET,
        left: targetRect.left + scrollX + targetRect.width / 2,
        transform: "translate(-50%, -100%)",
      };
    case "bottom":
      return {
        top: targetRect.bottom + scrollY + OFFSET,
        left: targetRect.left + scrollX + targetRect.width / 2,
        transform: "translateX(-50%)",
      };
    default:
      return {
        top: targetRect.top + scrollY + targetRect.height / 2,
        left: targetRect.right + scrollX + OFFSET,
        transform: "translateY(-50%)",
      };
  }
}

export default function TourTooltip({ step, targetRect, progress, onNext, onBack, onSkip }) {
  const isMobile = window.innerWidth < 1024;
  const isLast = progress.current === progress.total;
  const isFirst = progress.current === 1;
  const Icon = step.icon;

  const placement = isMobile ? (step.mobilePlacement || "top") : step.placement;
  const posStyle = useMemo(() => getPosition(targetRect, placement), [targetRect, placement]);

  // Mobile: bottom sheet
  if (isMobile && placement !== "center") {
    return (
      <motion.div
        key={step.id}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 rounded-t-2xl p-5 pb-8"
        style={{ zIndex: 9999 }}
      >
        <TooltipContent
          step={step}
          Icon={Icon}
          progress={progress}
          isFirst={isFirst}
          isLast={isLast}
          onNext={onNext}
          onBack={onBack}
          onSkip={onSkip}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="fixed bg-gray-900 border border-gray-700 rounded-2xl p-5 shadow-2xl shadow-black/50"
      style={{
        zIndex: 9999,
        width: TOOLTIP_WIDTH,
        ...posStyle,
      }}
    >
      <TooltipContent
        step={step}
        Icon={Icon}
        progress={progress}
        isFirst={isFirst}
        isLast={isLast}
        onNext={onNext}
        onBack={onBack}
        onSkip={onSkip}
      />
    </motion.div>
  );
}

function TooltipContent({ step, Icon, progress, isFirst, isLast, onNext, onBack, onSkip }) {
  // Split description to detect "Tip:" suffix
  const hasTip = step.description.includes("Tip:");
  const [mainDesc, tipText] = hasTip
    ? step.description.split(/Tip:\s*/)
    : [step.description, null];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white">{step.title}</h3>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">{mainDesc}</p>
          {tipText && (
            <p className="text-xs text-amber-400/90 mt-2 flex items-start gap-1.5">
              <span className="font-bold flex-shrink-0">Tip:</span>
              <span>{tipText}</span>
            </p>
          )}
        </div>
        <button
          onClick={onSkip}
          className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors flex-shrink-0"
          aria-label="Skip tutorial"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Step {progress.current} of {progress.total}</span>
          <span>{Math.round((progress.current / progress.total) * 100)}%</span>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(progress.current / progress.total) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!isFirst && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        )}
        <div className="flex-1" />
        <button
          onClick={onSkip}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1"
        >
          Skip tour
        </button>
        <Button
          size="sm"
          onClick={onNext}
          className="bg-gradient-to-r from-red-900 to-red-600 hover:from-red-800 hover:to-red-500 text-white rounded-xl font-semibold"
        >
          {isLast ? "Finish" : "Next"}
          {!isLast && <ArrowRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
}
