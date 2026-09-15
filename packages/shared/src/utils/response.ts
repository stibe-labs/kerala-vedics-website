// ======================================================
// Shared HTTP Response Helpers
// Consistent JSON responses across all microservices
// ======================================================

export type ApiResponse<T = unknown> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };

export function ok<T>(data: T, message?: string): Response {
  return new Response(
    JSON.stringify({ success: true, ...( message ? { message } : {}), ...(data !== undefined ? (typeof data === "object" && data !== null ? data : { data }) : {}) }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export function created<T>(data: T, message?: string): Response {
  return new Response(
    JSON.stringify({ success: true, ...(message ? { message } : {}), ...(typeof data === "object" && data !== null ? data : { data }) }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export function err(message: string, status = 400): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function unauthorized(message = "Unauthorized"): Response {
  return err(message, 401);
}

export function forbidden(message = "Forbidden"): Response {
  return err(message, 403);
}

export function notFound(message = "Not found"): Response {
  return err(message, 404);
}

export function conflict(message: string): Response {
  return err(message, 409);
}

export function serverError(message = "Internal server error"): Response {
  return err(message, 500);
}
