const request = require("supertest");
const app = require("../server");
const Blog = require("../model/Blog");
const User = require("../model/User");
const mongoose = require("mongoose")

describe("Blog Endpoints", () => {
    let authToken;
    let userId;
    let testBlogId;

    jest.setTimeout(15000);

    beforeEach(async () => {
        await User.deleteMany({});
        await Blog.deleteMany({});

        const userData = {
            email: "test@example.com",
            password: "password123",
            first_name: "Test",
            last_name: "Last Test",
            address: "123 Test St",
        };

        const registerResponse = await request(app)
            .post("/auth/register")
            .send(userData);

        userId = registerResponse.body.id;
        const loginResponse = await request(app).post("/auth/login").send({
            email: userData.email,
            password: userData.password,
        });

        authToken = `Bearer ${loginResponse.body.accessToken}`;
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Blog.deleteMany({});
        await mongoose.connection.close();
    });

    describe("POST /blogs", () => {
        it("should create a new blog", async () => {
            const blogData = {
                title: "Test Blog",
                description: "Test Description",
                body: "Test Content",
                tags: ["alpha", "magnesium"],
            };

            const response = await request(app)
                .post("/api/blogs")
                .set("Authorization", authToken)
                .send(blogData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Blog created successfully");
        });

        it("should return 400 for invalid blog data", async () => {
            const invalidData = {
                description: "Test Description",
            };

            const response = await request(app)
                .post("/api/blogs")
                .set("Authorization", authToken)
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty("message");
        });

        it("should return 401 without authentication", async () => {
            const blogData = {
                title: "Test Blog",
                description: "Test Description",
                body: "This is a test blog body content",
                tags: ["test", "blog"],
            };

            await request(app).post("/api/blogs").send(blogData).expect(401);
        });
    });

    describe("GET /blogs", () => {
        beforeEach(async () => {
            const testBlogs = [
                {
                    title: "Published Blog 1",
                    description: "Description 1",
                    body: "Body 1",
                    author: userId,
                    state: "published",
                    tags: ["test"]
                },
                {
                    title: "Draft Blog 1",
                    description: "Description 2",
                    body: "Body 2",
                    author: userId,
                    state: "draft",
                    tags: ["draft"]
                },
                {
                    title: "Published Blog 2",
                    description: "Description 3",
                    body: "Body 3",
                    author: userId,
                    state: "published",
                    tags: ["test"]
                }
            ];

            const createdBlogs = await Blog.create(testBlogs);
            testBlogId = createdBlogs[0]._id;
        });

        it("should get all published blogs", async () => {
            const response = await request(app).get("/api/blogs?state=published").expect(200);

            expect(response.body.data).toHaveProperty("blogs");
            expect(Array.isArray(response.body.data.blogs)).toBe(true);
            response.body.data.blogs.forEach((blog) => {
                expect(blog.state).toBe("published");
            });
        });

        it("should filter blogs by state", async () => {
            const response = await request(app)
                .get("/api/blogs?state=published")
                .expect(200);

            expect(response.body.data).toHaveProperty("blogs");
            response.body.data.blogs.forEach((blog) => {
                expect(blog.state).toBe("published");
            });
        });

        it("should paginate results", async () => {
            const response = await request(app)
                .get("/api/blogs?page=1&limit=2")
                .expect(200);

            expect(response.body.data).toHaveProperty("blogs");
            expect(response.body.data.blogs.length).toBeLessThanOrEqual(2);
        });
    });

    describe("PUT /blogs/:id", () => {
        let testBlogId;

        beforeEach(async () => {
            const testBlog = await Blog.create({
                title: "Original Title",
                description: "Original Description",
                body: "Original Body",
                author: userId,
                state: "draft",
                tags: ["original"],
            });
            testBlogId = testBlog._id;
        });

        it("should update own blog", async () => {
            const updateData = {
                title: "Updated Title",
                description: "Updated Description",
                body: "Updated Body",
            };

            const response = await request(app)
                .put(`/api/blogs/${testBlogId}`)
                .set("Authorization", authToken)
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty("message");
        });

        it("should not update other user's blog", async () => {
            const otherUser = await User.create({
                email: "other@example.com",
                password: "password123",
                first_name: "Other",
                last_name: "User",
                address: "456 Another St",
            });

            const otherBlog = await Blog.create({
                title: "Another User's Blog",
                description: "Description",
                body: "Body",
                author: otherUser._id,
                state: "draft",
                tags: ["another"]
            });

            const updateData = { title: "Hacked Title" };

            await request(app)
                .put(`/api/blogs/${otherBlog._id}`)
                .set("Authorization", authToken)
                .send(updateData)
                .expect(403);
        });

        it("should return 404 for non-existent blog", async () => {
            const fakeId = "507f1f77bcf86cd799439011";

            await request(app)
                .put(`/api/blogs/${fakeId}`)
                .set("Authorization", authToken)
                .send({ title: "New Title" })
                .expect(404);
        });
    });

    describe("DELETE /blogs/:id", () => {
        let blogId;

        beforeEach(async () => {
            const blog = await Blog.create({
                title: "Blog to Delete",
                description: "Description",
                body: "Body",
                author: userId,
                state: "draft",
                tags: ["delete"]
            });
            blogId = blog._id;
        });

        it("should delete own blog", async () => {
            await request(app)
                .delete(`/api/blogs/${blogId}`)
                .set("Authorization", authToken)
                .expect(200);

            const deletedBlog = await Blog.findById(blogId);
            expect(deletedBlog).toBeNull();
        });

        it("should not delete other user's blog", async () => {
            const otherUser = await User.create({
                email: "other@example.com",
                password: "password123",
                first_name: "Other",
                last_name: "last"
            });

            const otherBlog = await Blog.create({
                title: "Other's Blog",
                description: "Description",
                body: "Content",
                author: otherUser._id,
                state: "draft",
                tags: ["another"]
            });

            await request(app)
                .delete(`/api/blogs/${otherBlog._id}`)
                .set("Authorization", authToken)
                .expect(403);
        });
    });
});
