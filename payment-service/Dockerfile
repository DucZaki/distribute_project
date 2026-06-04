FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY . .
RUN mvn -q -pl payment-service -am package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /workspace/payment-service/target/payment-service-1.0.0.jar app.jar
EXPOSE 8084
HEALTHCHECK --interval=15s --timeout=3s --start-period=60s \
    CMD curl -fsS http://localhost:8084/actuator/health || exit 1
ENTRYPOINT ["java", "-Xms128m", "-Xmx384m", "-XX:+UseSerialGC", "-jar", "/app/app.jar"]
