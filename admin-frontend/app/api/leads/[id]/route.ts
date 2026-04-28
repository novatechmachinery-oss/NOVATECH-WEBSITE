import { type NextRequest } from "next/server";
import { leadService } from "@/services/lead.service";
import { UpdateLeadSchema } from "@/lib/validation";
import { ok, notFound, serverError, parseBody } from "@/lib/errors";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lead = await leadService.get(id);
    if (!lead) return notFound("Lead not found");
    return ok(lead);
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await parseBody(request, UpdateLeadSchema);
    if (error) return error;
    const lead = await leadService.update(id, {
      name: data.name,
      company: data.company,
      email: data.email || undefined,
      phone: data.phone,
      interestedIn: data.interestedIn,
      message: data.message,
      stage: data.stage,
    });
    return ok(lead);
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await leadService.delete(id);
    return ok({ message: "Lead deleted" });
  } catch (err) {
    return serverError(err);
  }
}
