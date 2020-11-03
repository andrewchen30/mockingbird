#!/bin/bash

set -e

docker-compose down

sh ./start.sh

open http://localhost:3000/admin