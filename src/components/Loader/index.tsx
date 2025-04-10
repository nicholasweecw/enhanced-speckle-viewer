import React from "react";

// Fullscreen loading overlay with spinner and progress indicator
export default function Loader({ progress = 0 }) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white">
      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />

      {/* Progress indicator */}
      <p className="mt-4 text-sm text-gray-300">
        Loading model... {Math.round(progress * 100)}%
      </p>
    </div>
  );
}
