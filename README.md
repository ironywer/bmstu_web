# Restaurant Menu Management System

A Vue 3 application for managing restaurant menus. The project allows users to organize dishes into menus, add, edit, and delete dishes. 

---

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [API Documentation](#api-documentation)
- [License](#license)

---

## Features

- **Admin Dashboard**: Manage business lunch menus and dishes via an graphic interface.
- **Item Management**: Create, update, delete, and assign dishes to menus. Validate dish types to prevent duplicates within a menu.
- **Menu Management**: Create, edit, delete menus by day and option (e.g., `Monday - Option 1`), with sorted dish types.
- **Drag-and-Drop**: Easily move dishes between menus with live feedback and sorting by type.
- **Dynamic Routing**: View or edit dishes via `/dishes/:id`.
- **Validation & Notifications**: Real-time validation and toast notifications for all actions.
- **Responsive Design**: Horizontal and vertical scrolling optimized for menus and dishes.
- **Tech Stack**: Vue 3 (Frontend), Node.js + Express.js (Backend), PostgreSQL (Database), REST-like API.

---

## Technologies

- **Frontend**: Vue 3, Pinia, Vue Router, Vite for development and build
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Knex.js for database migrations and queries

---
## Setup

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/axywe/bmstu_web.git
   cd bmstu_web
   ```

2. **Initialize the project**:
   Run the following command to set up and prepare the project:
   ```bash
   make init
   ```

3. **Build and start the services**:
   Use the command below to build and run the backend, frontend, and database services:
   ```bash
   make all
   ```

---

## Usage

1. Open the application in your browser: `http://localhost:3000/`.
2. Navigate through the following key sections:
   - **Dishes**: View and manage dishes.
   - **Menus**: Organize dishes into menus with drag-and-drop functionality.

---

## Folder Structure

```
.
├── backend
│   ├── src
│   │   ├── controllers      # Handles HTTP requests (e.g., dishes.controller.ts, menus.controller.ts)
│   │   ├── services         # Application logic (e.g., dishes.service.ts, menus.service.ts)
│   │   ├── migrations       # Database schema migrations
│   │   ├── routes           # API routes (e.g., dishes.routes.ts, menus.routes.ts)
│   │   ├── models           # Database models (e.g., dish.model.ts, menu.model.ts)
│   │   └── utils            # Utility functions (e.g., response.util.ts)
│   ├── Dockerfile           # Backend Docker configuration
│   ├── knexfile.ts          # Knex.js configuration
│   └── tsconfig.json        # TypeScript configuration
├── frontend
│   ├── src
│   │   ├── components       # Reusable Vue components (e.g., DishItem.vue, MenuItem.vue)
│   │   ├── pages            # Application views (e.g., DishPage.vue, MenuPage.vue)
│   │   ├── router           # Vue Router configuration
│   │   ├── store            # State management (e.g., Pinia stores)
│   │   └── services         # API service calls (e.g., dishService.ts, menuService.ts)
│   ├── public
│   │   └── index.html       # Entry point for the frontend
│   ├── Dockerfile           # Frontend Docker configuration
│   └── vite.config.ts       # Vite.js configuration
├── docker-compose.yml       # Docker Compose configuration for the project
├── Makefile                 # Makefile for build and deployment tasks
└── README.md                # Project documentation
```

---

## API Documentation

### Base URL: `/api/v1`

#### Endpoints

## Dishes API

### **Get All Dishes**

**Endpoint:** `GET /api/v1/dishes`

**Description:** Retrieve a list of all dishes.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Caesar Salad",
      "type": "salad",
      "created_at": "2023-12-10T12:34:56Z"
    }
  ],
  "meta": {
    "count": 1
  }
}
```

---

### **Create a Item**

**Endpoint:** `POST /api/v1/dishes`

**Description:** Add a new dish.

**Request:**
```json
{
  "name": "Caesar Salad",
  "type": "salad"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Caesar Salad",
    "type": "salad",
    "created_at": "2023-12-10T12:34:56Z"
  },
  "meta": {
    "message": "Item created successfully"
  }
}
```

---

### **Update a Item**

**Endpoint:** `PUT /api/v1/dishes/:id`

**Description:** Update an existing dish.

**Request:**
```json
{
  "name": "Greek Salad",
  "type": "salad"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Greek Salad",
    "type": "salad",
    "created_at": "2023-12-10T12:34:56Z"
  },
  "meta": {
    "message": "Item updated successfully"
  }
}
```

---

### **Delete a Item**

**Endpoint:** `DELETE /api/v1/dishes/:id`

**Description:** Remove a dish.

**Response:**
```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Item deleted successfully"
  }
}
```

---

### **Add Item to Menu**

**Endpoint:** `POST /api/v1/dishes/menus/:menuId/dishes`

**Description:** Add a dish to a menu.

**Request:**
```json
{
  "dishId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "menu_id": 1,
    "dish_id": 1,
    "created_at": "2023-12-10T12:34:56Z"
  },
  "meta": {
    "message": "Item added to menu successfully"
  }
}
```

---

### **Remove Item from Menu**

**Endpoint:** `DELETE /api/v1/dishes/menus/:menuId/dishes/:dishId`

**Description:** Remove a dish from a menu.

**Response:**
```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Item removed from menu successfully"
  }
}
```

---

## Menus API

### **Get All Menus**

**Endpoint:** `GET /api/v1/menus`

**Description:** Retrieve all menus.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "day": "Monday",
      "variant": "Option 1",
      "created_at": "2023-12-10T12:34:56Z"
    }
  ],
  "meta": {
    "count": 1
  }
}
```

---

### **Get a Menu by ID**

**Endpoint:** `GET /api/v1/menus/:id`

**Description:** Retrieve details of a specific menu.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "day": "Monday",
    "variant": "Option 1",
    "created_at": "2023-12-10T12:34:56Z",
    "dishes": [
      {
        "id": 1,
        "name": "Caesar Salad",
        "type": "salad"
      }
    ]
  },
  "meta": {}
}
```

---

### **Create a Menu**

**Endpoint:** `POST /api/v1/menus`

**Description:** Add a new menu.

**Request:**
```json
{
  "day": "Monday",
  "variant": "Option 1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "day": "Monday",
    "variant": "Option 1",
    "created_at": "2023-12-10T12:34:56Z"
  },
  "meta": {
    "message": "Menu created successfully"
  }
}
```

---

### **Update a Menu**

**Endpoint:** `PUT /api/v1/menus/:id`

**Description:** Update an existing menu.

**Request:**
```json
{
  "day": "Monday",
  "variant": "Option 2"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "day": "Monday",
    "variant": "Option 2",
    "created_at": "2023-12-10T12:34:56Z"
  },
  "meta": {
    "message": "Menu updated successfully"
  }
}
```

---

### **Delete a Menu**

**Endpoint:** `DELETE /api/v1/menus/:id`

**Description:** Remove a menu.

**Response:**
```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Menu deleted successfully"
  }
}
```

---

### **Move Item Between Menus**

**Endpoint:** `POST /api/v1/menus/:fromMenuId/dishes/:dishId/move`

**Description:** Move a dish from one menu to another.

**Request:**
```json
{
  "toMenuId": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Item moved successfully"
  }
}
```

---

## License

This project is licensed under the [MIT License](LICENSE).