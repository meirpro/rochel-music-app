import { NOT_FOUND_DESIGNS } from "@/components/404";
import { NotFoundRenderer } from "@/components/404/NotFoundRenderer";
import type { NotFoundDesignId } from "@/components/404";

/**
 * Custom 404 page that randomly selects one of 5 music-themed designs.
 * Each page load shows a different design.
 *
 * This is a Server Component - Math.random() runs once on the server per request,
 * and the chosen design is baked into the HTML sent to the client.
 * No hydration mismatch because the client never re-evaluates the random pick.
 *
 * Preview all designs at: /404-preview
 */
export default function NotFound() {
  // eslint-disable-next-line react-hooks/purity -- Server Component: evaluated once per request, never re-rendered on client
  const index = Math.floor(Math.random() * NOT_FOUND_DESIGNS.length);
  const designId: NotFoundDesignId = NOT_FOUND_DESIGNS[index].id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex items-center justify-center">
      <NotFoundRenderer designId={designId} />
    </div>
  );
}
