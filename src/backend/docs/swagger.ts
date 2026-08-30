import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express, Request, Response } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CampusSwap API - Hyperlocal Student Marketplace',
      version: '1.0.0',
      description:
        'RESTful API documentation for CampusSwap, a peer-to-peer campus marketplace enabling university students to buy, sell, message, and exchange items safely within college campuses.',
      contact: {
        name: 'CampusSwap Dev Team',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'Primary API Gateway',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format "Bearer <token>"',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            university: { type: 'string' },
            campus: { type: 'string' },
            dorm: { type: 'string' },
            studentIdVerified: { type: 'boolean' },
            avatar: { type: 'string' },
            bio: { type: 'string' },
            graduationYear: { type: 'integer' },
            rating: { type: 'number' },
            reviewCount: { type: 'integer' },
          },
        },
        Listing: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            originalPrice: { type: 'number' },
            category: { type: 'string' },
            condition: { type: 'string', enum: ['Brand New', 'Like New', 'Good', 'Fair'] },
            status: { type: 'string', enum: ['active', 'pending', 'sold'] },
            images: { type: 'array', items: { type: 'string' } },
            campus: { type: 'string' },
            pickupLocation: { type: 'string' },
            isNegotiable: { type: 'boolean' },
            views: { type: 'integer' },
            favoritesCount: { type: 'integer' },
            sellerId: { type: 'integer' },
            seller: { $ref: '#/components/schemas/User' },
          },
        },
        Conversation: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            listingId: { type: 'integer' },
            buyerId: { type: 'integer' },
            sellerId: { type: 'integer' },
            lastMessageText: { type: 'string' },
            lastMessageAt: { type: 'string', format: 'date-time' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            conversationId: { type: 'integer' },
            senderId: { type: 'integer' },
            text: { type: 'string' },
            messageType: { type: 'string', enum: ['text', 'offer', 'meetup_proposal', 'system'] },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            reviewerId: { type: 'integer' },
            targetUserId: { type: 'integer' },
            rating: { type: 'number' },
            comment: { type: 'string' },
            role: { type: 'string', enum: ['buyer', 'seller'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          summary: 'Register a new student account',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Alex Rivera' },
                    email: { type: 'string', example: 'arivera@stanford.edu' },
                    password: { type: 'string', example: 'Password123!' },
                    university: { type: 'string', example: 'Stanford University' },
                    campus: { type: 'string', example: 'Stanford Main Campus' },
                    dorm: { type: 'string', example: 'Wilbur Hall' },
                    graduationYear: { type: 'integer', example: 2026 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Registration successful with JWT token' },
            400: { description: 'Invalid input or user already exists' },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Log in with student credentials',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'arivera@stanford.edu' },
                    password: { type: 'string', example: 'demo1234' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/me': {
        get: {
          summary: 'Get current authenticated student profile',
          tags: ['Auth'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Authenticated user profile' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/listings': {
        get: {
          summary: 'Query campus marketplace listings',
          tags: ['Listings'],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'campus', in: 'query', schema: { type: 'string' } },
            { name: 'condition', in: 'query', schema: { type: 'string' } },
            { name: 'minPrice', in: 'query', schema: { type: 'number' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'popular'] } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Paginated marketplace listings' },
          },
        },
        post: {
          summary: 'Post a new item for sale on campus',
          tags: ['Listings'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'price', 'category', 'pickupLocation'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                    originalPrice: { type: 'number' },
                    category: { type: 'string' },
                    condition: { type: 'string', enum: ['Brand New', 'Like New', 'Good', 'Fair'] },
                    images: { type: 'array', items: { type: 'string' } },
                    campus: { type: 'string' },
                    pickupLocation: { type: 'string' },
                    isNegotiable: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Listing created' },
          },
        },
      },
      '/listings/{id}': {
        get: {
          summary: 'Get listing details by ID',
          tags: ['Listings'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Detailed listing with seller information and reviews' },
            404: { description: 'Listing not found' },
          },
        },
        put: {
          summary: 'Update listing details',
          tags: ['Listings'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Listing updated' },
          },
        },
        delete: {
          summary: 'Delete listing',
          tags: ['Listings'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Listing deleted' },
          },
        },
      },
      '/listings/{id}/favorite': {
        post: {
          summary: 'Toggle favorite bookmark on a listing',
          tags: ['Listings'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Favorite status updated' },
          },
        },
      },
      '/conversations': {
        get: {
          summary: 'Get all chat conversations for authenticated student',
          tags: ['Messaging'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List of conversations' },
          },
        },
      },
      '/conversations/start': {
        post: {
          summary: 'Start a new inquiry chat for a listing',
          tags: ['Messaging'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['listingId'],
                  properties: {
                    listingId: { type: 'integer' },
                    initialMessage: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Conversation started or existing returned' },
          },
        },
      },
      '/conversations/{conversationId}/messages': {
        post: {
          summary: 'Send a message, offer, or meetup proposal in a conversation',
          tags: ['Messaging'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'conversationId', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['text'],
                  properties: {
                    text: { type: 'string' },
                    messageType: { type: 'string', enum: ['text', 'offer', 'meetup_proposal', 'system'] },
                    metadata: { type: 'object' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Message sent' },
          },
        },
      },
      '/campuses': {
        get: {
          summary: 'List supported university campuses & verified safe pickup spots',
          tags: ['Campuses & Safety'],
          responses: {
            200: { description: 'List of campuses with safe zones' },
          },
        },
      },
      '/reviews': {
        post: {
          summary: 'Post a student rating and review for a completed transaction',
          tags: ['Reviews'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['targetUserId', 'rating', 'comment'],
                  properties: {
                    targetUserId: { type: 'integer' },
                    listingId: { type: 'integer' },
                    rating: { type: 'number', minimum: 1, maximum: 5 },
                    comment: { type: 'string' },
                    role: { type: 'string', enum: ['buyer', 'seller'] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Review posted' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
