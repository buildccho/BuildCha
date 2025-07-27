FROM mcr.microsoft.com/azure-functions/node:4-node22

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

RUN npm install -g pnpm

WORKDIR /home/site/wwwroot
COPY . .
RUN pnpm install
RUN pnpm build