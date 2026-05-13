/**
 * Home page. Server component that renders the BlueprintList client component.
 * The list itself uses React Query to fetch /api/blueprints — see
 * components/blueprint/blueprint-list.tsx.
 */
import { BlueprintList } from "@/components/blueprint/blueprint-list";

export default function HomePage() {
  return <BlueprintList />;
}
