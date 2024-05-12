# Use an official Node.js image as the base
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# SET ENVIRONMENT VARIABLE
# SSO ENVLnsw2o23!@
ENV API_REF_BASE_URL=https://api.insw.go.id/api/ref/v2
ENV API_SMART_CONTRACT=http://10.239.54.32:8801
ENV SSO_CLIENT_ID="90b61241-8687-40f8-942d-391b54529936"
ENV SSO_CLIENT_SECRET="77a1bae1-b452-46ea-8ade-5fba53a908f6"
ENV SSO_ISSUE_URL=https://sso.insw.go.id/connect/.well-known/openid-configuration
ENV SSO_CALLBACK_URI=http://10.239.54.34:5000
ENV SSO_LOGOUT_URI=https://sso.insw.go.id/connect/session/end?post_logout_redirect_uri=${SSO_CALLBACK_URI}&client_id=${SSO_CLIENT_ID}&attempt=ask
ENV SSO_SCOPE="openid + profile + role + organization"
ENV WEB_HOST=10.239.54.34
ENV WEB_PORT=3000
ENV WEB_URI="http://${WEB_HOST}:${WEB_PORT}"
ENV API_HOST=10.239.54.34
ENV API_PORT=5000
ENV API_URI=http://10.239.54.34:5000
ENV DATABASE_URL="postgresql://myuser:mysecret@insw_db_temp:5432/db_temp_do_req?schema=public&connect_timeout=60"
ENV SC_ADMIN_ID = 'admin'
ENV SC_ADMIN_SECRET = 'adminpw'
ENV NODE_ENV=production
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

RUN npm install
# Copy the rest of the application code
COPY . .

EXPOSE 5000
