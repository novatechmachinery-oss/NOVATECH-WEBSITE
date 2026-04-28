import { type NextRequest, NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabasePublic
      .from("machines")
      .select("*")
      .eq("id", id)
      .eq("is_published", true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Machine not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: data.id,
        name: data.name,
        brand: data.brand,
        model: data.model,
        category: data.category,
        subcategory: data.subcategory,
        machineType: data.machine_type,
        condition: data.condition,
        stockStatus: data.stock_status,
        price: data.price,
        description: data.description,
        specifications: data.specifications,
        images: data.images,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
