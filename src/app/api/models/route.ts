import { Cursor } from "@cursor/sdk";
import { getApiKey } from "@/lib/sdk/config";

export async function GET() {
  try {
    const models = await Cursor.models.list({ apiKey: getApiKey() });
    const formatted = models.map((m) => ({
      id: m.id,
      label: m.displayName ?? m.id,
    }));
    return Response.json({ models: formatted });
  } catch (err) {
    // Fallback when API key missing or API unavailable
    return Response.json({
      models: [
        { id: "composer-2.5", label: "Composer 2.5" },
        { id: "auto", label: "Auto" },
      ],
      warning: err instanceof Error ? err.message : undefined,
    });
  }
}
