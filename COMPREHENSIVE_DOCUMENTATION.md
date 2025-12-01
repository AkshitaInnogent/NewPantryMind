# PantryMind - Comprehensive Technical Documentation

## 🏗️ System Overview

PantryMind is a full-stack smart pantry management system built with:
- **Backend**: Spring Boot 3.5.7 with PostgreSQL
- **Frontend**: React 18 with Redux Toolkit
- **OCR Service**: FastAPI with AI integration
- **Authentication**: JWT-based stateless authentication
- **Security**: Spring Security with role-based access control

---

## 🗄️ Database Schema & Entity Relationships

### Core Entities Overview

The system consists of 8 main entities with specific relationships and purposes:

### 1. **User Entity**
**Purpose**: Manages user accounts, authentication, and kitchen membership

```java
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;        // Display name
    private String name;           // Full name
    private String email;          // Login identifier (unique)
    private String passwordHash;   // BCrypt hashed password
    private String googleId;       // OAuth integration
    private Boolean isActive;      // Account status
    private LocalDateTime createdAt; // Account creation timestamp
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kitchen_id")
    private Kitchen kitchen;       // User belongs to one kitchen
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;            // User has one role
}
```

**Why Created**: Central entity for authentication, authorization, and user management within kitchen contexts.

**How Created**: 
- Registration via `/api/user/register` endpoint
- Password hashed using BCryptPasswordEncoder
- Default role assigned as "USER"
- Can join kitchens via invitation codes

### 2. **Role Entity**
**Purpose**: Defines user permissions and access levels

```java
@Entity
@Table(name = "roles")
public class Role {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String name;          // USER, ADMIN, MEMBER
}
```

**Why Created**: Implements role-based access control (RBAC) for different permission levels.

**How Created**: 
- Pre-initialized via DataInitializer
- Three default roles: USER, ADMIN, MEMBER
- ADMIN: Full kitchen management rights
- MEMBER: Standard kitchen access
- USER: Basic user without kitchen

### 3. **Kitchen Entity**
**Purpose**: Represents household/shared pantry spaces

```java
@Entity
@Table(name = "kitchens")
public class Kitchen {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;                    // Kitchen display name
    
    @Column(unique = true)
    private String invitationCode;          // Unique join code
    
    // Relationships
    @OneToMany(mappedBy = "kitchen", cascade = CascadeType.ALL)
    private List<User> users;               // Kitchen members
}
```

**Why Created**: Enables multi-user pantry management with invitation-based access.

**How Created**:
- Created via `/api/kitchens/create-with-admin` endpoint
- Auto-generates unique invitation code
- Creator becomes ADMIN automatically
- Others join via `/api/kitchens/join-by-code`

### 4. **Category Entity**
**Purpose**: Organizes inventory items by type

```java
@Entity
@Table(name = "category")
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;          // Dairy, Vegetables, Fruits, etc.
    private String description;   // Category description
}
```

**Why Created**: Provides logical grouping for inventory items, enabling better organization and filtering.

**How Created**:
- Pre-initialized with 10 default categories
- Extensible via `/api/categories` endpoint
- Categories: Dairy, Vegetables, Fruits, Meat, Grains, Beverages, Snacks, Frozen, Spices, Condiments

### 5. **Unit Entity**
**Purpose**: Defines measurement units for inventory quantities

```java
@Entity
@Table(name = "units")
public class Unit {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;          // Kg, Liter, Piece, etc.
    private String type;          // Weight, Volume, Count
}
```

**Why Created**: Standardizes quantity measurements across different item types.

**How Created**:
- Pre-initialized with 12 common units
- Grouped by type (Weight, Volume, Count)
- Extensible via `/api/units` endpoint

### 6. **InventoryItem Entity**
**Purpose**: Core pantry item with expiration tracking

```java
@Entity
public class InventoryItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;                    // Item name
    private String description;             // Item description
    private Long kitchenId;                // Kitchen association
    private Long createdBy;                // User who added item
    private Long quantity;                 // Item quantity
    private String location;               // Storage location
    private Date expiryDate;              // Expiration date
    private Date createdAt;               // Creation timestamp
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;             // Item category
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private Unit unit;                     // Measurement unit
}
```

**Why Created**: Central inventory management with categorization, quantification, and expiration tracking.

**How Created**:
- Manual entry via `/api/inventory` endpoint
- Auto-creation from OCR-extracted items
- Linked to kitchen and creator for access control

### 7. **OcrUpload Entity**
**Purpose**: Tracks receipt/document processing workflow

```java
@Entity
@Table(name = "ocr_uploads")
public class OcrUpload {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long kitchenId;                     // Kitchen context
    private Long uploadedBy;                    // Uploader user
    private String originalFilename;            // Original file name
    private String cloudinaryUrl;               // Cloud storage URL
    private String cloudinaryPublicId;          // Cloud storage ID
    private String rawOcrText;                  // Extracted text
    private String pythonRequestId;             // OCR service request ID
    private Double confidenceSummary;           // OCR confidence score
    private Integer processingTimeMs;           // Processing duration
    private LocalDateTime createdAt;            // Upload timestamp
    private LocalDateTime updatedAt;            // Last update
    
    // Enums
    private DocumentType documentType;          // BILL, LABEL, PRODUCT
    private ProcessingStatus status;            // PENDING, PROCESSING, COMPLETED, CONFIRMED, FAILED
}
```

**Why Created**: Manages the complete OCR workflow from upload to item extraction.

**How Created**:
- Initiated via `/api/ocr/upload` endpoint
- Files stored in Cloudinary
- Processed by Python FastAPI service
- Status tracked through processing pipeline

### 8. **AiExtractedItems Entity**
**Purpose**: Stores AI-processed items from receipts before confirmation

```java
@Entity
@Table(name = "ai_extracted_items")
public class AiExtractedItems {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long ocrUploadId;              // Source OCR upload
    private String rawName;                // Original extracted name
    private String canonicalName;          // Cleaned/standardized name
    private String categoryName;           // Suggested category
    private String brand;                  // Product brand
    private Double quantity;               // Extracted quantity
    private String unitName;               // Suggested unit
    private Double price;                  // Item price
    private LocalDate expiryDate;          // Extracted/estimated expiry
    private String expirySource;           // How expiry was determined
    private String storageType;            // Storage recommendation
    private Boolean isFood;                // Food classification
    private Double confidence;             // AI confidence score
    private Boolean isConfirmed;           // User confirmation status
    private String rawAiJson;              // Original AI response
    private LocalDateTime createdAt;       // Extraction timestamp
}
```

**Why Created**: Bridges OCR processing and inventory creation with user confirmation workflow.

**How Created**:
- Generated by AI processing of OCR text
- Requires user confirmation before becoming InventoryItems
- Maintains audit trail of AI decisions

---

### Table Statistics and Sizes

| Table Name | Estimated Rows | Primary Use | Growth Rate |
|------------|----------------|-------------|-------------|
| users | 1K-10K | User accounts | Low |
| roles | 3-10 | System roles | Very Low |
| kitchens | 100-1K | Household groups | Low |
| category | 10-50 | Item categories | Very Low |
| units | 10-30 | Measurement units | Very Low |
| inventory_item | 10K-100K | Main inventory | High |
| ocr_uploads | 1K-10K | Receipt uploads | Medium |
| ai_extracted_items | 10K-100K | OCR processing | High|

## 🔐 JWT Authentication System

### JWT Configuration

**JWT Utility Class** (`JwtUtil.java`):
```java
@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;                  // HMAC signing key
    
    @Value("${jwt.expiration}")
    private Long expiration;                // Token validity (24 hours)
    
    // Methods:
    // - generateToken(String username): Creates JWT
    // - extractUsername(String token): Gets subject from token
    // - isTokenValid(String token, String username): Validates token
    // - isTokenExpired(String token): Checks expiration
}
```

**Configuration Properties**:
```properties
jwt.secret=your-secret-keyfewgrsdfhgjregdfhmefdasrsdssfgsdfsbs2143534654
jwt.expiration=86400000  # 24 hours in milliseconds
```

### Authentication Filter

**JWT Authentication Filter** (`JwtAuthenticationFilter.java`):
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) {
        
        // 1. Extract Authorization header
        String authHeader = request.getHeader("Authorization");
        
        // 2. Validate Bearer token format
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // 3. Extract JWT token
        String jwt = authHeader.substring(7);
        String username = jwtUtil.extractUsername(jwt);
        
        // 4. Validate token and set authentication
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            if (jwtUtil.isTokenValid(jwt, username)) {
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

### Security Configuration

**Security Config** (`SecurityConfig.java`):
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())                    // Disable CSRF for stateless API
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/user/register", 
                               "/api/user/login", "/api/user/logout").permitAll()  // Public endpoints
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()   // Documentation
                .anyRequest().authenticated()                                        // All others require auth
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))    // No sessions
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();              // Password hashing
    }
}
```

### Custom User Details Service

**User Details Service** (`CustomUserDetailsService.java`):
```java
@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        
        String roleName = user.getRole() != null ? user.getRole().getName() : "USER";
        
        return User.builder()
                .username(user.getEmail())              // Email as username
                .password(user.getPasswordHash())       // BCrypt hash
                .authorities(roleName)                  // Single role authority
                .build();
    }
}
```

### Authentication Flow

1. **Registration** (`POST /api/user/register`):
   - User provides email, password, name
   - Password hashed with BCrypt
   - User saved with default "USER" role
   - JWT token generated and returned

2. **Login** (`POST /api/user/login`):
   - Credentials validated via AuthenticationManager
   - JWT token generated for valid user
   - Token and user details returned

3. **Request Authentication**:
   - Client sends JWT in Authorization header: `Bearer <token>`
   - JwtAuthenticationFilter validates token
   - SecurityContext populated with user details
   - Request proceeds with authenticated context

4. **Token Validation**:
   - Token signature verified with secret key
   - Expiration checked
   - Username extracted and validated

---

## 📚 API Endpoints Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/user/register` | Register new user | `{email, password, name, username}` | `{token, user}` |
| POST | `/api/user/login` | User login | `{email, password}` | `{token, user}` |
| POST | `/api/user/logout` | User logout | None | `{message}` |
| GET | `/api/user/me` | Get current user | None | `UserResponseDTO` |
| POST | `/api/user/forgot-password` | Request password reset | `{email}` | `{message}` |
| POST | `/api/user/reset-password` | Reset password | `{token, newPassword}` | `{message}` |

### Kitchen Management

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/kitchens/create-with-admin` | Create kitchen and become admin | `{name}` | `KitchenResponseDTO` |
| POST | `/api/kitchens/join-by-code` | Join kitchen by invitation code | `{invitationCode}` | `KitchenResponseDTO` |
| GET | `/api/kitchens/{id}` | Get kitchen details | None | `KitchenResponseDTO` |

### Inventory Management

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/inventory` | Get all inventory items | None | `List<InventoryItemResponseDTO>` |
| POST | `/api/inventory` | Create new inventory item | `CreateInventoryItemRequestDTO` | `InventoryItemResponseDTO` |
| GET | `/api/inventory/{id}` | Get inventory item by ID | None | `InventoryItemResponseDTO` |
| PUT | `/api/inventory/{id}` | Update inventory item | `UpdateInventoryItemRequestDTO` | `InventoryItemResponseDTO` |
| DELETE | `/api/inventory/{id}` | Delete inventory item | None | `204 No Content` |

### Categories & Units

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/categories` | Get all categories | None | `List<CategoryResponseDTO>` |
| POST | `/api/categories` | Create new category | `{name, description}` | `CategoryResponseDTO` |
| GET | `/api/units` | Get all units | None | `List<UnitResponseDTO>` |
| POST | `/api/units` | Create new unit | `{name, type}` | `UnitResponseDTO` |

### OCR Service

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/ocr/upload` | Upload receipt for processing | `MultipartFile` | `OCRResponseDto` |
| GET | `/api/ocr/status/{id}` | Check processing status | None | `{status, items}` |
| POST | `/api/ocr/confirm-items` | Confirm extracted items | `{ocrUploadId, confirmedItems}` | `{message}` |

---

## 🔒 Security Implementation

### Password Security
- **Hashing**: BCryptPasswordEncoder with default strength (10 rounds)
- **Storage**: Only password hashes stored, never plain text
- **Validation**: Spring Security handles authentication

### JWT Security
- **Algorithm**: HMAC-SHA256 for token signing
- **Secret**: 256-bit secret key from configuration
- **Expiration**: 24-hour token validity
- **Stateless**: No server-side session storage

### Authorization Levels
- **Public Endpoints**: Registration, login, documentation
- **Authenticated Endpoints**: All inventory and kitchen operations
- **Role-Based Access**: ADMIN vs MEMBER vs USER permissions

### CORS Configuration
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        return source;
    }
}
```

---

## 🏗️ Service Layer Architecture

### Service Interfaces and Implementations

**User Service** (`UserService.java` / `UserServiceImpl.java`):
- User registration and authentication
- Profile management
- Password reset functionality
- Kitchen membership management

**Kitchen Service** (`KitchenService.java` / `KitchenServiceImpl.java`):
- Kitchen creation and management
- Invitation code generation
- Member management
- Access control

**Inventory Service** (`InventoryService.java` / `InventoryServiceImpl.java`):
- CRUD operations for inventory items
- Kitchen-scoped item access
- Expiration tracking
- Category and unit associations

**OCR Service** (`OCRService.java`):
- File upload to Cloudinary
- Integration with Python OCR service
- Processing status tracking
- Item extraction workflow

### Data Transfer Objects (DTOs)

**Request DTOs**:
- `RegisterRequestDTO`: User registration data
- `LoginRequestDTO`: Login credentials
- `CreateInventoryItemRequestDTO`: New inventory item data
- `KitchenRequestDTO`: Kitchen creation data

**Response DTOs**:
- `UserResponseDTO`: User information (no sensitive data)
- `InventoryItemResponseDTO`: Complete item details
- `KitchenResponseDTO`: Kitchen details with members
- `OCRResponseDto`: OCR processing results

### Repository Layer

All repositories extend `JpaRepository<Entity, Long>`:
- `UserRepository`: Custom query `findByEmail(String email)`
- `KitchenRepository`: Custom query `findByInvitationCode(String code)`
- `InventoryItemRepository`: Kitchen-scoped queries
- `CategoryRepository`, `UnitRepository`, `RoleRepository`: Basic CRUD
- `OcrUploadRepository`, `AiExtractedItemsRepository`: OCR workflow

---

## ⚙️ Configuration Details

### Database Configuration
```properties
# PostgreSQL Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/PantryMind
spring.datasource.username=postgres
spring.datasource.password=root
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

### JWT Configuration
```properties
# JWT Configuration
jwt.secret=your-secret-keyfewgrsdfhgjregdfhmefdasrsdssfgsdfsbs2143534654
jwt.expiration=86400000  # 24 hours
```

### Data Initialization

**DataInitializer** automatically creates:
- **Roles**: USER, ADMIN, MEMBER
- **Categories**: Dairy, Vegetables, Fruits, Meat, Grains, Beverages, Snacks, Frozen, Spices, Condiments
- **Units**: Piece, Kg, Gram, Liter, ml, Cup, Tablespoon, Teaspoon, Dozen, Pack, Bottle, Can

### Cloud Storage Configuration
- **Cloudinary**: Used for receipt/document storage
- **Configuration**: Via environment variables
- **Integration**: CloudinaryService handles uploads

---

## 🔄 Entity Relationships Summary

```
User ──────────┐
│              │
│ ManyToOne    │ ManyToOne
│              │
▼              ▼
Kitchen        Role
│
│ OneToMany
│
▼
InventoryItem ──┐
│               │
│ ManyToOne     │ ManyToOne
│               │
▼               ▼
Category        Unit

OcrUpload ──────┐
│               │
│ OneToMany     │
│               │
▼               │
AiExtractedItems│
                │
                └── (Converts to InventoryItem after confirmation)
```

### Relationship Details:
- **User-Kitchen**: Many users can belong to one kitchen
- **User-Role**: Each user has one role
- **InventoryItem-Category**: Each item belongs to one category
- **InventoryItem-Unit**: Each item has one measurement unit
- **OcrUpload-AiExtractedItems**: One upload can generate multiple extracted items
- **Kitchen-InventoryItem**: Implicit relationship via kitchenId field

---

