# AGENTS.md

## Project Shape
- Spring Boot 3.3.4 / Spring Cloud 2023.0.3 Maven microservices repo targeting Java 21.
- Root `pom.xml` is an aggregator parent, but it currently lists modules whose `pom.xml` files do not exist: `identity-service`, `tour-service`, `booking-service`, `payment-service`, `review-service`, `notification-service`, `integration-service`, and `web-bff`.
- Implemented Maven modules are `common-lib`, `discovery-server`, `config-server`, and `api-gateway`.
- Empty service directories with only `src/` are placeholders; do not assume they are buildable modules until they get a `pom.xml`.

## Build And Verification
- Do not start with root reactor commands like `mvn test` or `mvn -pl ...`; Maven fails before selecting modules because the parent references missing child POMs.
- Validate existing modules from the module directory, for example `mvn -q validate` inside `common-lib` or `discovery-server`.
- `common-lib` currently fails `mvn -q install` because `GlobalExceptionHandler` imports Spring Security types but `common-lib/pom.xml` has no Spring Security dependency.
- Dependent modules such as `api-gateway` need `common-lib` available locally; fix/build `common-lib` before trying to package them.

## Architecture Notes
- `common-lib` holds shared DTOs, JWT helpers, exception handling, and security header constants; it is configured as a library and skips Spring Boot repackaging.
- `discovery-server` is the Eureka server and is the only module with an `application.yml`; default port is `8761`.
- `config-server` is a Spring Cloud Config Server and Eureka client, but there is no checked-in config-server resource file or populated `config-repo` yet.
- `api-gateway` is Spring Cloud Gateway with Eureka client, Resilience4j, tracing, Prometheus, JWT validation, and permissive reactive CORS config.

## Cross-Service Contracts
- Gateway JWT validation expects `app.jwt.secret` and issuer `ducnm-microservices` by default, and reads `uid`, subject email, and `roles` claims.
- Authenticated gateway requests are forwarded with `X-User-Id`, `X-User-Email`, and `X-User-Roles`; use `common-lib`'s `SecurityHeaders` constants for these names.
- Shared API responses use `ApiResponse<T>` with `success`, `message`, `data`, `error`, and `timestamp`; shared paging uses `PageResponse<T>`.
