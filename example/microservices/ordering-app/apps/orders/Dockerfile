# Use node:alpine as development stage
FROM node:alpine as development

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application files
COPY . .

# Build the application
RUN yarn build

# Prismate the application
RUN npx prisma generate

# Use node:alpine as production stage
FROM node:alpine as production

# Set NODE_ENV variable to production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install only production dependencies using Yarn
RUN yarn install --production

# Copy the rest of the application files
COPY . .

# Copy the build output from the development stage to the production stage
COPY --from=development /usr/src/app/dist ./dist

# Set the default command to run the application
CMD ["node", "dist/apps/orders/main"]
