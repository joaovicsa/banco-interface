import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET!; 

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const profile = await prisma.profiles.findUnique({ where: { email } });
        if (!profile) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, profile.password);
        if (!valid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const token = jwt.sign({ id: profile.id, email: profile.email }, JWT_SECRET, { expiresIn: "7d" });

        const res = NextResponse.json({
            message: "Login successful",
            id: profile.id,
            name: profile.name,
            email: profile.email,
        });

        res.cookies.set("auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return res;
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
