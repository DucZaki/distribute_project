FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
EXPOSE 8082
HEALTHCHECK --interval=15s --timeout=3s --start-period=60s \
    CMD curl -fsS http://localhost:8082/actuator/health || exit 1
ENTRYPOINT ["java", "-Xms128m", "-Xmx384m", "-XX:+UseSerialGC", "-jar", "/app/app.jar"]
