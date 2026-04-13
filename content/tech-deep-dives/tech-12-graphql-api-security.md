# GraphQL API Security: Protecting Against Query Attacks and Data Exposure

**Difficulty:** Advanced  
**Keywords:** GraphQL security, query depth limiting, introspection, N+1 problem, injection attacks  
**Estimated Reading Time:** 15-18 minutes

---

## Table of Contents

1. [Introduction](#introduction)
2. [GraphQL Security Model](#graphql-security-model)
3. [Query Depth and Complexity Analysis](#query-depth-and-complexity-analysis)
4. [Introspection and Schema Exposure](#introspection-and-schema-exposure)
5. [Authentication and Authorization](#authentication-and-authorization)
6. [Injection Attack Prevention](#injection-attack-prevention)
7. [Denial of Service Protection](#denial-of-service-protection)
8. [Error Handling and Information Leakage](#error-handling-and-information-leakage)

---

## Introduction

### Overview

GraphQL has revolutionized API design by enabling clients to request exactly the data they need. However, this flexibility introduces unique security challenges that traditional REST API security practices don't fully address. The ability to construct complex nested queries creates potential attack vectors for resource exhaustion attacks and data over-fetching.

Unlike REST APIs where endpoints are predefined, GraphQL exposes a single endpoint that accepts arbitrary queries. This design requires additional security considerations including query complexity analysis, depth limiting, and careful authorization at the field level. Understanding these GraphQL-specific vulnerabilities is essential for building secure GraphQL APIs.

### Key Points

- GraphQL's flexibility creates unique security challenges
- Query complexity can lead to DoS attacks
- Field-level authorization is critical
- Introspection can expose sensitive schema information

## GraphQL Security Model

### Overview

GraphQL's security model differs fundamentally from REST APIs. In REST, security is often enforced at the endpoint level, while GraphQL requires security at the field and type level. This shift demands a more granular approach to authorization and input validation.

The GraphQL execution engine resolves fields independently, which means each field can potentially trigger database queries or external API calls. This characteristic makes GraphQL susceptible to the N+1 query problem and requires careful query analysis to prevent resource exhaustion.

### Code Example

```javascript
const { GraphQLServer } = require('graphql-yoga');
const { rule, shield } = require('graphql-shield');

// Field-level authorization with graphql-shield
const isAuthenticated = rule({ cache: 'contextual' })(
  async (parent, args, ctx) => {
    return ctx.user !== null;
  }
);

const isOwner = rule({ cache: 'contextual' })(
  async (parent, args, ctx) => {
    return parent.userId === ctx.user?.id;
  }
);

const hasRole = (role) => rule({ cache: 'contextual' })(
  async (parent, args, ctx) => {
    return ctx.user?.roles?.includes(role) ?? false;
  }
);

const permissions = shield({
  Query: {
    me: isAuthenticated,
    users: hasRole('ADMIN'),
    sensitiveData: hasRole('ADMIN')
  },
  Mutation: {
    updateProfile: isAuthenticated,
    deleteUser: hasRole('ADMIN')
  },
  User: {
    email: isOwner,
    privateNotes: isOwner
  }
}, {
  fallbackRule: isAuthenticated,
  fallbackError: new Error('Not authorized')
});

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  middlewares: [permissions]
});
```

### Key Points

- Security must be enforced at the field level, not just endpoint level
- Use middleware libraries like graphql-shield for authorization
- Implement context-based authentication
- Deny by default, explicitly allow access

## Query Depth and Complexity Analysis

### Overview

GraphQL queries can be nested arbitrarily deep, creating potential for denial of service through resource exhaustion. A malicious user could craft a query hundreds of levels deep or request thousands of related objects, overwhelming your database and application servers.

Query depth limiting and complexity analysis are essential defenses. Depth limiting restricts how nested a query can be, while complexity analysis assigns cost scores to fields and rejects queries exceeding a threshold. These protections should be implemented before query execution begins.

### Code Example

```javascript
const { createComplexityLimitRule } = require('graphql-validation-complexity');
const depthLimit = require('graphql-depth-limit');
const { ApolloServer } = require('@apollo/server');

// Complexity calculation configuration
const complexityRules = createComplexityLimitRule(1000, {
  onComplete: (complexity) => {
    console.log(`Query complexity: ${complexity}`);
  },
  createError: (max, actual) => {
    return new Error(`Query too complex: ${actual}. Maximum allowed: ${max}`);
  },
  fieldComplexity: {
    User: {
      posts: 10,  // Each post field adds complexity
      comments: 5,
      followers: 2
    },
    Post: {
      comments: 5,
      author: 1
    }
  }
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [
    depthLimit(7),  // Maximum 7 levels of nesting
    complexityRules,
    // Custom validation for expensive operations
    (context) => ({
      Field(node) {
        if (node.name.value === 'expensiveOperation') {
          const queryString = context.getQueryString();
          if (!context.user?.hasPermission('expensive:read')) {
            throw new Error('Unauthorized for expensive operations');
          }
        }
      }
    })
  ]
});

// Custom depth limit with detailed error
const customDepthLimit = (maxDepth) => {
  return (validationContext) => {
    const depth = calculateDepth(validationContext.getDocument());
    if (depth > maxDepth) {
      throw new Error(`Query exceeds maximum depth of ${maxDepth}. Actual depth: ${depth}`);
    }
  };
};
```

### Key Points

- Limit query depth to prevent nested recursion attacks
- Calculate query complexity before execution
- Assign different complexity weights to expensive fields
- Log complexity metrics for monitoring

## Introspection and Schema Exposure

### Overview

GraphQL introspection allows clients to query the schema itself, discovering available types, fields, and their descriptions. While valuable for development and tooling, introspection in production can expose sensitive information about your data model and internal structure.

Attackers can use introspection to understand your schema and craft targeted attacks. Even field descriptions and deprecation notices can reveal implementation details. Consider disabling introspection in production or restricting it to authenticated administrators.

### Code Example

```javascript
const { ApolloServer } = require('@apollo/server');

// Production-safe server configuration
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  plugins: [
    {
      async requestDidStart() {
        return {
          async didResolveOperation({ request, document }) {
            // Block introspection queries in production
            if (process.env.NODE_ENV === 'production') {
              const introspectionRegex = /\b(__schema|__type|__fields|__args)\b/;
              const queryStr = JSON.stringify(document);
              
              if (introspectionRegex.test(queryStr)) {
                throw new Error('Introspection is disabled in production');
              }
            }
          }
        };
      }
    }
  ]
});

// Role-based introspection access
const introspectionPlugin = {
  async requestDidStart() {
    return {
      async didResolveOperation({ request, contextValue, document }) {
        const queryStr = JSON.stringify(document);
        const hasIntrospection = /\b(__schema|__type)\b/.test(queryStr);
        
        if (hasIntrospection && !contextValue.user?.roles?.includes('DEVELOPER')) {
          throw new Error('Introspection requires DEVELOPER role');
        }
      }
    };
  }
};

// Persisted queries for production (prevents arbitrary queries)
const { ApolloServerPluginPersistedQueries } = require('@apollo/server/plugin/persistedQueries');
const { createPersistedQueryManifest } = require('./persisted-queries-manifest');

const persistedQueriesServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: false,
  plugins: [
    ApolloServerPluginPersistedQueries({
      cache: new RedisCache({ host: 'redis' }),
      ttl: 86400,
      // Only allow persisted queries
      strict: process.env.NODE_ENV === 'production'
    })
  ]
});
```

### Key Points

- Disable introspection in production environments
- Consider persisted queries to prevent arbitrary query execution
- Use allow-lists for approved queries in high-security contexts
- Remove sensitive descriptions from production schema

## Authentication and Authorization

### Overview

GraphQL presents unique authentication challenges because all requests go through a single endpoint. Traditional HTTP authentication methods must be adapted to work within the GraphQL context system. Authorization must be granular enough to handle field-level access control.

Modern GraphQL security implements authentication at the context level, passing user information through the resolver chain. Authorization checks should occur at multiple levels: before query execution, during field resolution, and when accessing data sources.

### Code Example

```javascript
// Context-based authentication
const createContext = async ({ req }) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return { user: null };
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.users.findById(decoded.sub);
    
    return {
      user,
      permissions: decoded.permissions,
      // Data loaders for N+1 prevention
      loaders: createDataLoaders()
    };
  } catch (error) {
    return { user: null };
  }
};

// Resolver-level authorization
const resolvers = {
  Query: {
    user: async (_, { id }, { user, loaders }) => {
      // Authentication check
      if (!user) throw new AuthenticationError('Must be logged in');
      
      const targetUser = await loaders.user.load(id);
      
      // Authorization check
      if (targetUser.id !== user.id && !user.roles.includes('ADMIN')) {
        throw new ForbiddenError('Cannot access this user');
      }
      
      return targetUser;
    }
  },
  
  User: {
    // Field-level authorization
    email: (parent, _, { user }) => {
      if (parent.id !== user?.id && !user?.roles?.includes('ADMIN')) {
        return null;
      }
      return parent.email;
    },
    
    creditCard: (parent, _, { user }) => {
      // Only return masked version
      if (parent.id === user?.id) {
        return maskCreditCard(parent.creditCard);
      }
      return null;
    }
  }
};

// Directive-based authorization
const { authDirectiveTransformer } = require('./directives');

const schema = makeExecutableSchema({
  typeDefs: `
    directive @auth(requires: Role = ADMIN) on FIELD_DEFINITION
    directive @ownerOnly on FIELD_DEFINITION
    
    type Query {
      me: User
      allUsers: [User] @auth(requires: ADMIN)
    }
    
    type User {
      id: ID!
      name: String!
      email: String! @ownerOnly
      salary: Float @auth(requires: HR)
    }
    
    enum Role {
      ADMIN
      HR
      USER
    }
  `,
  resolvers,
  schemaDirectives: {
    auth: authDirectiveTransformer,
    ownerOnly: ownerOnlyDirectiveTransformer
  }
});
```

### Key Points

- Use context to pass authentication state through resolvers
- Implement authorization at multiple levels
- Consider using schema directives for declarative security
- Cache authentication results within the request lifecycle

## Injection Attack Prevention

### Overview

GraphQL APIs are susceptible to injection attacks similar to SQL injection and NoSQL injection. User input in query variables can be exploited if not properly sanitized. Additionally, GraphQL's flexible query structure can be abused to bypass security controls.

SQL injection remains a threat when resolvers construct database queries from user input. NoSQL databases like MongoDB are equally vulnerable to injection attacks through GraphQL variables. Proper input validation and parameterized queries are essential defenses.

### Code Example

```javascript
// SQL injection prevention in resolvers
const resolvers = {
  Query: {
    searchUsers: async (_, { searchTerm, filters }, { user }) => {
      // Validate and sanitize input
      const sanitizedTerm = validator.escape(searchTerm);
      const maxResults = Math.min(filters?.limit || 20, 100);
      
      // Use parameterized queries - NEVER concatenate user input
      const results = await db.query(
        `SELECT id, name, email FROM users 
         WHERE name ILIKE $1 OR email ILIKE $1
         AND active = true
         LIMIT $2`,
        [`%${sanitizedTerm}%`, maxResults]
      );
      
      return results.rows;
    }
  }
};

// NoSQL injection prevention for MongoDB
const resolvers = {
  Query: {
    findProducts: async (_, { query }, context) => {
      // Sanitize query object to prevent injection
      const allowedFilters = ['name', 'category', 'price_min', 'price_max'];
      const sanitizedQuery = {};
      
      for (const key of allowedFilters) {
        if (query[key] !== undefined) {
          // Validate type to prevent operator injection
          if (key === 'price_min' || key === 'price_max') {
            sanitizedQuery[key] = parseFloat(query[key]) || 0;
          } else {
            sanitizedQuery[key] = validator.escape(String(query[key]));
          }
        }
      }
      
      // Build safe MongoDB query
      const mongoQuery = {
        name: sanitizedQuery.name ? { $regex: sanitizedQuery.name, $options: 'i' } : undefined,
        category: sanitizedQuery.category,
        price: {
          ...(sanitizedQuery.price_min && { $gte: sanitizedQuery.price_min }),
          ...(sanitizedQuery.price_max && { $lte: sanitizedQuery.price_max })
        }
      };
      
      // Remove undefined values
      Object.keys(mongoQuery).forEach(key => 
        mongoQuery[key] === undefined && delete mongoQuery[key]
      );
      
      return await db.products.find(mongoQuery).limit(100).toArray();
    }
  }
};

// Input validation with Joi
const Joi = require('joi');

const userSearchSchema = Joi.object({
  searchTerm: Joi.string().max(100).allow(''),
  filters: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
    sortBy: Joi.string().valid('name', 'createdAt', 'email').default('name'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  }).default()
});

const validateInput = (schema) => (resolver) => {
  return async (parent, args, context, info) => {
    const { error, value } = schema.validate(args);
    if (error) {
      throw new UserInputError('Invalid input', { 
        details: error.details.map(d => d.message) 
      });
    }
    return resolver(parent, value, context, info);
  };
};

// Apply validation to resolver
const resolvers = {
  Query: {
    searchUsers: validateInput(userSearchSchema)(async (_, args, context) => {
      // Resolver implementation with validated args
    })
  }
};
```

### Key Points

- Always use parameterized queries
- Validate and sanitize all user inputs
- Limit query result sizes to prevent data exfiltration
- Use allow-lists for filter parameters

## Denial of Service Protection

### Overview

GraphQL's flexibility makes it particularly vulnerable to DoS attacks. Malicious queries can consume excessive resources through deep nesting, large result sets, or expensive field resolution. Protecting against these attacks requires multiple layers of defense.

Resource exhaustion can occur through batch requests, expensive subscriptions, or queries that trigger cascade operations. Timeout controls, query cost analysis, and resource quotas are essential protections. Additionally, implementing data loaders helps prevent N+1 query problems.

### Code Example

```javascript
// DataLoader for N+1 prevention
const DataLoader = require('dataloader');

const createDataLoaders = () => ({
  user: new DataLoader(async (userIds) => {
    const users = await db.users.findMany({
      where: { id: { in: [...new Set(userIds)] } }
    });
    
    const userMap = new Map(users.map(u => [u.id, u]));
    return userIds.map(id => userMap.get(id) || null);
  }, {
    maxBatchSize: 100,
    cacheKeyFn: (key) => String(key)
  }),
  
  posts: new DataLoader(async (userIds) => {
    const posts = await db.posts.findMany({
      where: { authorId: { in: [...new Set(userIds)] } }
    });
    
    const postsByUser = posts.reduce((acc, post) => {
      acc[post.authorId] = acc[post.authorId] || [];
      acc[post.authorId].push(post);
      return acc;
    }, {});
    
    return userIds.map(id => postsByUser[id] || []);
  })
});

// Timeout middleware for resolvers
const timeoutMiddleware = (ms = 5000) => {
  return async (resolve, parent, args, context, info) => {
    return Promise.race([
      resolve(parent, args, context, info),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Resolver timeout')), ms)
      )
    ]);
  };
};

// Query timeout wrapper
const withTimeout = (resolver, timeoutMs) => {
  return async (...args) => {
    const timeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Query exceeded ${timeoutMs}ms timeout`));
      }, timeoutMs);
    });
    
    return Promise.race([resolver(...args), timeout]);
  };
};

// Rate limiting for GraphQL operations
const rateLimitMap = new Map();

const rateLimit = (maxRequests = 100, windowMs = 60000) => {
  return async (resolve, parent, args, context, info) => {
    const key = context.user?.id || context.ip;
    const now = Date.now();
    
    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    } else {
      const record = rateLimitMap.get(key);
      
      if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + windowMs;
      } else if (record.count >= maxRequests) {
        throw new Error('Rate limit exceeded');
      } else {
        record.count++;
      }
    }
    
    return resolve(parent, args, context, info);
  };
};

// Apollo Server with timeout configuration
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    {
      async requestDidStart() {
        const requestStart = Date.now();
        
        return {
          async willSendResponse(requestContext) {
            const duration = Date.now() - requestStart;
            
            if (duration > 5000) {
              console.warn(`Slow query detected: ${duration}ms`, {
                query: requestContext.request.query?.substring(0, 100),
                user: requestContext.contextValue.user?.id
              });
            }
          },
          
          async didEncounterErrors(requestContext) {
            // Log errors without exposing internals
            console.error('GraphQL errors:', 
              requestContext.errors.map(e => ({
                message: e.message,
                path: e.path
              }))
            );
          }
        };
      }
    }
  ]
});
```

### Key Points

- Use DataLoader to prevent N+1 query problems
- Implement timeouts at resolver and query levels
- Apply rate limiting per user or IP address
- Monitor and alert on slow queries

## Error Handling and Information Leakage

### Overview

Error messages in GraphQL can leak sensitive information about your schema, database structure, or internal implementation. Detailed error messages intended for debugging can provide attackers with valuable intelligence about your system.

Production GraphQL APIs should return sanitized error messages while logging detailed information internally. Stack traces, database error messages, and internal identifiers should never reach the client. Error formatting should be consistent to prevent information inference through error message analysis.

### Code Example

```javascript
// Custom error formatter for production
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    // Log detailed error internally
    console.error('GraphQL Error:', {
      message: error.message,
      locations: error.locations,
      path: error.path,
      stack: error.stack,
      extensions: error.extensions
    });
    
    // Return sanitized error to client
    if (process.env.NODE_ENV === 'production') {
      // Don't expose internal error details
      const sanitizedMessage = sanitizeErrorMessage(error.message);
      
      return {
        message: sanitizedMessage,
        // Only include path in development
        ...(process.env.NODE_ENV !== 'production' && { path: error.path })
      };
    }
    
    // Development: return full error details
    return error;
  }
});

function sanitizeErrorMessage(message) {
  // Remove potentially sensitive information
  const sensitivePatterns = [
    /mongodb://[^\s]+/gi,
    /password['"]?\s*[:=]\s*['"]?[^\s'"]+/gi,
    /token['"]?\s*[:=]\s*['"]?[^\s'"]+/gi,
    /SELECT\s+.*\s+FROM/gi,
    /INSERT\s+INTO/gi
  ];
  
  let sanitized = message;
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  
  return sanitized;
}

// Custom error classes
class SafeGraphQLError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

class AuthenticationError extends SafeGraphQLError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHENTICATED', 401);
  }
}

class ForbiddenError extends SafeGraphQLError {
  constructor(message = 'Access denied') {
    super(message, 'FORBIDDEN', 403);
  }
}

class UserInputError extends SafeGraphQLError {
  constructor(message, details) {
    super(message, 'BAD_USER_INPUT', 400);
    this.details = details;
  }
}

// Resolver error handling wrapper
const safeResolver = (resolver) => {
  return async (parent, args, context, info) => {
    try {
      return await resolver(parent, args, context, info);
    } catch (error) {
      // Log full error for debugging
      console.error('Resolver error:', {
        error: error.message,
        stack: error.stack,
        resolver: info.fieldName,
        path: info.path
      });
      
      // Return safe error
      if (error instanceof SafeGraphQLError) {
        throw error;
      }
      
      // Mask unexpected errors
      throw new SafeGraphQLError(
        'An unexpected error occurred',
        'INTERNAL_ERROR',
        500
      );
    }
  };
};
```

### Key Points

- Sanitize all error messages in production
- Use custom error classes with safe messages
- Log detailed errors internally only
- Never expose stack traces or database errors

---

## Conclusion

GraphQL security requires a different mindset than traditional REST API security. The flexibility that makes GraphQL powerful also creates unique vulnerabilities that must be addressed through query analysis, field-level authorization, and careful input validation.

By implementing depth limiting, complexity analysis, proper authentication and authorization, and robust error handling, you can build GraphQL APIs that are both flexible and secure. Regular security testing and staying current with GraphQL security best practices are essential for maintaining a strong security posture.

## Further Reading

- [OWASP GraphQL Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html)
- [Apollo Server Security](https://www.apollographql.com/docs/apollo-server/security/)
- [GraphQL Security Guidelines](https://graphql.org/learn/thinking-in-graphs/)
- [graphql-shield Documentation](https://github.com/maticzav/graphql-shield)
