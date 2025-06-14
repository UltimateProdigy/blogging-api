# 📝 Blogging API

A secure and fully-featured RESTful API for managing blog posts. Includes user authentication, blog creation, publishing, filtering, and pagination functionalities. Built with **Node.js**, **Express.js**, **MongoDB**, and **JWT**.

---

## 🚀 Features

-   ✅ User registration & login with JWT authentication
-   📝 Create, read, update, delete (CRUD) blog posts
-   🗃️ Draft and publish blog states
-   🔍 Search, filter, and paginate blog posts
-   🔐 Secure routes with authentication middleware
-   📏 Input validation with Joi

---

## 🛠️ Tech Stack

-   **Node.js**
-   **Express.js**
-   **MongoDB** with **Mongoose**
-   **JWT** (JSON Web Token) for authentication
-   **bcrypt** for password hashing
-   **Joi** for request body validation

---

## 📦 Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/UltimateProdigy/blogging-api.git
    cd blogging-api
    ```

# Running the API

```bash
npm run dev

```

# Environment Variables

PORT=5000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret_key

## Auth Endpoint

| Method | Endpoint      | Description             |
| ------ | ------------- | ----------------------- |
| POST   | /api/login    | Login and receive a JWT |
| POST   | /api/register | Register a new user     |

## Blog Endpoint

| Method | Endpoint               | Description                         |
| ------ | ---------------------- | ----------------------------------- |
| POST   | /api/blogs             | Create a new blog (initially draft) |
| PUT    | /api/blogs/:id         | Update your blog                    |
| DELETE | /api/blogs/:id         | Delete your blog                    |
| GET    | /api/blogs/my-blogs    | Get your own blogs                  |
| POST   | /api/blogs/publish/:id | Publish a blog                      |

# Parameter	Type	Description
state	string	Filter by blog state: draft, published
search	string	Search title, tags, or author name
author	string	Filter by author ID or name
page	number	Page number for pagination
limit	number	Results per page
sortBy	string	Sort by: read_count, reading_time, timestamp
order	string	asc or desc (default is desc)


# Authentication
Authorization: Bearer <your_access_token>
