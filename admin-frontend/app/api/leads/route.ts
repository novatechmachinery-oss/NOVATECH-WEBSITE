import { type NextRequest } from "next/server";
import { leadService } from "@/services/lead.service";
import { CreateLeadSchema } from "@/lib/validation";
import { ok, created, serverError, parseBody } from "@/lib/errors";

export async function GET() {
  try {
    const leads = await leadService.list();
    return ok(leads);
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data, error } = await parseBody(request, CreateLeadSchema);
    if (error) return error;
    const lead = await leadService.create({
      name: data.name,
      company: data.company,
      email: data.email || undefined,
      phone: data.phone,
      interestedIn: data.interestedIn,
      message: data.message,
      stage: data.stage,
      source: data.source,
    });
    return created(lead);
  } catch (err) {
    return serverError(err);
  }
}
