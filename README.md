# PantryMind - Smart Pantry Management System

A comprehensive full-stack application for managing kitchen inventory with OCR capabilities for receipt scanning and AI-powered item extraction.

## 🏗️ Architecture

PantryMind consists of three main components:

- **Backend**: Spring Boot REST API with PostgreSQL database
- **Frontend**: React.js with Redux for state management
- **Python OCR Service**: FastAPI service for receipt processing and item extraction

## 🚀 Features

- **User Management**: Registration, authentication, profile management, and role-based access control
- **Kitchen Management**: Create kitchens, invite members, manage roles
- **Inventory Management**: CRUD operations for pantry items with categories and units
- **OCR Integration**: Upload receipts and automatically extract items
- **Real-time Updates**: Redux-powered state management for seamless UX

## 📋 Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 12+
- Python 3.8+ (for OCR service)
- Maven 3.6+

## 🛠️ Installation & Setup

### 1. Database Setup

```sql
-- Create database
CREATE DATABASE PantryMind;

-- Create user (optional)
CREATE USER pantry_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE PantryMind TO pantry_user;
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Configure your .env file with:
# DATABASE_URL=jdbc:postgresql://localhost:5432/PantryMind
# DATABASE_USERNAME=your_username
# DATABASE_PASSWORD=your_password
# JWT_SECRET=your_jwt_secret

# Run the application
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Python OCR Service Setup (Optional)

```bash
cd python-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure .env file with your API keys

# Run the service
python -m app.main
```

The OCR service will start on `http://localhost:8000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/register` | Register new user |
| POST | `/api/user/login` | User login |
| POST | `/api/user/logout` | User logout |

### Kitchen Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/kitchens/create-with-admin` | Create kitchen and become admin |
| POST | `/api/kitchens/join-by-code` | Join kitchen by invitation code |
| GET | `/api/kitchens/{id}` | Get kitchen details |

### Inventory Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | Get all inventory items |
| POST | `/api/inventory` | Create new inventory item |
| GET | `/api/inventory/{id}` | Get inventory item by ID |
| PUT | `/api/inventory/{id}` | Update inventory item |
| DELETE | `/api/inventory/{id}` | Delete inventory item |

### Categories & Units

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| POST | `/api/categories` | Create new category |
| GET | `/api/units` | Get all units |
| POST | `/api/units` | Create new unit |

### User Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update user profile |
| POST | `/api/user/change-password` | Change password |
| POST | `/api/user/upload-avatar` | Upload profile picture |

### OCR Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ocr/upload` | Upload receipt for processing |
| GET | `/api/ocr/status/{id}` | Check processing status |

## 🗄️ Database Schema

### Core Entities

- **User**: User accounts with authentication and profile information
- **UserProfile**: Extended user profile data (avatar, preferences, settings)
- **Role**: User roles (USER, ADMIN, MEMBER)
- **Kitchen**: Kitchen/household management
- **Category**: Item categories (Dairy, Vegetables, etc.)
- **Unit**: Measurement units (Kg, Liter, etc.)
- **InventoryItem**: Pantry items with expiration tracking
- **OcrUpload**: Receipt processing records
- **AiExtractedItems**: AI-extracted items from receipts

## 🏛️ Project Structure

```
PantryMind/
├── backend/                 # Spring Boot API
│   ├── src/main/java/
│   │   └── com/innogent/pantry_mind/
│   │       ├── config/      # Security, CORS, JWT configuration
│   │       ├── controller/  # REST controllers
│   │       ├── dto/         # Data Transfer Objects
│   │       ├── entity/      # JPA entities
│   │       ├── repository/  # Data repositories
│   │       ├── service/     # Business logic
│   │       └── mapper/      # Entity-DTO mappers
│   └── src/main/resources/
│       └── application.properties
├── frontend/                # React.js application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── features/        # Redux slices and thunks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── guards/          # Route protection
│   └── package.json
└── python-backend/          # FastAPI OCR service
    ├── app/
    │   ├── api/             # API routes
    │   ├── core/            # OCR and AI processing
    │   ├── models/          # Pydantic models
    │   └── services/        # Business logic
    └── requirements.txt
```

## 🔧 Technology Stack

### Backend
- **Framework**: Spring Boot 3.5.7
- **Database**: PostgreSQL with JPA/Hibernate
- **Security**: Spring Security with JWT
- **Documentation**: OpenAPI/Swagger
- **Mapping**: MapStruct


### Frontend
- **Framework**: React 18 with Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **HTTP Client**: Axios
- **Styling**: CSS3

### OCR Service
- **Framework**: FastAPI
- **OCR Engine**: Tesseract/EasyOCR
- **AI Integration**: OpenAI/Anthropic APIs
- **Image Processing**: PIL/OpenCV

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- CORS configuration
- Input validation and sanitization
- Secure password hashing
- Protected routes on frontend

## 🧪 Testing

### Backend Testing
```bash
cd backend
./mvnw test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment
1. Build the JAR file: `./mvnw clean package`
2. Deploy to your preferred platform (AWS, Heroku, etc.)
3. Configure environment variables
4. Set up PostgreSQL database

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to static hosting (Netlify, Vercel, etc.)
3. Configure API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues

- OCR accuracy depends on receipt quality
- Large image uploads may timeout
- Mobile responsiveness needs improvement

## 🔮 Future Enhancements

- Mobile application (React Native)
- Barcode scanning
- Expiration date notifications
- Shopping list generation
- Recipe suggestions based on inventory
- Multi-language support

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

---

**PantryMind** - Making pantry management smarter, one item at a time! 🥫📱