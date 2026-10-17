# ---- build ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q clean package -DskipTests

# ---- run ----
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --no-create-home appuser \
    && mkdir -p /app/uploads \
    && chown -R appuser /app
COPY --from=build /app/target/*.jar app.jar
USER appuser
EXPOSE 8080
# Pass secrets as environment variables: JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD,
# SPRING_DATASOURCE_URL / _USERNAME / _PASSWORD, CORS_ALLOWED_ORIGINS, MAIL_FROM ...
ENTRYPOINT ["java", "-jar", "app.jar"]