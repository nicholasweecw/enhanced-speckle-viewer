import React, { useEffect, useRef, useState } from "react";
import { formatMetadata, MetadataSection } from "@/app/formatMetadata";

// Props accepted by the sidebar component
type Props = {
  data: Record<string, any>;
  onClose: () => void;
  isPinned: boolean;
  togglePin: () => void;
};

// Sidebar UI for displaying metadata in a collapsible and pinnable panel
export default function MetadataSidebar({
  data,
  onClose,
  isPinned,
  togglePin,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null); // For scrolling to top on model component change

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  const sections: MetadataSection[] = formatMetadata(data); // Format raw metadata into structured sections

  // Scroll sidebar content to top when new model component is selected
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [data]);

  return (
    <div
      className={`fixed z-50 transition-all duration-300
        ${isCollapsed ? "w-6" : isPinned ? "w-96" : "w-72"}
        ${isCollapsed ? "bg-gray-100 hover:bg-gray-200" : "bg-gray-900"}
        ${
          isPinned
            ? "top-0 right-0 h-full border-l border-gray-700"
            : "top-4 right-4 max-h-[90vh] rounded-lg border border-gray-700 shadow-lg overflow-hidden"
        }`}
    >
      {/* Collapsed sidebar: show expand icon only */}
      {isCollapsed ? (
        <div
          className="h-full flex items-center justify-center cursor-pointer"
          onClick={toggleCollapse}
        >
          <span className="text-lg text-black">⟨</span>
        </div>
      ) : (
        // Expanded sidebar layout
        <div className="flex flex-col h-full">
          {/* Collapse handle (always visible at left edge) */}
          <button
            onClick={toggleCollapse}
            className="absolute top-1/2 left-0 transform -translate-x-full -translate-y-1/2 
              bg-gray-100 border border-gray-300 px-1 py-0.5 text-lg rounded-l 
              hover:bg-gray-200 z-50 text-black h-[100px] cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            ⟩
          </button>

          {/* Header: title and control buttons */}
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-white">Metadata</h2>
            <div className="flex gap-2">
              <button
                onClick={togglePin}
                title="Pin metadata"
                className="text-sm text-gray-300 hover:text-white cursor-pointer"
              >
                {isPinned ? "📌 Unpin" : "📍 Pin"}
              </button>
              <button
                onClick={onClose}
                title="Close sidebar"
                className="text-sm text-gray-300 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Metadata content with scrollable area */}
          <div
            ref={scrollRef}
            className={`p-4 space-y-4 text-sm text-gray-800 
              ${
                isPinned
                  ? "flex-1 overflow-y-auto"
                  : "max-h-[70vh] overflow-y-auto"
              }`}
          >
            {sections.map((section, index) => (
              <div key={index}>
                <h3 className="text-base font-semibold text-gray-200 mb-2 border-b pb-1 border-gray-600">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.entries.map((entry, i) => (
                    <li key={i} className="flex justify-between gap-4">
                      <span className="font-medium text-gray-300">
                        {entry.label}
                      </span>
                      <span className="text-right text-gray-400 break-all">
                        {entry.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
