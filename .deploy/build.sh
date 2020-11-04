#!/bin/bash

set -e

COMMIT_ID=$(git rev-parse --verify HEAD)
IMAGE_NAME=andrewchen20/mockingbird:$COMMIT_ID

docker-compose run --rm build
docker-compose build --force-rm mockingbird

docker tag mockingbird:latest "$IMAGE_NAME"

docker push "$IMAGE_NAME"