#!/bin/bash

set -e

COMMIT_ID=$(git rev-parse --verify HEAD)
IMAGE_NAME=andrewchen20/mockingbird:$COMMIT_ID

sudo docker-compose run --rm build
sudo docker-compose build --force-rm mockingbird

sudo docker tag mockingbird:latest "$IMAGE_NAME"

sudo docker push "$IMAGE_NAME"