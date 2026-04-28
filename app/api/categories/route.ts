import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabasePublic
      .from("categories")
      .select("id, name, slug, parent_id, description")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    const categories = data ?? [];
    const topLevel = categories.filter((c) => !c.parent_id);
    const withSubcats = topLevel.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      subcategories: categories
        .filter((c) => c.parent_id === cat.id)
        .map((s) => ({ id: s.id, name: s.name, slug: s.slug })),
    }));

    return NextResponse.json({ data: withSubcats });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
