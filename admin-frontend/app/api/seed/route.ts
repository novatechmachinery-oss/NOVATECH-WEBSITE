import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { ok, unauthorized, serverError } from "@/lib/errors";

// Seed endpoint — protected by a secret header
// Call: POST /api/seed with header X-Seed-Secret: <your-seed-secret>
export async function POST(request: NextRequest) {
  try {
    const seedSecret = process.env.SEED_SECRET ?? "novatech-seed-dev";
    const providedSecret = request.headers.get("X-Seed-Secret");
    if (providedSecret !== seedSecret) return unauthorized("Invalid seed secret");

    const results: string[] = [];

    // Seed admin settings
    const { error: settingsErr } = await supabase.from("admin_settings").upsert({
      id: "global",
      profile: { fullName: "Admin Novatech Machinery", phone: "+91 9646255855", email: "admin@novatechmachinery.com" },
      smtp: { host: "smtp.gmail.com", port: "587", username: "admin@novatechmachinery.com", password: "", fromEmail: "info@novatechmachinery.com", fromName: "Novatech Machinery", useSsl: false },
      tracking: { googleAnalyticsId: "G-P6982NCZTC", metaPixelId: "1254549116261073", microsoftClarityId: "w8fhp8peo" },
      security: { passwordHash: "", passwordUpdatedAt: null },
    });
    if (!settingsErr) results.push("Settings seeded");

    // Seed SEO global
    const { error: seoErr } = await supabase.from("seo_global").upsert({
      id: "global",
      site_name: "Novatech Machinery",
      site_url: "https://novatechmachinery.com",
      title_suffix: "| Novatech Machinery",
      default_meta_description: "Used industrial machinery, CNC systems, fabrication equipment and production lines sourced by Novatech Machinery.",
      default_keywords: "used machinery, industrial machines, cnc machines, novatech machinery, machine dealers",
    });
    if (!seoErr) results.push("SEO global seeded");

    // Seed machines
    const machines = [
      { id: "MCH-1001", name: "Heavy Duty CNC Slant Bed Lathe", brand: "Doosan", model: "Puma GT 2600", serial_number: "SN-88342", country_of_origin: "South Korea", price: 92000, category: "Metal Working Machinery", subcategory: "Heavy Duty Lathes", condition: "Used", stock_status: "In Stock", machine_type: "CNC", description: "Rigid slant bed lathe for high accuracy turning in medium and heavy production.", specifications: [{ key: "Swing", value: "660 mm" }, { key: "Chuck", value: "10 inch" }, { key: "Control", value: "Fanuc i Series" }], images: ["https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7"] },
      { id: "MCH-1002", name: "CNC Gear Hobber", brand: "Pfauter", model: "PE 160", serial_number: "SN-20455", country_of_origin: "Germany", price: 68000, category: "Metal Working Machinery", subcategory: "Gear Hobbers", condition: "Used", stock_status: "In Stock", machine_type: "Conventional", description: "Gear hobbing machine for repeatable cutting quality.", specifications: [{ key: "Max Diameter", value: "160 mm" }, { key: "Module", value: "6" }, { key: "Voltage", value: "415V" }], images: ["https://images.unsplash.com/photo-1581092918484-8313f4e2dd4e"] },
      { id: "MCH-1003", name: "UPETROM Heavy-Duty CNC Lathe", brand: "UPETROM", model: "UHD 40", serial_number: "SN-45990", country_of_origin: "Romania", price: 78000, category: "Metal Working Machinery", subcategory: "Heavy Duty Lathes", condition: "Used", stock_status: "In Stock", machine_type: "CNC", description: "Heavy-duty turning solution for large shaft components.", specifications: [{ key: "Bed Length", value: "4000 mm" }, { key: "Power", value: "22 kW" }], images: ["https://images.unsplash.com/photo-1581093458791-9f3c3900df4b"] },
      { id: "MCH-1004", name: "4 Rolls Hydraulic Plate Bender", brand: "Faccin", model: "4HEL 1264", serial_number: "SN-77122", country_of_origin: "Italy", price: 126000, category: "Metal Working Machinery", subcategory: "Bending Machines", condition: "Used", stock_status: "In Stock", machine_type: "CNC", description: "Four-roll plate rolling machine for precise bending.", specifications: [{ key: "Rolling Width", value: "3100 mm" }, { key: "Thickness", value: "25 mm" }], images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"] },
      { id: "MCH-1005", name: "Horizontal Machining Centre", brand: "Doosan", model: "HM 500", serial_number: "SN-12001", country_of_origin: "South Korea", price: 112000, category: "Metal Working Machinery", subcategory: "Horizontal Machining Centres", condition: "Used", stock_status: "Limited", machine_type: "CNC", description: "Horizontal machining centre for multi-face machining.", specifications: [{ key: "Pallet Size", value: "500 x 500" }, { key: "Spindle", value: "12000 rpm" }], images: ["https://images.unsplash.com/photo-1517048676732-d65bc937f952"] },
      { id: "MCH-1006", name: "CNC Turning and Milling Center", brand: "DMG Gildemeister", model: "CTX Beta 1250", serial_number: "SN-45003", country_of_origin: "Germany", price: 143000, category: "Metal Working Machinery", subcategory: "Turning and Milling Centres", condition: "Refurbished", stock_status: "In Stock", machine_type: "CNC", description: "Combined turning and milling center for complex parts.", specifications: [{ key: "Axis", value: "5 Axis" }, { key: "Controller", value: "Siemens" }], images: ["https://images.unsplash.com/photo-1497366754035-f200968a6e72"] },
    ];
    const { error: machinesErr } = await supabase.from("machines").upsert(machines);
    if (!machinesErr) results.push(`${machines.length} machines seeded`);

    // Seed leads
    const { error: leadsErr } = await supabase.from("leads").insert([
      { name: "Manjunatha", company: "Manjunatha Swamy Engineering Services", interested_in: "Gear Hobber WMW Modul ZFWZ 1250/1500", stage: "New" },
      { name: "Gurdev Singh", company: "RC Engineering", interested_in: "GEAR HOBBER WMW MODUL ZFWZ 6300", stage: "New" },
      { name: "Adeel Khan", company: "Khan Fabrication Works", interested_in: "4 Rolls Hydraulic Plate Bender", stage: "Contacted" },
    ]).select();
    if (!leadsErr) results.push("3 leads seeded");

    // Seed admin user (password: admin123)
    const passwordHash = "240be518fabd2724ddb6f04eeb1da5967448d7e831d1d3caebf4e2d394c7658d"; // SHA-256 of "admin123"
    const { error: usersErr } = await supabase.from("users").upsert([
      { name: "Admin Novatech Machinery", email: "admin@novatechmachinery.com", phone: "+91 9646255855", role: "Super Admin", password_hash: passwordHash, joined: "2026-04-06" },
      { name: "Sales Manager", email: "sales@novatechmachinery.com", phone: "+91 9090909090", role: "Sales", password_hash: passwordHash, joined: "2026-04-11" },
    ], { onConflict: "email" });
    if (!usersErr) results.push("2 users seeded");

    return ok({ seeded: results });
  } catch (err) {
    return serverError(err);
  }
}
