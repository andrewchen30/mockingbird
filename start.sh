#!/bin/bash

set -e

# docker-compose run --rm build-web
docker-compose run --rm build
docker-compose build --force-rm mockingbird

docker-compose up -d envoy
docker-compose up -d mockingbird