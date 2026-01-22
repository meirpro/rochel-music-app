"use client";

/**
 * Simple footer with copyright and credits.
 * Styled similar to ruthknapp.com footer.
 */
export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-100 via-blue-100 to-teal-100 border-t-2 border-purple-200">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2 text-xs text-purple-600">
          {/* Left: Copyright and Batya Method */}
          <div className="text-center sm:text-left">
            <p className="mb-1">
              © {new Date().getFullYear()} Rochel&apos;s Piano School — The
              Batya Method
            </p>
            <p className="text-purple-500 text-[11px]">
              A step-by-step piano course using simplified notation
            </p>
          </div>

          {/* Right: Made with love */}
          <div className="text-center sm:text-right">
            <p>
              Made with{" "}
              <span className="text-red-500" aria-label="love">
                ❤️
              </span>{" "}
              by{" "}
              <a
                href="https://meir.pro/?s=rochel-piano"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-700 hover:text-purple-900 hover:underline font-medium transition-colors"
              >
                Meir.pro
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
