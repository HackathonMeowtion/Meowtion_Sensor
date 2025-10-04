# Use a lightweight Nginx image as the base
FROM nginx:alpine

# Copy all your application files to the Nginx public directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]