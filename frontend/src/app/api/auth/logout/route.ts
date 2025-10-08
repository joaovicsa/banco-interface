import { NextResponse } from "next/server";

export async function POST() {
    try {
        const res = NextResponse.json({ message: "Logout successful" });


        res.cookies.set("auth-token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            expires: new Date(0),
        });

        return res;
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}