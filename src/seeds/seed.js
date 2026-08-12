import bcrypt from "bcrypt";
import dotenv from "dotenv";
import prisma from "../config/db.js";
import { userData } from "./user-data.js";

dotenv.config();

const seed = async () => {
    try {
        console.log("Starting seeding...");

        // Clear existing records
        await prisma.address.deleteMany({});
        await prisma.user.deleteMany({});
        console.log("Users and Addresses cleared");

        const hashedUsers = await Promise.all(
            userData.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, 10),
            }))
        );

        const createdUsers = await Promise.all(
            hashedUsers.map((user) =>
                prisma.user.create({
                    data: user,
                })
            )
        );

        console.log(`${createdUsers.length} users seeded`);
        console.log("Seeding complete");
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
};

seed();