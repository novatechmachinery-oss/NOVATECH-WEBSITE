import { type NextRequest, NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const machineType = searchParams.get("machineType");
    const sortBy = searchParams.get("sortBy") ?? "newest";

    let query = supabasePublic
      .from("machines")
      .select("*")
      .eq("is_published", true);

    if (category) query = query.eq("category", category);
    if (subcategory) query = query.eq("subcategory", subcategory);
    if (machineType) query = query.eq("machine_type", machineType);
    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = sortBy === "a-z"
      ? query.order("name", { ascending: true })
      : query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    // Map DB snake_case to camelCase for frontend
    const machines = (data ?? []).map((m) => ({
      id: m.id,
      title: m.name,
      name: m.name,
      brand: m.brand,
      model: m.model,
      category: m.category,
      subcategory: m.subcategory,
      machineType: m.machine_type,
      condition: m.condition,
      stockStatus: m.stock_status,
      price: m.price,
      description: m.description,
      specifications: m.specifications,
      images: m.images,
      imageSrc: m.images?.[0] ?? "/images/hero-banner-Bt56BS_O.webp",
      imageAlt: m.name,
      location: m.country_of_origin ? `${m.country_of_origin} Stock` : "In Stock",
    }));

    return NextResponse.json({ data: machines });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
