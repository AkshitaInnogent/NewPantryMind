# PantryMind Design System

## Overview
This design system ensures all pages in PantryMind have a consistent look and feel. All components follow the same visual patterns, spacing, and interaction behaviors.

## Core Components

### 1. PageLayout
**Purpose**: Standardized page wrapper with header, sidebar, and content area
**Usage**: Wrap all page content with this component

```jsx
import PageLayout from "../../components/layout/PageLayout";
import { IconName } from "lucide-react";

<PageLayout
  title="Page Title"
  subtitle="Optional subtitle description"
  icon={<IconName className="w-6 h-6" />}
  headerActions={<Button>Action</Button>}
>
  {/* Page content */}
</PageLayout>
```

### 2. Button
**Purpose**: Consistent button styling across all interactions
**Variants**: primary, secondary, danger, ghost
**Sizes**: sm, md, lg, xl

```jsx
import { Button } from "../../components/ui";

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

### 3. Card
**Purpose**: Content containers with consistent styling
**Features**: Hover effects, padding options

```jsx
import { Card } from "../../components/ui";

<Card hover padding="md">
  {/* Card content */}
</Card>
```

### 4. LoadingSpinner
**Purpose**: Consistent loading states
**Sizes**: sm, md, lg

```jsx
import { LoadingSpinner } from "../../components/ui";

<LoadingSpinner text="Loading data..." size="md" />
```

### 5. Alert
**Purpose**: Error, success, warning, and info messages
**Types**: error, success, warning, info

```jsx
import { Alert } from "../../components/ui";

<Alert
  type="error"
  title="Error Title"
  message="Error description"
  onAction={retryFunction}
  actionText="Try Again"
/>
```

### 6. EmptyState
**Purpose**: No-data states with call-to-action

```jsx
import { EmptyState } from "../../components/ui";

<EmptyState
  icon={<Package className="w-10 h-10" />}
  title="No Items Found"
  description="Start by adding your first item."
  action={<Button onClick={addItem}>Add Item</Button>}
/>
```

## Design Tokens

### Colors
- **Primary Green**: `bg-green-600`, `text-green-600`, `border-green-600`
- **Primary Green Hover**: `hover:bg-green-700`
- **Light Green**: `bg-green-50`, `text-green-700`
- **Gray Scale**: `text-gray-900` (headings), `text-gray-600` (body), `text-gray-500` (labels)

### Typography
- **Page Title**: `text-3xl md:text-4xl font-extrabold text-gray-900`
- **Subtitle**: `text-gray-600 mt-1`
- **Card Title**: `text-xl font-extrabold text-gray-900`
- **Body Text**: `text-gray-600`
- **Labels**: `text-sm text-gray-500`

### Spacing
- **Page Padding**: `p-6 md:p-8`
- **Card Padding**: `p-6` (default)
- **Section Spacing**: `mb-8` (between major sections)
- **Element Spacing**: `mb-4` or `mb-6` (between elements)

### Shadows & Borders
- **Card Shadow**: `shadow-sm` (default), `shadow-lg` (elevated)
- **Hover Shadow**: `hover:shadow-xl`
- **Border Radius**: `rounded-lg` (cards), `rounded-xl` (pages)

### Animations
- **Hover Transform**: `hover:-translate-y-1 hover:scale-[1.02]`
- **Transition**: `transition-all duration-300 ease-out`

## Layout Patterns

### Standard Page Structure
```jsx
<PageLayout title="Page Name" subtitle="Description" icon={<Icon />}>
  {/* Search/Filters (if applicable) */}
  <div className="mb-6">
    <SearchInput />
    {/* Filter buttons */}
  </div>

  {/* Error handling */}
  {error && <Alert type="error" />}

  {/* Loading state */}
  {loading && <LoadingSpinner />}

  {/* Empty state */}
  {!loading && items.length === 0 && <EmptyState />}

  {/* Content grid/list */}
  {!loading && items.length > 0 && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => (
        <Card key={item.id} hover>
          {/* Card content */}
        </Card>
      ))}
    </div>
  )}
</PageLayout>
```

### Form Layout
```jsx
<PageLayout title="Form Title" icon={<Icon />}>
  <Card>
    <div className="space-y-6">
      {/* Form fields */}
      <div>
        <label className="text-sm font-bold text-gray-900 block mb-1">
          Field Label
        </label>
        <input className="w-full px-3 py-2 border border-gray-300 rounded-md" />
      </div>
    </div>
    
    <div className="flex gap-3 mt-8">
      <Button>Save</Button>
      <Button variant="secondary">Cancel</Button>
    </div>
  </Card>
</PageLayout>
```

## Icon Usage
- Use Lucide React icons consistently
- Icon size in headers: `w-6 h-6`
- Icon size in empty states: `w-10 h-10`
- Icon color matches the green theme: `text-green-600`

## Responsive Design
- Mobile-first approach
- Grid breakpoints: `md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Text scaling: `text-3xl md:text-4xl`
- Padding scaling: `p-6 md:p-8`

## Accessibility
- Proper heading hierarchy (h1 for page titles)
- Descriptive button text
- Color contrast compliance
- Focus states on interactive elements
- Screen reader friendly labels

## Implementation Checklist

When creating a new page:
- [ ] Use PageLayout wrapper
- [ ] Include proper title and subtitle
- [ ] Add appropriate icon
- [ ] Handle loading states with LoadingSpinner
- [ ] Handle error states with Alert
- [ ] Handle empty states with EmptyState
- [ ] Use Card components for content containers
- [ ] Use Button components for all interactions
- [ ] Follow spacing and typography guidelines
- [ ] Test responsive behavior
- [ ] Verify accessibility compliance

## Examples

See the following pages for reference implementations:
- `SmartRecipes.jsx` - Complex page with multiple states
- `Profile.jsx` - Form-heavy page
- `InventoryList.jsx` - List/grid page with filters
- `MemberDashboard.jsx` - Simple dashboard page

This design system ensures that all pages feel like part of the same cohesive application while maintaining flexibility for different content types and user flows.