# Use the official Node.js 20.12.1 image as the base image
FROM node:20.12.1

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port your app runs on
EXPOSE $PORT

# Command to run your application
CMD ["npx", "nodemon"]
