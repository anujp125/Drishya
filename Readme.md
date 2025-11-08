# 🎬 DRISHYA — Video Streaming Platform

> **Drishya** is a full-stack video streaming platform built using the **MERN (MongoDB, Express, React, Node.js)** stack. It enables users to register, upload videos, and stream content seamlessly with secure authentication and Cloudinary integration.

---

## 🚀 Features

* 🔐 **User Authentication** – Secure registration and login with JWT and bcrypt.
* 🧠 **Async Error Handling** – Centralized error handling using `asyncHandler` and `ApiError`.
* 📤 **Cloudinary Integration** – Media uploads handled via Multer + Cloudinary.
* 🧾 **Structured API Responses** – Consistent API formatting with `ApiResponse`.
* 🧩 **Modular Architecture** – Clean separation of controllers, routes, models, and utilities.
* ⚙️ **Environment Configurable** – All credentials managed through `.env`.
* 🌐 **CORS Enabled** – Secure cross-origin communication for frontend integration.

---

## 🧱 Tech Stack

| Category           | Technology                  |
| ------------------ | --------------------------- |
| **Backend**        | Node.js, Express.js         |
| **Database**       | MongoDB + Mongoose          |
| **File Uploads**   | Multer, Cloudinary          |
| **Authentication** | JWT, bcrypt                 |
| **Other Tools**    | dotenv, cors, cookie-parser |

---

## 📂 Folder Structure

```
drishya/
├── public/                      # Static files & temp uploads
├── src/
│   ├── config/                  # Database, Cloudinary & constants configs
│   ├── controllers/             # Business logic for routes
│   ├── db/                      # Database connection setup
│   ├── middlewares/             # Multer, error & auth middlewares
│   ├── models/                  # MongoDB schemas
│   ├── routes/                  # Route definitions
│   ├── utils/                   # Helpers like ApiError, ApiResponse
│   ├── app.js                   # Express app setup
│   └── index.js                 # Server entry point
├── .env                         # Environment variables
├── package.json                 # Project dependencies & scripts
├── Readme.md                    # Documentation
└── ...other config files
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net
DB_NAME=drishya
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d
```

---

## 🧠 How to Run Locally

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/drishya.git
   cd drishya
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Add `.env` file:**
   Configure your environment variables as shown above.

4. **Run Development Server:**

   ```bash
   npm run dev
   ```

5. **Server Starts On:**

   ```
   http://localhost:8000
   ```

---

## 🧩 API Endpoints

| Method   | Endpoint                 | Description                   |
| -------- | ------------------------ | ----------------------------- |
| **POST** | `/api/v1/users/register` | Register a new user           |
| **POST** | `/api/v1/users/login`    | Login user *(coming soon)*    |
| **GET**  | `/api/v1/videos`         | Fetch all videos *(future)*   |
| **POST** | `/api/v1/videos/upload`  | Upload a new video *(future)* |

---

## 🧾 Example API Response

**Success:**

```json
{
  "statusCode": 201,
  "data": {
    "_id": "672d4fe73b2a3f12417d2eaa",
    "username": "anuj",
    "email": "anuj@example.com"
  },
  "message": "User registered successfully!",
  "success": true
}
```

**Error:**

```json
{
  "success": false,
  "message": "User already exists!",
  "statusCode": 409,
  "errors": [],
  "data": null
}
```

---

## 📦 NPM Scripts

| Script    | Command                                 | Description             |
| --------- | --------------------------------------- | ----------------------- |
| **dev**   | `nodemon -r dotenv/config src/index.js` | Run in development mode |
| **start** | `node src/index.js`                     | Run in production mode  |

---

## 🧰 Developer Guidelines

* Keep controllers small and focused.
* Use `asyncHandler` for all async routes.
* Always throw `ApiError` for predictable error handling.
* Return `ApiResponse` for successful API calls.
* Store temp uploads in `public/temp` before Cloudinary upload.

---

## 🧑‍💻 Author

**Anuj**
🎓 B.Tech in AI & Data Science – LNCT, Bhopal
💡 Interested in Data Science, AI, and Full Stack Development.

---

## 📜 License

This project is licensed under the **MIT License** — free to use and modify with proper attribution.

---

### 🌟 Future Roadmap

* JWT-based authentication & refresh tokens.
* Video compression & adaptive streaming.
* Comments, likes, and playlists system.
* Admin dashboard for content moderation.
* Full frontend using React + Tailwind.

> **Drishya — Visualize. Upload. Stream.** 🎥
