import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isProduction } from "@/utils/environment"; // adjust path as needed

export function middleware(req: NextRequest) {
    // Skip auth check in development mode
    if (!isProduction()) {
        return NextResponse.next();
    }

    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiry = payload.exp * 1000;

        if (Date.now() >= expiry) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    } catch {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/profile/:path*", "/vaults/:path*"],
};
