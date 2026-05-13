/**
 * /blueprints/new — kept as a redirect target. The actual create flow runs
 * through the New Blueprint dialog on the home page; this URL is a friendly
 * shortcut that bounces back to the list (the dialog opens there).
 *
 * Phase 2 may repurpose this to a dedicated full-page create form if useful.
 */
import { redirect } from "next/navigation";

export default function NewBlueprintRedirectPage() {
  redirect("/");
}
