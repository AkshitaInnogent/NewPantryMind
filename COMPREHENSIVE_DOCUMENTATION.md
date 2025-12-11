# PantryMind - Comprehensive Technical Documentation

## 🏗️ System Architecture Overview

PantryMind is a microservices-based application with three core components:

### Backend Services
- **Spring Boot API** (Port 8080): Main business logic and data management
- **FastAPI OCR Service** (Port 8000): Receipt processing and AI integration
- **PostgreSQL Database** (Port 5432): Primary data storage

### Frontend
- **React.js Application** (Port 5173): User interface with Redux state management

## 🔧 Current Technology Stack

### Backend
- **Framework**: Spring Boot 3.5.7
- **Database**: PostgreSQL with JPA/Hibernate
- **Security**: Spring Security with JWT (jjwt 0.12.3)
- **Documentation**: SpringDoc OpenAPI 2.7.0
- **Mapping**: MapStruct 1.5.5
- **WebSocket**: Spring WebSocket with STOMP
- **Email**: Spring Boot Mail
- **Environment**: Spring DotEnv 4.0.0
- **Build Tool**: Maven

### Frontend
- **Framework**: React 19 with Vite 7.2.4
- **State Management**: Redux Toolkit 2.11.0
- **UI Library**: Material-UI 7.3.5 + Tailwind CSS 4.1.17
- **Routing**: React Router DOM 7.9.6
- **HTTP Client**: Axios 1.13.2
- **Icons**: Lucide React + React Icons
- **WebSocket**: STOMP.js 7.2.1 + SockJS
- **Build Tool**: Vite

### OCR Service
- **Framework**: FastAPI
- **OCR Engine**: Tesseract/EasyOCR
- **AI Integration**: OpenAI/Anthropic APIs
- **Image Processing**: PIL/OpenCV

## 🔧 Configuration Management

### Backend Configuration (application.properties)

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/PantryMind
spring.datasource.username=postgres
spring.datasource.password=root

# JPA Settings
spring.jpa.hibernate.ddl-auto=create-drop  # Use 'update' for production
spring.jpa.show-sql=false                  # Set to true for debugging

# Security
jwt.secret=your-secret-key
jwt.expiration=86400000  # 24 hours

# AI Service Integration
python.backend.url=http://127.0.0.1:8001
ai.service.timeout=30000
ai.service.retry.attempts=3
```

### Environment Variables Setup

Create `.env` files in respective directories:

**Backend (.env)**
```env
DATABASE_URL=jdbc:postgresql://localhost:5432/PantryMind
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=root
JWT_SECRET=your-jwt-secret-key
PYTHON_BACKEND_URL=http://127.0.0.1:8001
```

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_OCR_SERVICE_URL=http://localhost:8000
```

## 🗄️ Database Schema Details

### Core Entities and Relationships

```sql
-- Users and Authentication
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    avatar_url VARCHAR(255),
    preferences JSONB
);

-- Kitchen Management
CREATE TABLE kitchens (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    invitation_code VARCHAR(10) UNIQUE,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kitchen Memberships
CREATE TABLE kitchen_members (
    id BIGSERIAL PRIMARY KEY,
    kitchen_id BIGINT REFERENCES kitchens(id),
    user_id BIGINT REFERENCES users(id),
    role VARCHAR(20) DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories and Units
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    color VARCHAR(7) -- Hex color code
);

CREATE TABLE units (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    abbreviation VARCHAR(10),
    type VARCHAR(20) -- WEIGHT, VOLUME, COUNT
);

-- Inventory Management
CREATE TABLE inventory_items (
    id BIGSERIAL PRIMARY KEY,
    kitchen_id BIGINT REFERENCES kitchens(id),
    name VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2),
    unit_id BIGINT REFERENCES units(id),
    category_id BIGINT REFERENCES categories(id),
    expiration_date DATE,
    purchase_date DATE,
    notes TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Tables for Admin Reports
CREATE TABLE purchase_logs (
    id BIGSERIAL PRIMARY KEY,
    kitchen_id BIGINT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_id BIGINT REFERENCES units(id),
    category_id BIGINT REFERENCES categories(id),
    purchase_date DATE NOT NULL,
    cost DECIMAL(10,2),
    purchased_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consumption_logs (
    id BIGSERIAL PRIMARY KEY,
    kitchen_id BIGINT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity_consumed DECIMAL(10,2) NOT NULL,
    unit_id BIGINT REFERENCES units(id),
    consumed_date DATE NOT NULL,
    consumed_by BIGINT REFERENCES users(id),
    meal_id BIGINT REFERENCES meal_logs(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE waste_logs (
    id BIGSERIAL PRIMARY KEY,
    kitchen_id BIGINT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity_wasted DECIMAL(10,2) NOT NULL,
    unit_id BIGINT REFERENCES units(id),
    expiry_date DATE NOT NULL,
    waste_reason VARCHAR(50) DEFAULT 'EXPIRED',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meal_logs (
    id BIGSERIAL PRIMARY KEY,
    kitchen_id BIGINT NOT NULL,
    meal_name VARCHAR(100) NOT NULL,
    meal_date DATE NOT NULL,
    logged_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meal_ingredients (
    id BIGSERIAL PRIMARY KEY,
    meal_log_id BIGINT REFERENCES meal_logs(id),
    ingredient_name VARCHAR(100) NOT NULL,
    quantity_used DECIMAL(10,2) NOT NULL,
    unit_id BIGINT REFERENCES units(id)
);
```

## 🚨 Common Issues & Solutions

### Frontend Issues

#### 1. React Textarea Null Value Warning
**Error**: `value` prop on `textarea` should not be null

**Solution**:
```javascript
// ❌ Incorrect
<textarea value={formData.description} />

// ✅ Correct
<textarea value={formData.description || ""} />
<textarea value={formData.description ?? ""} />
```

#### 2. API 400 Bad Request Errors
**Causes**:
- Missing required fields
- Invalid data types
- Malformed JSON payload

**Debugging Steps**:
1. Open Browser DevTools → Network tab
2. Check the failed request payload
3. Compare with backend DTO requirements
4. Verify all required fields are present

**Example Fix**:
```javascript
// Ensure proper data structure
const inventoryItem = {
  name: name?.trim() || "",
  quantity: parseFloat(quantity) || 0,
  categoryId: categoryId ? parseInt(categoryId) : null,
  unitId: unitId ? parseInt(unitId) : null,
  expirationDate: expirationDate || null,
  notes: notes?.trim() || ""
};
```

#### 3. Redux State Management Issues
**Common Problems**:
- State not updating after API calls
- Stale data in components
- Race conditions

**Solutions**:
```javascript
// Use Redux Toolkit Query for better caching
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/inventory',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['InventoryItem'],
  endpoints: (builder) => ({
    getInventoryItems: builder.query({
      query: () => '',
      providesTags: ['InventoryItem'],
    }),
    createInventoryItem: builder.mutation({
      query: (item) => ({
        url: '',
        method: 'POST',
        body: item,
      }),
      invalidatesTags: ['InventoryItem'],
    }),
  }),
});
```

### Backend Issues

#### 1. Database Connection Problems
**Error**: Connection refused to PostgreSQL

**Solutions**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS
net start postgresql-x64-14  # Windows

# Verify database exists
psql -U postgres -l
```

#### 2. JWT Token Issues
**Problems**:
- Token expiration
- Invalid signatures
- Missing authorization headers

**Configuration**:
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    @Bean
    public JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint() {
        return new JwtAuthenticationEntryPoint();
    }
}
```

#### 3. CORS Configuration
**Error**: Cross-origin requests blocked

**Solution**:
```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## 🔍 API Testing & Validation

### Using Postman/Insomnia

#### Authentication Flow
```http
POST /api/user/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

#### Inventory Operations
```http
GET /api/inventory
Authorization: Bearer {token}

POST /api/inventory
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Milk",
  "quantity": 2.5,
  "unitId": 1,
  "categoryId": 2,
  "expirationDate": "2024-01-15",
  "notes": "Organic whole milk"
}
```

#### Admin Reports & Analytics
```http
GET /api/admin/reports/summary/{kitchenId}?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {token}

GET /api/admin/reports/waste-analysis/{kitchenId}
Authorization: Bearer {token}

POST /api/admin/reports/log-consumption/{kitchenId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "itemName": "Milk",
  "quantity": 1.0,
  "unitId": 1
}

POST /api/admin/reports/log-meal/{kitchenId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "mealName": "Breakfast",
  "mealDate": "2024-01-15",
  "ingredients": [
    {
      "ingredientName": "Milk",
      "quantityUsed": 0.5,
      "unitId": 1
    }
  ]
}
```

## 🧪 Testing Strategies

### Backend Unit Tests
```java
@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
class InventoryServiceTest {
    
    @Autowired
    private InventoryService inventoryService;
    
    @MockBean
    private InventoryRepository inventoryRepository;
    
    @Test
    void shouldCreateInventoryItem() {
        // Given
        InventoryItemDto itemDto = new InventoryItemDto();
        itemDto.setName("Test Item");
        itemDto.setQuantity(BigDecimal.valueOf(5.0));
        
        // When
        InventoryItemDto result = inventoryService.createItem(itemDto);
        
        // Then
        assertThat(result.getName()).isEqualTo("Test Item");
    }
}
```

### Frontend Component Tests
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import InventoryForm from './InventoryForm';

test('should submit inventory form with valid data', async () => {
  render(
    <Provider store={store}>
      <InventoryForm />
    </Provider>
  );
  
  fireEvent.change(screen.getByLabelText(/name/i), {
    target: { value: 'Test Item' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /save/i }));
  
  expect(screen.getByText(/item saved/i)).toBeInTheDocument();
});
```

## 🚀 Deployment Guidelines

### Production Configuration

#### Backend (application-prod.properties)
```properties
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
logging.level.com.innogent.pantry_mind=INFO
server.port=${PORT:8080}

# Use environment variables for sensitive data
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}
jwt.secret=${JWT_SECRET}
```

#### Frontend Build
```bash
# Build for production
npm run build

# Environment variables for production
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_OCR_SERVICE_URL=https://your-ocr-service.com
```

### Docker Configuration

#### Backend Dockerfile
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/pantry-mind-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

#### Docker Compose
```yaml
version: '3.8'
services:
  database:
    image: postgres:14
    environment:
      POSTGRES_DB: PantryMind
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: root
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - database
    environment:
      DATABASE_URL: jdbc:postgresql://database:5432/PantryMind
      DATABASE_USERNAME: postgres
      DATABASE_PASSWORD: root

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## 📊 Performance Optimization

### Database Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_inventory_kitchen_id ON inventory_items(kitchen_id);
CREATE INDEX idx_inventory_category_id ON inventory_items(category_id);
CREATE INDEX idx_inventory_expiration ON inventory_items(expiration_date);
```

### Frontend Optimization
```javascript
// Lazy loading for routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));

// Memoization for expensive components
const InventoryList = memo(({ items, onUpdate }) => {
  return (
    <div>
      {items.map(item => (
        <InventoryItem key={item.id} item={item} onUpdate={onUpdate} />
      ))}
    </div>
  );
});
```

## 🔐 Security Best Practices

### Backend Security
```java
// Input validation
@Valid
@RequestBody
public ResponseEntity<InventoryItemDto> createItem(
    @Valid @RequestBody CreateInventoryItemRequest request) {
    // Implementation
}

// SQL injection prevention (JPA automatically handles this)
@Query("SELECT i FROM InventoryItem i WHERE i.kitchen.id = :kitchenId")
List<InventoryItem> findByKitchenId(@Param("kitchenId") Long kitchenId);
```

### Frontend Security
```javascript
// XSS prevention
const sanitizeInput = (input) => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// Secure token storage
const tokenStorage = {
  set: (token) => localStorage.setItem('auth_token', token),
  get: () => localStorage.getItem('auth_token'),
  remove: () => localStorage.removeItem('auth_token')
};
```

## 📈 Monitoring & Logging

### Backend Logging
```java
@Slf4j
@Service
public class InventoryService {
    
    public InventoryItemDto createItem(InventoryItemDto itemDto) {
        log.info("Creating inventory item: {}", itemDto.getName());
        try {
            // Implementation
            log.info("Successfully created inventory item with ID: {}", result.getId());
            return result;
        } catch (Exception e) {
            log.error("Failed to create inventory item: {}", e.getMessage(), e);
            throw e;
        }
    }
}
```

### Frontend Error Tracking
```javascript
// Global error boundary
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## 🔄 Development Workflow

### Git Workflow
```bash
# Feature development
git checkout -b feature/inventory-management
git add .
git commit -m "feat: add inventory CRUD operations"
git push origin feature/inventory-management

# Code review and merge
git checkout main
git pull origin main
git merge feature/inventory-management
```

### Code Quality Tools
```json
// package.json
{
  "scripts": {
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write src/**/*.{js,jsx,ts,tsx,json,css,md}"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

This comprehensive documentation covers all major aspects of the PantryMind application, from troubleshooting common issues to deployment and security best practices.