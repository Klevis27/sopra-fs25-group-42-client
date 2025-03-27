import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("accessToken")?.value; // Access token from cookies

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url)); // Redirect to login if no token
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        const expiry = payload.exp * 1000;

        if (Date.now() >= expiry) {
            return NextResponse.redirect(new URL("/login", req.url)); // Redirect if expired
        }
    } catch {
        return NextResponse.redirect(new URL("/login", req.url)); // Redirect if token is invalid
    }

    return NextResponse.next(); // Continue if token is valid
}

export const config = {
    matcher: ["/profile/:path*", "/vaults/:path*"], // Protects all routes under /profile and /vaults
};
