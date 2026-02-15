"use client";

import { useState } from "react";
import Link from "next/link";
import { NOT_FOUND_DESIGNS } from "@/components/404";
import { NotFoundRenderer } from "@/components/404/NotFoundRenderer";
import type { NotFoundDesignId } from "@/components/404";

/**
 * Preview page for all 404 designs.
 * Navigate to /404-preview to test and tweak each design individually.
 */
export default function NotFoundPreview() {
  const [activeDesign, setActiveDesign] = useState<NotFoundDesignId>(
    NOT_FOUND_DESIGNS[0].id,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
      {/* Header bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-purple-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-purple-500 hover:text-purple-700 transition-colors text-sm"
            >
              &larr; Editor
            </Link>
            <h1 className="text-lg font-semibold text-purple-800">
              404 Page Preview
            </h1>
          </div>

          {/* Design selector tabs */}
          <div className="flex flex-wrap gap-1.5 sm:ml-auto">
            {NOT_FOUND_DESIGNS.map((design) => (
              <button
                key={design.id}
                onClick={() => setActiveDesign(design.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeDesign === design.id
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                }`}
              >
                {design.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active design description */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <p className="text-center text-sm text-purple-500">
          {NOT_FOUND_DESIGNS.find((d) => d.id === activeDesign)?.description}
        </p>
      </div>

      {/* Design preview area */}
      <div className="flex items-center justify-center">
        <NotFoundRenderer designId={activeDesign} />
      </div>
    </div>
  );
}
