const request = require("supertest");
const app = require("../server");
const User = require("../model/User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

describe("Authentication", () => {
    beforeEach(async () => {
        await User.deleteMany({});
    }, 10000);
    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    }, 10000);

    describe("POST /auth/register", () => {
        it("should register a new user", async () => {
            const userData = {
                first_name: "John",
                last_name: "Doe",
                email: "john@example.com",
                password: "password123",
                address: "123 Test St",
            };

            const response = await request(app)
                .post("/auth/register")
                .send(userData)
                .expect(201);

            expect(response.body.message).toBe("Account Successfully Created");
            expect(response.body).toHaveProperty("id");

            const createdUser = await User.findOne({ email: userData.email });
            expect(createdUser).toBeTruthy();
            expect(createdUser.first_name).toBe(userData.first_name);
        });

        it("should not register user with existing email", async () => {
            const userData = {
                first_name: "John",
                last_name: "Doe",
                email: "john@example.com",
                password: "password123",
                address: "123 Test St",
            };

            const hashedPwd = await bcrypt.hash(userData.password, 10);
            await User.create({
                ...userData,
                password: hashedPwd,
            });

            const response = await request(app)
                .post("/auth/register")
                .send(userData)
                .expect(409);

            expect(response.body).toEqual({});
        });

        it("should return 500 for missing required fields", async () => {
            const incompleteData = {
                email: "test@example.com",
                password: "password123",
            };

            await request(app)
                .post("/auth/register")
                .send(incompleteData)
                .expect(500);
        });
    });

    describe("POST /auth/login", () => {
        let testUser;

        beforeEach(async () => {
            const hashedPwd = await bcrypt.hash("password123", 10);
            testUser = await User.create({
                first_name: "John",
                last_name: "Doe",
                email: "john@example.com",
                password: hashedPwd,
                address: "123 Test St",
            });
        });

        it("should login with valid credentials", async () => {
            const loginData = {
                email: "john@example.com",
                password: "password123",
            };

            const response = await request(app)
                .post("/auth/login")
                .send(loginData)
                .expect(200);

            expect(response.body).toHaveProperty("accessToken");
            expect(response.body.message).toBe("Login Successful");
        });

        it("should reject invalid credentials", async () => {
            const loginData = {
                email: "john@example.com",
                password: "wrongpassword",
            };

            await request(app).post("/auth/login").send(loginData).expect(401);
        });

        it("should reject login for non-existent user", async () => {
            const loginData = {
                email: "nonexistent@example.com",
                password: "password123",
            };

            await request(app).post("/auth/login").send(loginData).expect(401);
        });
    });
});
