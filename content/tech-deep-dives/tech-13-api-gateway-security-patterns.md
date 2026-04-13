# API Gateway Security Patterns: Kong, AWS API Gateway, and Azure APIM

**Difficulty:** Intermediate  
**Keywords:** API Gateway, Kong, AWS API Gateway, Azure APIM, rate limiting, authentication  
**Estimated Reading Time:** 14-16 minutes

---

## Table of Contents

1. [Introduction](#introduction)
2. [API Gateway Architecture Overview](#api-gateway-architecture-overview)
3. [Kong Gateway Security](#kong-gateway-security)
4. [AWS API Gateway Security](#aws-api-gateway-security)
5. [Azure API Management Security](#azure-api-management-security)
6. [Common Security Patterns](#common-security-patterns)
7. [Zero Trust with API Gateways](#zero-trust-with-api-gateways)
8. [Monitoring and Threat Detection](#monitoring-and-threat-detection)

---

## Introduction

### Overview

API gateways have evolved from simple routing proxies to comprehensive security platforms. They serve as the first line of defense for microservices architectures, handling authentication, authorization, rate limiting, and threat detection before requests reach backend services.

Modern API gateways support multiple deployment models including cloud-native, on-premises, and hybrid configurations. Understanding the security capabilities and configurations of popular gateways like Kong, AWS API Gateway, and Azure API Management is essential for building secure API infrastructure.

### Key Points

- API gateways centralize security controls for distributed systems
- Different gateways offer varying security capabilities
- Security should be layered across multiple gateway features
- Gateway configuration must align with organizational security policies

## API Gateway Architecture Overview

### Overview

An API gateway sits between clients and backend services, acting as a reverse proxy that routes requests, enforces policies, and aggregates responses. From a security perspective, the gateway provides a chokepoint where security controls can be applied consistently across all APIs.

The security responsibilities of an API gateway include SSL/TLS termination, request validation, authentication and authorization, rate limiting, caching, and logging. By centralizing these concerns, organizations can ensure consistent security posture across their API portfolio.

### Code Example

```yaml
# Generic API Gateway architecture
gateway:
  listeners:
    - port: 443
      protocol: https
      tls:
        certificate: /certs/gateway.crt
        key: /certs/gateway.key
        min_version: "1.2"
        cipher_suites:
          - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
          - TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
  
  security_policies:
    authentication:
      - type: jwt
        issuer: "https://auth.example.com"
        jwks_uri: "https://auth.example.com/.well-known/jwks.json"
      - type: api_key
        header: X-API-Key
        
    rate_limiting:
      - match: authenticated
        requests_per_minute: 1000
      - match: anonymous
        requests_per_minute: 100
        
    cors:
      allowed_origins:
        - "https://app.example.com"
      allowed_methods:
        - GET
        - POST
        - PUT
        - DELETE
      allowed_headers:
        - Authorization
        - Content-Type
      max_age: 3600
```

### Key Points

- SSL/TLS termination should use modern cipher suites
- Authentication policies should support multiple methods
- Rate limiting prevents abuse and ensures fair usage
- CORS configuration limits cross-origin attack surface

## Kong Gateway Security

### Overview

Kong Gateway is an open-source, cloud-native API gateway built on NGINX. It offers a plugin-based architecture that enables extensive customization of security behaviors. Kong can be deployed on-premises, in the cloud, or in Kubernetes environments.

Kong's security plugins cover authentication (JWT, OAuth 2.0, LDAP), traffic control (rate limiting, request size limiting), transformation (bot detection, CORS), and logging (TCP, UDP, HTTP). The declarative configuration model supports GitOps workflows for security policy management.

### Code Example

```yaml
# Kong declarative configuration (kong.yml)
_format_version: "3.0"

services:
  - name: user-api
    url: http://user-service:8080
    routes:
      - name: user-routes
        paths:
          - /api/users
        strip_path: false
        methods:
          - GET
          - POST
          - PUT
          - DELETE
    plugins:
      # Authentication
      - name: jwt
        config:
          uri_param_names: []
          cookie_names: []
          key_claim_name: iss
          secret_is_base64: false
          claims_to_verify:
            - exp
          maximum_expiration: 86400
          
      # Rate limiting
      - name: rate-limiting
        config:
          minute: 100
          hour: 1000
          policy: redis
          redis_host: redis-cluster
          redis_port: 6379
          redis_timeout: 2000
          fault_tolerant: true
          hide_client_headers: false
          
      # Bot detection
      - name: bot-detection
        config:
          allow:
            - "^GoogleBot$"
            - "^BingBot$"
          deny:
            - "^Scrapy$"
            - "^curl$"
            - "^Postman"
          
      # Request transformer
      - name: request-transformer
        config:
          add:
            headers:
              - X-Request-ID:$(uuid)
              - X-Forwarded-For:$(headers.x-forwarded-for)
          remove:
            headers:
              - X-Internal-Token
              
      # IP restriction
      - name: ip-restriction
        config:
          allow:
            - 10.0.0.0/8
            - 172.16.0.0/12
          deny:
            - 192.168.1.100
            
      # CORS
      - name: cors
        config:
          origins:
            - "https://app.example.com"
            - "https://admin.example.com"
          methods:
            - GET
            - POST
            - PUT
            - PATCH
            - DELETE
          headers:
            - Authorization
            - Content-Type
            - X-Request-ID
          exposed_headers:
            - X-Request-ID
          max_age: 3600
          credentials: true
          
      # Request validator
      - name: request-validator
        config:
          body_schema: '{"type":"object","properties":{"name":{"type":"string"},"email":{"type":"string","format":"email"}},"required":["name","email"]}'
          allowed_content_types:
            - application/json
            - application/x-www-form-urlencoded
            
      # Proxy cache
      - name: proxy-cache
        config:
          response_code:
            - 200
            - 301
            - 404
          request_method:
            - GET
            - HEAD
          content_type:
            - text/plain
            - application/json
          cache_ttl: 300
          strategy: memory
```

### Key Points

- Use JWT plugin for stateless authentication
- Configure Redis-backed rate limiting for distributed deployments
- Implement IP restrictions for internal APIs
- Enable bot detection to block malicious clients

## AWS API Gateway Security

### Overview

AWS API Gateway is a fully managed service for creating, publishing, and securing APIs at any scale. It integrates deeply with the AWS ecosystem, offering native integration with IAM, Cognito, Lambda authorizers, and WAF.

AWS API Gateway supports REST APIs, HTTP APIs, and WebSocket APIs, each with different security capabilities. The service provides built-in DDoS protection through CloudFront, throttling at multiple levels, and request/response transformation through mapping templates.

### Code Example

```yaml
# AWS SAM template for API Gateway
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Api:
    Cors:
      AllowMethods: "'GET,POST,PUT,DELETE,OPTIONS'"
      AllowHeaders: "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'"
      AllowOrigin: "'https://app.example.com'"
      MaxAge: "'600'"
    Auth:
      DefaultAuthorizer: CognitoAuthorizer
      Authorizers:
        CognitoAuthorizer:
          UserPoolArn: !GetAtt UserPool.Arn
          Identity:
            Header: Authorization
            ValidationExpression: "^Bearer .*"

Resources:
  # REST API with comprehensive security
  SecureApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: prod
      TracingEnabled: true
      MethodSettings:
        - ResourcePath: /*
          HttpMethod: '*'
          ThrottlingBurstLimit: 100
          ThrottlingRateLimit: 50
          LoggingLevel: INFO
          MetricsEnabled: true
          DataTraceEnabled: false
      
      AccessLogSetting:
        DestinationArn: !GetAtt ApiGatewayAccessLogGroup.Arn
        Format: '{"requestId":"$context.requestId","ip":"$context.identity.sourceIp","requestTime":"$context.requestTime","httpMethod":"$context.httpMethod","routeKey":"$context.routeKey","status":"$context.status","responseLength":"$context.responseLength","integrationLatency":"$context.integrationLatency","responseLatency":"$context.responseLatency","userAgent":"$context.identity.userAgent","error":"$context.error.message"}'
      
      DefinitionBody:
        openapi: 3.0.1
        info:
          title: Secure API
          version: 1.0.0
        paths:
          /users:
            get:
              security:
                - CognitoAuthorizer: []
              x-amazon-apigateway-integration:
                uri: !Sub "arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${UserFunction.Arn}/invocations"
                httpMethod: POST
                type: aws_proxy
              responses:
                '200':
                  description: Success
              x-amazon-apigateway-request-validator: ValidateAll
              x-amazon-apigateway-request-validators:
                ValidateAll:
                  validateRequestParameters: true
                  validateRequestBody: true
                  
          /public/health:
            get:
              security: []
              x-amazon-apigateway-integration:
                uri: !Sub "arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${HealthFunction.Arn}/invocations"
                httpMethod: POST
                type: aws_proxy
                
        components:
          securitySchemes:
            CognitoAuthorizer:
              type: apiKey
              name: Authorization
              in: header
              x-amazon-apigateway-authtype: cognito_user_pools
              x-amazon-apigateway-authorizer:
                type: cognito_user_pools
                providerARNs:
                  - !GetAtt UserPool.Arn
                
  # Lambda authorizer for custom authentication
  CustomAuthorizerFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/authorizer
      Handler: index.handler
      Runtime: nodejs18.x
      Environment:
        Variables:
          JWT_SECRET: !Ref JwtSecret
          
  # Usage plan with API key
  ApiUsagePlan:
    Type: AWS::ApiGateway::UsagePlan
    Properties:
      ApiStages:
        - ApiId: !Ref SecureApi
          Stage: prod
      Throttle:
        BurstLimit: 100
        RateLimit: 50
      Quota:
        Limit: 10000
        Period: DAY
        
  ApiKey:
    Type: AWS::ApiGateway::ApiKey
    Properties:
      Enabled: true
      
  UsagePlanKey:
    Type: AWS::ApiGateway::UsagePlanKey
    Properties:
      KeyType: API_KEY
      KeyId: !Ref ApiKey
      UsagePlanId: !Ref ApiUsagePlan

  # WAF WebACL
  ApiGatewayWAF:
    Type: AWS::WAFv2::WebACL
    Properties:
      Name: ApiGatewayProtection
      Scope: REGIONAL
      DefaultAction:
        Allow: {}
      VisibilityConfig:
        SampledRequestsEnabled: true
        CloudWatchMetricsEnabled: true
        MetricName: ApiGatewayProtection
      Rules:
        - Name: RateLimitRule
          Priority: 1
          Statement:
            RateBasedStatement:
              Limit: 2000
              AggregateKeyType: IP
          Action:
            Block: {}
          VisibilityConfig:
            SampledRequestsEnabled: true
            CloudWatchMetricsEnabled: true
            MetricName: RateLimitRule
            
        - Name: SQLInjectionProtection
          Priority: 2
          Statement:
            OrStatement:
              Statements:
                - SqliMatchStatement:
                    FieldToMatch:
                      Body: {}
                    TextTransformations:
                      - Priority: 0
                        Type: URL_DECODE
                - SqliMatchStatement:
                    FieldToMatch:
                      QueryString: {}
                    TextTransformations:
                      - Priority: 0
                        Type: URL_DECODE
          Action:
            Block: {}
          VisibilityConfig:
            SampledRequestsEnabled: true
            CloudWatchMetricsEnabled: true
            MetricName: SQLInjectionProtection
```

### Key Points

- Use Cognito User Pools for user authentication
- Implement Lambda authorizers for custom auth logic
- Configure WAF for additional layer of protection
- Enable CloudWatch logging for security monitoring

## Azure API Management Security

### Overview

Azure API Management (APIM) provides a hybrid, multi-cloud management platform for APIs. It offers comprehensive security features including OAuth 2.0/OpenID Connect integration, client certificate authentication, subscription keys, and integration with Azure Active Directory.

APIM's policy system allows fine-grained control over API behavior through XML-based policies. These policies can enforce authentication, rate limiting, caching, and transformation at various scopes (global, product, API, and operation).

### Code Example

```xml
<!-- Azure APIM Policy Configuration -->
<policies>
    <inbound>
        <!-- CORS Configuration -->
        <cors>
            <allowed-origins>
                <origin>https://app.example.com</origin>
                <origin>https://admin.example.com</origin>
            </allowed-origins>
            <allowed-methods>
                <method>GET</method>
                <method>POST</method>
                <method>PUT</method>
                <method>DELETE</method>
                <method>OPTIONS</method>
            </allowed-methods>
            <allowed-headers>
                <header>Content-Type</header>
                <header>Authorization</header>
                <header>X-Request-ID</header>
            </allowed-headers>
            <expose-headers>
                <header>X-Request-ID</header>
                <header>X-RateLimit-Remaining</header>
            </expose-headers>
            <allow-credentials>true</allow-credentials>
        </cors>
        
        <!-- Validate JWT Token -->
        <validate-jwt 
            header-name="Authorization" 
            failed-validation-httpcode="401" 
            require-expiration-time="true"
            require-scheme="Bearer">
            <openid-config url="https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration" />
            <audiences>
                <audience>{client-id}</audience>
            </audiences>
            <issuers>
                <issuer>https://login.microsoftonline.com/{tenant}/v2.0</issuer>
            </issuers>
            <required-claims>
                <claim name="roles" match="any">
                    <value>api.read</value>
                    <value>api.write</value>
                </claim>
            </required-claims>
        </validate-jwt>
        
        <!-- Rate Limit by Key -->
        <rate-limit calls="100" renewal-period="60" 
                    remaining-calls-header-name="X-RateLimit-Remaining"
                    retry-after-header-name="X-RateLimit-Retry-After" />
        
        <!-- Rate Limit by Subscription -->
        <rate-limit-by-key calls="1000" renewal-period="60" 
                          counter-key="@(context.Subscription?.Key ?? "anonymous")"
                          remaining-calls-header-name="X-RateLimit-Remaining" />
        
        <!-- IP Restriction -->
        <ip-filter action="allow">
            <address-range from="10.0.0.0" to="10.255.255.255" />
            <address>192.168.1.100</address>
        </ip-filter>
        
        <!-- Validate Content Type -->
        <check-header name="Content-Type" failed-check-httpcode="415" 
                      failed-check-error-message="Unsupported Media Type">
            <value>application/json</value>
            <value>application/xml</value>
        </check-header>
        
        <!-- Set Headers -->
        <set-header name="X-Request-ID" exists-action="skip">
            <value>@((string)context.Variables["requestId"])</value>
        </set-header>
        
        <set-header name="X-Forwarded-For" exists-action="override">
            <value>@(context.Request.IpAddress)</value>
        </set-header>
        
        <!-- Remove sensitive headers from request -->
        <set-header name="X-Internal-Token" exists-action="delete" />
        
        <!-- Cache Lookup -->
        <cache-lookup vary-by-developer="false" vary-by-developer-groups="false" 
                      downstream-caching-type="none">
            <vary-by-header>Accept</vary-by-header>
            <vary-by-header>Accept-Charset</vary-by-header>
        </cache-lookup>
        
        <!-- Mock response for testing -->
        <mock-response status-code="200" content-type="application/json" />
    </inbound>
    
    <backend>
        <forward-request timeout="30" follow-redirects="false" />
    </backend>
    
    <outbound>
        <!-- Cache Store -->
        <cache-store duration="300" />
        
        <!-- Remove sensitive headers from response -->
        <set-header name="X-Powered-By" exists-action="delete" />
        <set-header name="Server" exists-action="delete" />
        
        <!-- Mask sensitive data in response -->
        <find-and-replace from="\"ssn\":\"[0-9-]+\"" to="\"ssn\":\"***-**-****\"" />
        <find-and-replace from="\"password\":\"[^\"]+\"" to="\"password\":\"[REDACTED]\"" />
        
        <!-- JSON to XML transformation if needed -->
        <json-to-xml apply="always" consider-accept-header="true" />
        
        <!-- Set response headers -->
        <set-header name="X-Content-Type-Options" exists-action="override">
            <value>nosniff</value>
        </set-header>
        <set-header name="X-Frame-Options" exists-action="override">
            <value>DENY</value>
        </set-header>
        <set-header name="X-XSS-Protection" exists-action="override">
            <value>1; mode=block</value>
        </set-header>
        <set-header name="Strict-Transport-Security" exists-action="override">
            <value>max-age=31536000; includeSubDomains</value>
        </set-header>
    </outbound>
    
    <on-error>
        <!-- Custom error handling -->
        <choose>
            <when condition="@(context.LastError.Source == "validate-jwt")">
                <return-response>
                    <set-status code="401" reason="Unauthorized" />
                    <set-header name="WWW-Authenticate" exists-action="override">
                        <value>Bearer error="invalid_token"</value>
                    </set-header>
                    <set-body>@{ 
                        return new JObject(
                            new JProperty("error", "Authentication failed"),
                            new JProperty("message", context.LastError.Message)
                        ).ToString(); 
                    }</set-body>
                </return-response>
            </when>
            <when condition="@(context.LastError.Source == "rate-limit")">
                <return-response>
                    <set-status code="429" reason="Too Many Requests" />
                    <set-header name="Retry-After" exists-action="override">
                        <value>@(context.Response.Headers.GetValueOrDefault("X-RateLimit-Retry-After", "60"))</value>
                    </set-header>
                </return-response>
            </when>
        </choose>
    </on-error>
</policies>
```

### Key Points

- Use Azure AD integration for enterprise authentication
- Leverage policy expressions for dynamic security decisions
- Implement comprehensive header security controls
- Configure proper error handling to prevent information leakage

## Common Security Patterns

### Overview

Regardless of the specific API gateway technology, certain security patterns are universally applicable. These patterns include defense in depth, least privilege access, secure defaults, and comprehensive monitoring.

Implementing these patterns requires understanding both the capabilities of your chosen gateway and the specific security requirements of your APIs. The following examples demonstrate common security patterns that can be adapted to any gateway platform.

### Code Example

```javascript
// Common security patterns implementation

// Pattern 1: Defense in Depth
const defenseInDepth = {
  layers: [
    { name: 'WAF', protection: 'DDoS, SQL Injection, XSS' },
    { name: 'API Gateway', protection: 'Auth, Rate Limiting, Validation' },
    { name: 'Service Mesh', protection: 'mTLS, Authorization' },
    { name: 'Application', protection: 'Input Validation, Business Logic' },
    { name: 'Database', protection: 'Encryption, Access Control' }
  ]
};

// Pattern 2: Circuit Breaker
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

// Pattern 3: Token Validation Middleware
const tokenValidation = (options) => {
  const { issuer, audience, jwksUri } = options;
  
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }
    
    const token = authHeader.substring(7);
    
    try {
      // Verify JWT with JWKS
      const decoded = jwt.decode(token, { complete: true });
      const jwk = await getJWK(jwksUri, decoded.header.kid);
      
      const verified = jwt.verify(token, jwk.getPublicKey(), {
        issuer,
        audience,
        algorithms: ['RS256']
      });
      
      req.user = verified;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

// Pattern 4: Request ID Tracking
const requestTracking = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  // Add to logger context
  req.logger = logger.child({ requestId });
  
  next();
};

// Pattern 5: Secure Headers
const secureHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};
```

### Key Points

- Implement multiple layers of security controls
- Use circuit breakers to prevent cascade failures
- Generate and propagate request IDs for tracing
- Apply security headers to all responses

## Zero Trust with API Gateways

### Overview

Zero Trust architecture assumes no trust by default, requiring verification for every access request regardless of source. API gateways play a crucial role in implementing Zero Trust by enforcing authentication, authorization, and continuous validation at the network edge.

Implementing Zero Trust with API gateways involves strong identity verification, least privilege access, micro-segmentation, and continuous monitoring. Every request is treated as potentially hostile until proven otherwise.

### Code Example

```yaml
# Zero Trust API Gateway Configuration
zero_trust_gateway:
  identity:
    provider: oauth2
    require_mfa: true
    session_timeout: 3600
    
  authorization:
    model: rbac  # role-based access control
    enforce_policies: true
    dynamic_authorization: true
    
  network:
    microsegmentation:
      enabled: true
      segments:
        - name: public
          allowed_origins: []
          auth_required: true
        - name: internal
          allowed_origins: ["10.0.0.0/8"]
          mtls_required: true
          
  monitoring:
    continuous_validation: true
    anomaly_detection: true
    behavioral_analysis: true
    
  policies:
    - name: deny-by-default
      action: deny
      match: all
      
    - name: require-authentication
      action: allow
      match: authenticated
      conditions:
        - valid_token: true
        - not_revoked: true
        - within_scope: true
        
    - name: device-compliance
      action: allow
      match: compliant_devices
      conditions:
        - device_trust_score: "> 0.7"
        - os_patched: true
        - encryption_enabled: true
```

### Key Points

- Never trust based on network location alone
- Verify identity and device compliance continuously
- Implement micro-segmentation for API access
- Monitor and analyze all API traffic for anomalies

## Monitoring and Threat Detection

### Overview

Effective security monitoring for API gateways requires collecting and analyzing metrics, logs, and traces. Security teams need visibility into authentication failures, rate limit violations, unusual traffic patterns, and potential attack indicators.

Modern API gateway monitoring integrates with SIEM platforms, security analytics tools, and alerting systems. Machine learning-based anomaly detection can identify sophisticated attacks that evade traditional rule-based detection.

### Code Example

```javascript
// Security monitoring implementation
const securityMonitor = {
  // Track authentication events
  logAuthEvent: (event) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'AUTH_EVENT',
      event: event.type, // 'success', 'failure', 'logout'
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
      endpoint: event.endpoint,
      reason: event.reason,
      riskScore: calculateRiskScore(event)
    };
    
    securityLogger.info(logEntry);
    
    if (event.type === 'failure') {
      alertOnRepeatedFailures(event);
    }
  },
  
  // Monitor rate limit violations
  logRateLimit: (event) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'RATE_LIMIT',
      clientId: event.clientId,
      endpoint: event.endpoint,
      limit: event.limit,
      currentUsage: event.currentUsage,
      severity: event.currentUsage > event.limit * 2 ? 'HIGH' : 'MEDIUM'
    };
    
    securityLogger.warn(logEntry);
  },
  
  // Detect anomalies
  detectAnomalies: (metrics) => {
    const anomalies = [];
    
    // Unusual traffic volume
    if (metrics.requestsPerMinute > baseline.requestsPerMinute * 3) {
      anomalies.push({
        type: 'TRAFFIC_SPIKE',
        severity: 'HIGH',
        details: `Requests/min: ${metrics.requestsPerMinute} (baseline: ${baseline.requestsPerMinute})`
      });
    }
    
    // Geographic anomalies
    const uniqueCountries = new Set(metrics.requests.map(r => r.country)).size;
    if (uniqueCountries > baseline.maxCountries * 2) {
      anomalies.push({
        type: 'GEO_ANOMALY',
        severity: 'MEDIUM',
        details: `Requests from ${uniqueCountries} countries`
      });
    }
    
    // Error rate spike
    const errorRate = metrics.errors / metrics.total;
    if (errorRate > 0.1) {
      anomalies.push({
        type: 'ERROR_SPIKE',
        severity: 'HIGH',
        details: `Error rate: ${(errorRate * 100).toFixed(2)}%`
      });
    }
    
    return anomalies;
  }
};

// Alert on suspicious patterns
const alertOnRepeatedFailures = (event) => {
  const key = `auth_failures:${event.ip}`;
  const failures = cache.increment(key, 1, 3600); // 1 hour window
  
  if (failures >= 5) {
    securityAlert.send({
      severity: 'HIGH',
      type: 'BRUTE_FORCE_ATTEMPT',
      source: event.ip,
      details: `${failures} authentication failures in the last hour`,
      recommendedAction: 'Consider blocking IP temporarily'
    });
  }
};
```

### Key Points

- Log all security-relevant events with context
- Implement real-time alerting for suspicious activity
- Use behavioral analytics for anomaly detection
- Correlate API events with broader security telemetry

---

## Conclusion

API gateways are essential components of modern API security architecture. Whether you choose Kong for its flexibility, AWS API Gateway for its cloud integration, or Azure APIM for its enterprise features, the fundamental security principles remain the same.

Effective API gateway security requires layered defenses, strong authentication, continuous monitoring, and regular security assessments. By implementing the patterns and configurations described in this guide, you can significantly improve the security posture of your API infrastructure.

## Further Reading

- [Kong Gateway Documentation](https://docs.konghq.com/)
- [AWS API Gateway Security](https://docs.aws.amazon.com/apigateway/latest/developerguide/security.html)
- [Azure API Management Policies](https://docs.microsoft.com/en-us/azure/api-management/api-management-policies)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
