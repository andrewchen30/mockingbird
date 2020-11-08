#!/bin/bash

set -e

# COMMIT_ID=$(git rev-parse --verify HEAD)
TAG=$(git tag --points-at HEAD)
IMAGE_NAME=andrewchen20/mockingbird:$TAG

sudo docker-compose run --rm build
sudo docker-compose build --force-rm mockingbird

docker tag mockingbird:latest "$IMAGE_NAME"

sudo docker push "$IMAGE_NAME"
