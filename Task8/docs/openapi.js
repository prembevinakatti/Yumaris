const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Yumaris API",
    version: "1.0.0",
    description:
      "Scalable modular backend API with separated controllers, services, routes, centralized error handling, and request logging.",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Health", description: "Service health endpoints" },
    { name: "Auth", description: "Authentication and user profile endpoints" },
    { name: "Products", description: "Product catalog endpoints" },
    { name: "Orders", description: "Order management endpoints" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "accessToken",
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["fullName", "email", "password"],
        properties: {
          fullName: { type: "string", example: "Ava James" },
          email: { type: "string", format: "email", example: "ava@example.com" },
          password: { type: "string", format: "password", example: "StrongPass123" },
          role: { type: "string", enum: ["ADMIN", "CUSTOMER"], example: "CUSTOMER" },
          adminSecret: { type: "string", example: "optional-admin-secret" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "ava@example.com" },
          password: { type: "string", format: "password", example: "StrongPass123" },
        },
      },
      CreateProductRequest: {
        type: "object",
        required: ["name", "category", "price"],
        properties: {
          name: { type: "string", example: "Wireless Headphones" },
          description: { type: "string", example: "Noise-cancelling over-ear headphones" },
          category: { type: "string", example: "Electronics" },
          price: { type: "number", example: 129.99 },
          currency: { type: "string", example: "USD" },
          stock: { type: "integer", example: 100 },
          isPublished: { type: "boolean", example: true },
        },
      },
      PlaceOrderRequest: {
        type: "object",
        required: ["items", "shippingAddress"],
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["productId", "quantity"],
              properties: {
                productId: { type: "string", example: "65f0a1c7e2b4a11c9f112233" },
                quantity: { type: "integer", example: 2 },
              },
            },
          },
          shippingAddress: {
            type: "object",
            required: ["line1", "city", "state", "postalCode", "country"],
            properties: {
              line1: { type: "string", example: "221B Baker Street" },
              line2: { type: "string", example: "Apt 4" },
              city: { type: "string", example: "London" },
              state: { type: "string", example: "Greater London" },
              postalCode: { type: "string", example: "NW1" },
              country: { type: "string", example: "UK" },
            },
          },
          notes: { type: "string", example: "Leave package at reception." },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Request successful" },
          data: { type: "object", additionalProperties: true },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Something went wrong" },
          details: { oneOf: [{ type: "object" }, { type: "string" }, { type: "null" }] },
          requestId: { type: "string", example: "6f9b4ed2-f2b4-40fe-b42c-6508339085f1" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "API health check",
        responses: {
          200: {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "User registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "User logged in",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user profile",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: "Profile returned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/products": {
      get: {
        tags: ["Products"],
        summary: "List published products",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", example: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
          { name: "search", in: "query", schema: { type: "string", example: "headphones" } },
          { name: "category", in: "query", schema: { type: "string", example: "Electronics" } },
        ],
        responses: {
          200: {
            description: "Products returned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a product (admin only)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProductRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Product created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Product returned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/orders": {
      post: {
        tags: ["Orders"],
        summary: "Place an order",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PlaceOrderRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Order created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/orders/my": {
      get: {
        tags: ["Orders"],
        summary: "Get current user orders",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: "Orders returned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get one order by ID",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Order returned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Order not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = openApiSpec;
