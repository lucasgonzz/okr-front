import { ObjectiveDetailPageClient } from "./objective-detail-page-client";
import { API_URL } from "@/lib/config";

async function fetchObjectiveIdsForExport(): Promise<{ id: string }[]> {
  const quarter = process.env.STATIC_EXPORT_QUARTER ?? "Q4-2024";
  try {
    const token = process.env.STATIC_EXPORT_API_TOKEN;
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(
      `${API_URL}/objectives?quarter=${encodeURIComponent(quarter)}`,
      { headers, cache: "no-store" }
    );
    if (!res.ok) {
      return [];
    }
    const json: unknown = await res.json();
    const data =
      json && typeof json === "object" && "data" in json
        ? (json as { data: unknown }).data
        : undefined;
    if (!Array.isArray(data)) {
      return [];
    }
    return data
      .filter((o) => Boolean(o && typeof o === "object" && "id" in o))
      .map((o) => ({ id: String((o as { id: string }).id) }));
  } catch {
    return [];
  }
}

/**
 * Con `output: 'export'`, Next.js falla si `generateStaticParams` devuelve [] (mensaje engañoso
 * "missing generateStaticParams"). Se usa un id placeholder solo para el build cuando no hay API/token.
 */
const EXPORT_BUILD_PLACEHOLDER_ID = "__export_build__";

export async function generateStaticParams() {
  const ids = await fetchObjectiveIdsForExport();
  if (ids.length > 0) {
    return ids;
  }
  return [{ id: EXPORT_BUILD_PLACEHOLDER_ID }];
}

export default async function ObjectiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ObjectiveDetailPageClient id={id} />;
}
