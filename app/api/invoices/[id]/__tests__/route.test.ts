import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
    currentUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            ads: { findFirst: vi.fn() },
            workspaceMembers: { findFirst: vi.fn() },
        },
    },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("drizzle-orm")>();
    return {
        ...actual,
        eq: vi.fn((...args: unknown[]) => args),
        and: vi.fn((...args: unknown[]) => args),
    };
});

vi.mock("@react-pdf/renderer", () => ({
    renderToStream: vi.fn().mockResolvedValue(
        new ReadableStream({ start(c) { c.enqueue(new Uint8Array([37, 80, 68, 70])); c.close(); } })
    ),
}));

vi.mock("@/lib/pdf/invoice-template", () => ({
    InvoiceDocument: vi.fn().mockReturnValue(null),
}));

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { renderToStream } from "@react-pdf/renderer";
import { GET } from "../route";

const MOCK_USER = {
    id: "user_1",
    fullName: "Adam Wolfe",
    emailAddresses: [{ emailAddress: "adam@acme.com" }],
};

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_UUID_2 = "b2c3d4e5-f6a7-8901-bcde-f12345678901";

const MOCK_AD = {
    id: VALID_UUID,
    workspaceId: "ws_1",
    budget: "500",
    status: "active",
    createdAt: new Date("2026-01-01"),
    tool: { name: "Linear" },
};

const MOCK_MEMBER = { id: "mem_1", userId: "user_1", workspaceId: "ws_1" };

function makeRequest(id = VALID_UUID) {
    return new Request(`https://trytrackr.com/api/invoices/${id}`);
}

async function callRoute(id = VALID_UUID) {
    const req = makeRequest(id);
    const params = Promise.resolve({ id });
    return GET(req, { params });
}

describe("GET /api/invoices/[id]", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
        (db.query.ads.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_AD);
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_MEMBER);
        (renderToStream as ReturnType<typeof vi.fn>).mockResolvedValue(
            new ReadableStream({ start(c) { c.enqueue(new Uint8Array([37, 80, 68, 70])); c.close(); } })
        );
    });

    it("returns 401 when user is not authenticated", async () => {
        (currentUser as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await callRoute();
        expect(res.status).toBe(401);
    });

    it("returns 400 for invalid (non-UUID) id", async () => {
        const res = await callRoute("not-a-uuid");
        expect(res.status).toBe(400);
    });

    it("returns 404 when ad does not exist", async () => {
        (db.query.ads.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await callRoute();
        expect(res.status).toBe(404);
    });

    it("returns 401 when user is not a member of the ad's workspace", async () => {
        (db.query.workspaceMembers.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        const res = await callRoute();
        expect(res.status).toBe(401);
    });

    it("returns 200 with PDF content-type on success", async () => {
        const res = await callRoute();
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("application/pdf");
    });

    it("sets Content-Disposition header with ad id prefix", async () => {
        const res = await callRoute(VALID_UUID);
        const disposition = res.headers.get("Content-Disposition");
        expect(disposition).toContain("attachment");
        expect(disposition).toContain(VALID_UUID.slice(0, 8)); // first 8 chars
    });

    it("calls renderToStream to generate the PDF", async () => {
        await callRoute();
        expect(renderToStream).toHaveBeenCalledTimes(1);
    });

    it("returns 500 when renderToStream throws", async () => {
        (renderToStream as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("PDF error"));
        const res = await callRoute();
        expect(res.status).toBe(500);
    });

    it("uses the ad id from the DB record in the filename", async () => {
        (db.query.ads.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_AD,
            id: VALID_UUID_2,
        });
        const res = await callRoute(VALID_UUID_2);
        const disposition = res.headers.get("Content-Disposition");
        expect(disposition).toContain(VALID_UUID_2.slice(0, 8)); // first 8 chars
    });

    it("returns 404 for draft ads (invoice not yet available)", async () => {
        (db.query.ads.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_AD,
            status: "draft",
        });
        const res = await callRoute();
        expect(res.status).toBe(404);
    });

    it("returns 404 for paused ads (invoice not available)", async () => {
        (db.query.ads.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            ...MOCK_AD,
            status: "paused",
        });
        const res = await callRoute();
        expect(res.status).toBe(404);
    });
});
