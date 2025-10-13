# Use a Gradle image to build the application
FROM gradle:7.6-jdk17 as build

# Set the working directory for the Gradle build process
WORKDIR /app

# Copy the Gradle wrapper and source code into the container
COPY . .

# Run the Gradle build process inside the container
RUN gradle build -x test --no-daemon

# Use the OpenJDK image to run the application
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the built JAR file from the Gradle build stage to the final image
COPY --from=build /app/build/libs/*.jar app.jar

# Expose the port the application will run on
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
