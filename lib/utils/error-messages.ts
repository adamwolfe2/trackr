export function getUserFriendlyError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("fetch") || msg.includes("network") || msg.includes("failed to fetch")) {
      return "Network error — check your connection and try again.";
    }
    if (msg.includes("rate limit") || msg.includes("429") || msg.includes("too many")) {
      return "Too many requests — please wait a moment and try again.";
    }
    if (msg.includes("unauthorized") || msg.includes("401") || msg.includes("forbidden") || msg.includes("403")) {
      return "Session expired — please refresh the page.";
    }
    if (msg.includes("not found") || msg.includes("404")) {
      return "Resource not found — it may have been deleted.";
    }
    if (msg.includes("timeout") || msg.includes("timed out")) {
      return "Request timed out — please try again.";
    }
    // If the error message is already user-friendly (not a stack trace), pass it through
    if (msg.length < 200 && !msg.includes("at ") && !msg.includes("error:")) {
      return error.message;
    }
  }
  return "Something went wrong — please try again.";
}
