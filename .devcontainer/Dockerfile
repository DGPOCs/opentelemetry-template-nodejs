# syntax=docker/dockerfile:1.6
FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye

WORKDIR /workspace/opentelemetry-template-nodejs

# Install MongoDB shell tools for local debugging (optional)
RUN apt-get update \
    && apt-get install -y --no-install-recommends mongodb-clients \
    && rm -rf /var/lib/apt/lists/*
