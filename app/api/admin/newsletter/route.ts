import { NextResponse } from "next/server";
import { getAllSubscribers, updateSubscriberStatus, deleteSubscriber } from "@/lib/newsletter.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const subscribers = await getAllSubscribers();
    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("Failed to fetch newsletter subscribers:", error);
    return NextResponse.json(
      { message: "Failed to fetch subscribers" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const subscriberId = payload.subscriberId as string;
    const status = payload.status as "active" | "inactive";

    if (!subscriberId || (status !== "active" && status !== "inactive")) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const updated = await updateSubscriberStatus(subscriberId, status);
    if (!updated) {
      return NextResponse.json(
        { message: "Subscriber not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update subscriber status:", error);
    return NextResponse.json(
      { message: "Failed to update subscriber" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const subscriberId = payload.subscriberId as string;

    if (!subscriberId) {
      return NextResponse.json(
        { message: "Missing subscriberId" },
        { status: 400 },
      );
    }

    await deleteSubscriber(subscriberId);
    return NextResponse.json({ message: "Subscriber deleted successfully" });
  } catch (error) {
    console.error("Failed to delete subscriber:", error);
    return NextResponse.json(
      { message: "Failed to delete subscriber" },
      { status: 500 },
    );
  }
}
