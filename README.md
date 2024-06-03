# Tsismis (Gossip)

Here is a working 
[DEMO](https://tsismis.dionaguilar.com) that you could visit. Please be responsible enough not to post or exhaust the demo server.

## Description

This repository contains a Node.js Express GraphQL API that serves as a backend service for a gossip management application. It provides CRUD (Create, Read, Update, Delete) operations for managing gossips and related data in a MongoDB database.

## Features

- **Gossip Creation**: Users can create gossips to share with others.
- **Gossip Browsing**: Users can browse and check out gossips created by others.
- **Account Creation**: Users can create an account to access additional features.
- **Registration**: Users can register their accounts for personalized experiences.

## Key Features

- **Lazy Loading**: Utilizes lazy loading to enhance performance by loading components only when needed.
- **API Integration**: Connects to a backend API, allowing seamless communication for data retrieval and storage.
- **Proper Routing**: Implements proper routing practices to ensure smooth navigation and bookmarking within the application.
- **Observes Code Structure**: Follows a structured code organization to enhance readability, maintainability, and scalability.

## Missing or To-Follow Work

- **Unit Testing**: Implementation of unit tests to ensure code reliability and maintainability.
- **Notifications**: Integrate notifications system to alert users about relevant activities.
- **Follow and Unfollow**: Implement functionality for users to follow and unfollow each other.

## Requirements

- Node.js version 20.12.1 or higher

## Installation

1. Clone the repository:

```
git clone https://github.com/diontristen/tsismis-be
```

2. Install dependencies:

```
npm install
```
3. Create an .env file to your root directory
```
PORT=5001
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=JXpd7W>x09
MONGO_INITDB_HOST=localhost
MONGO_INITDB_PORT=27017
JWT_SECRET=Uu8JlGnQ4CWaVjByzgqQV9t4MBkfcP6X
AVATAR_URL=https://api.dicebear.com/8.x/lorelei-neutral/svg
APP_URL=http://localhost:5000
```
** Note: MongoDB url is translated into this 
```
  const MONGODB_URI = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_INITDB_HOST}:${process.env.MONGO_INITDB_PORT}`
  mongodb://root:JXpd7W>x09@localhost:27017
```
4. Start the development server:

```
npx nodemon
```


##OR##
### Using Docker
1. Clone the repository
```
git clone https://github.com/diontristen/tsismis-be
```
2. Navigate to the project directory:
```
cd tsismis-be
```
3. Build and run the docker container
```
docker-compose up
```
4. Access the api http://localhost:5001

**Note: Adjust the ports in the Dockerfile and docker-compose.yaml relative to your liking

## MongoDB
If you wish to just use the app in dev mode you need a working mongodb service.
You can create a separate docker-compose.yml file
```yaml
version: '3.8'

services:
  tsismis_mongodb:
    image: mongo:4.4
    ports:
      - "27019:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

And run `docker-compose up`

## Usage

1. Access the application through the provided URL.
2. Sign up for an account or log in if already registered.
3. Explore the features to create gossips, browse gossips, and manage your account.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/improvement`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add some feature'`).
5. Push to the branch (`git push origin feature/improvement`).
6. Create a new Pull Request.

---

**Note:** This project is connected with a frontend repository hosted at [https://github.com/diontristen/tsismis-fe](https://github.com/diontristen/tsismis-fe).
