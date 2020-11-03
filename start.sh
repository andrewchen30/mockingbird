#!/bin/bash

set -e

docker-compose run --rm build
docker-compose build --force-rm management-server

docker-compose up -d envoy
docker-compose up -d management-server