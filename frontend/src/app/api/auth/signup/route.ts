import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const existing = await prisma.profiles.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashed = await bcrypt.hash(password, 10);

        // Exemplo no signup handler
        const newUser = await prisma.profiles.create({
            data: {
                id: crypto.randomUUID(),
                email,
                password: hashed,
                name,
                balance: 0,
            },
        });

        return NextResponse.json({ message: "Account created successfully", id: newUser.id }, { status: 201 });

        // return NextResponse.json({ message: "Account created successfully" }, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
