# PantryMind - Updated Frontend & Backend Integration

## Changes Made

### Backend Updates
1. **Fixed User Authentication Response**
   - Login endpoint now returns both `token` and `user` data
   - Register endpoint now returns both `token` and `user` data
   - Added `getUserByEmail` method to UserService

2. **Enhanced User Response DTO**
   - Added `role` field to include user role information
   - Added `kitchenId` field for kitchen association

3. **Updated Kitchen Management**
   - Added `createWithAdmin` endpoint for creating kitchen with admin role
   - Added `joinByCode` endpoint for joining kitchen as member
   - Automatic role assignment (ADMIN for kitchen creator, MEMBER for joiners)

4. **Fixed API Endpoints**
   - All inventory endpoints use `/api/inventory` prefix
   - Categories endpoint: `/api/categories`
   - Units endpoint: `/api/units`
   - Kitchen endpoints: `/api/kitchens`

5. **Data Initialization**
   - Added default categories (Dairy, Vegetables, Fruits, etc.)
   - Added default units (Kg, Liter, Piece, etc.)
   - Added default roles (USER, ADMIN, MEMBER)

### Frontend Updates
1. **Fixed API Integration**
   - Updated inventory thunks to use correct endpoints (`/api/inventory`)
   - Replaced fetch calls with axiosClient for consistent error handling
   - Added proper error handling with backend error messages

2. **Enhanced Redux State Management**
   - Added categories slice and thunks
   - Added units slice and thunks
   - Updated store to include new reducers

3. **Fixed Form Field Names**
   - Changed `category_id` to `categoryId`
   - Changed `unit_id` to `unitId`
   - Updated all inventory forms to match backend DTO structure

4. **Improved User Experience**
   - Categories and units are now loaded from Redux store
   - Consistent error handling across all components
   - Better loading states and user feedback

## How to Run

### Backend
1. Ensure PostgreSQL is running on localhost:5432
2. Database `PantryMind` should exist
3. Run the Spring Boot application:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

### Frontend
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/user/register` - Register new user
- `POST /api/user/login` - Login user
- `POST /api/user/logout` - Logout user

### Kitchen Management
- `POST /api/kitchens/create-with-admin` - Create kitchen and become admin
- `POST /api/kitchens/join-by-code` - Join kitchen by invitation code

### Inventory Management
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create new inventory item
- `GET /api/inventory/{id}` - Get inventory item by ID
- `PUT /api/inventory/{id}` - Update inventory item
- `DELETE /api/inventory/{id}` - Delete inventory item

### Categories & Units
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `GET /api/units` - Get all units
- `POST /api/units` - Create new unit

## Database Schema Updates

The application will automatically create/update tables and seed initial data:
- Default roles: USER, ADMIN, MEMBER
- Default categories: Dairy, Vegetables, Fruits, Meat, Grains, Beverages, Snacks, Frozen, Spices, Condiments
- Default units: Piece, Kg, Gram, Liter, ml, Cup, Tablespoon, Teaspoon, Dozen, Pack, Bottle, Can

## Key Features Working
- ✅ User registration and login with proper token + user data response
- ✅ Kitchen creation and joining with automatic role assignment
- ✅ Inventory CRUD operations with proper API integration
- ✅ Category and unit management
- ✅ Role-based routing and access control
- ✅ Consistent error handling and user feedback