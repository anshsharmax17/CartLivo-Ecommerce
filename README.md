<img width="1902" height="926" alt="image" src="https://github.com/user-attachments/assets/7a33228b-447a-414a-b872-137e13abbdeb" /><img width="1902" height="926" alt="image" src="https://github.com/user-attachments/assets/7a33228b-447a-414a-b872-137e13abbdeb" />🛒 NovaCart – Full Stack E-Commerce Platform

CartLivo is a full-stack e-commerce web application that allows users to browse products, add them to a cart, place orders, and make secure payments. It also includes an admin dashboard to manage products, users, and orders.

This project demonstrates real-world full-stack development including authentication, database integration, payment gateway integration, and admin management.

---

🚀 Live Demo

Frontend: https://cartlivo.netlify.app
Backend API: https://cartlivo-ecommerce.onrender.com

---

✨ Features

👤 User Features

- User signup and login (JWT authentication)
- Browse product catalog
- Search and filter products
- Add products to cart
- Checkout and place orders
- Secure payment integration with Razorpay
- View order confirmation
- User profile dashboard

🛠 Admin Features

- Admin login
- View all users
- Manage products
- Manage orders
- Order status updates
- Analytics dashboard

---

🧱 Tech Stack

Frontend

- HTML5
- CSS3
- JavaScript (Vanilla JS)

Backend

- Node.js
- Express.js
- REST API

Database

- Supabase (PostgreSQL)

Authentication

- JWT (JSON Web Tokens)

Payment Gateway

- Razorpay

Deployment

- Netlify (Frontend)
- Render (Backend)

---

📂 Project Structure

E-Commerce
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── routes
│   ├── server.js
│   └── package.json
│
├── css
├── js
├── index.html
├── products.html
├── cart.html
├── checkout.html
├── admin-dashboard.html
├── admin-orders.html
└── README.md

---

⚙️ Installation (Run Locally)

1️⃣ Clone the repository

git clone https://github.com/anshsharmax17/cartlivo.git
cd cartlivo

---

2️⃣ Install backend dependencies

cd backend
npm install

---

3️⃣ Create environment variables

Create ".env" inside backend

PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

---

4️⃣ Run the backend server

npm run dev

or

node server.js

---

5️⃣ Run the frontend

Open:

index.html

using Live Server in VS Code.

---

🔑 API Endpoints

Authentication

POST /api/signup
POST /api/login

Products

GET /api/products
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id

Orders

POST /api/orders
GET /api/orders
PUT /api/orders/:id

---

💳 Razorpay Test Card

For testing payments use:

Card Number: 4111 1111 1111 1111
Expiry: Any future date
CVV: 123
OTP: 123456

---

📸 Screenshots

Add screenshots of:

- Product page
<img width="1902" height="926" alt="image" src="https://github.com/user-attachments/assets/5d0a3731-9222-4861-9193-f81a053a60cd" />

- Cart page
<img width="1908" height="931" alt="image" src="https://github.com/user-attachments/assets/f985a915-01d6-47a0-9f86-fd65181e05bd" />

- Admin dashboard
<img width="1895" height="928" alt="image" src="https://github.com/user-attachments/assets/dc22a850-f129-4583-aa1f-4226eae8187f" />

---

🎯 Future Improvements

- Product image upload
- Wishlist feature
- Product reviews and ratings
- Order tracking
- Email notifications
- Mobile responsive optimization

---

👨‍💻 Author

Ansh Sharma

Software Engineering Student
Aspiring Full Stack Developer

GitHub: https://github.com/anshsharmax17

---

📄 License

This project is for educational and portfolio purposes.
