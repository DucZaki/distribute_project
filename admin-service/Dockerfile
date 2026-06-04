FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/admin-service-*.jar app.jar
EXPOSE 8090
ENTRYPOINT ["java", "-Xms128m", "-Xmx384m", "-jar", "app.jar"]
