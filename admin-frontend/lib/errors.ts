import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  details?: unknown;
};

/** 200 OK */
export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ data }, { status });
}

/** 201 Created */
export function created<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ data }, { status: 201 });
}

/** 400 Bad Request */
export function badRequest(message: string, details?: unknown): NextResponse<ApiResponse> {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

/** 401 Unauthorized */
export function unauthorized(message = "Unauthorized"): NextResponse<ApiResponse> {
  return NextResponse.json({ error: message }, { status: 401 });
}

/** 403 Forbidden */
export function forbidden(message = "Forbidden"): NextResponse<ApiResponse> {
  return NextResponse.json({ error: message }, { status: 403 });
}

/** 404 Not Found */
export function notFound(message = "Not found"): NextResponse<ApiResponse> {
  return NextResponse.json({ error: message }, { status: 404 });
}

/** 500 Internal Server Error */
export function serverError(error: unknown): NextResponse<ApiResponse> {
  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  console.error("[API Error]", error);
  return NextResponse.json({ error: message }, { status: 500 });
}

/** Handle Zod validation errors */
export function validationError(error: ZodError): NextResponse<ApiResponse> {
  const details = error.issues.map((e) => ({
    path: e.path.join("."),
    message: e.message,
  }));
  return NextResponse.json(
    { error: "Validation failed", details },
    { status: 400 }
  );
}

/** Parse and validate request body with Zod schema */
export async function parseBody<T>(
  request: Request,
  schema: { parse: (data: unknown) => T }
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return { data: null, error: validationError(error) };
    }
    return { data: null, error: badRequest("Invalid JSON body") };
  }
}
