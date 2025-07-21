#!/bin/sh

# This script is responsible for replacing placeholders in the static files
# with actual environment variable values before starting the web server.

set -e

# Check that all required environment variables are set
REQUIRED_VARS="TENANT_MANAGER_URL WEB_UI_URL DOCS_URL WEBSITE_URL AUDIT_BACKEND_URL ESO_SERVER_URL"

for VAR_NAME in $REQUIRED_VARS; do
  # Use eval to get the value of the variable whose name is stored in VAR_NAME
  eval VALUE=\$$VAR_NAME
  if [ -z "$VALUE" ]; then
    echo "Error: Environment variable $VAR_NAME is not set. Exiting." >&2
    exit 1
  fi
done

# The root directory where the built static assets are located.
ROOT_DIR=/usr/share/web-ui/html

# Use find to locate all JavaScript files in the directory.
for file in $(find $ROOT_DIR -type f -name "*.js");
do
  # Replace placeholders with environment variable values.
  # The `|` character is used as a separator for sed to avoid issues with URLs.
  sed -i "s|__TENANT_MANAGER_URL__|$TENANT_MANAGER_URL|g" "$file"
  sed -i "s|__WEB_UI_URL__|$WEB_UI_URL|g" "$file"
  sed -i "s|__DOCS_URL__|https://docs.externalsecrets.com|g" "$file"
  sed -i "s|__WEBSITE_URL__|$WEBSITE_URL|g" "$file"
  sed -i "s|__MOCK_AUDIT_ENABLED__|true|g" "$file"
  sed -i "s|__AUDIT_BACKEND_URL__|$AUDIT_BACKEND_URL|g" "$file"
  sed -i "s|__ESO_SERVER_URL__|$ESO_SERVER_URL|g" "$file"
done

# Execute the original command to start Nginx and HAProxy.
exec "$@"
