# Aspar - Premium E-Commerce Platform ⚡

Aspar is a full-stack, production-ready e-commerce platform built with modern web technologies. It offers a seamless shopping experience for customers and a comprehensive admin dashboard for store management.

## 🚀 Features

### For Customers
- **Modern UI/UX:** Responsive, clean, and accessible design built with Tailwind CSS and shadcn/ui.
- **Product Discovery:** Advanced filtering, sorting, and pagination.
- **Shopping Cart & Wishlist:** Persistent cart and wishlist functionality.
- **Secure Checkout:** (To be integrated) with order tracking and history.
- **User Authentication:** Secure JWT-based registration and login system.
- **Product Reviews:** Customers can leave ratings and reviews on purchased products.

### For Administrators
- **Comprehensive Dashboard:** Overview of sales, recent orders, and low stock alerts.
- **Product Management:** Full CRUD operations for products, including multi-image uploads via Cloudinary, variant management, and rich text descriptions.
- **Category Management:** Hierarchical category structures.
- **Order Processing:** View and update order statuses.
- **User Management:** View customers and manage access.
- **Banner Management:** Dynamic homepage banners.

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui & Radix UI primitives
- **State Management:** Redux Toolkit & RTK Query
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **File Uploads:** Cloudinary + Multer
- **Security:** Helmet, Express Rate Limit, bcryptjs

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- Cloudinary account

### Environment Setup

#### Backend (`/backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/E-commerce
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
COOKIE_EXPIRE=30
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
```

#### Frontend (`/frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Solanki028/Aspar--E-commerce-website.git
   cd Aspar--E-commerce-website
   ```

2. **Install backend dependencies and run server**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Install frontend dependencies and run server**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:5000`.

### Database Seeding
To populate the database with initial categories, products, and an admin user, run:
```bash
cd backend
npm run seed
```
**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `admin@123`

## 📄 License
This project is licensed under the MIT License.
