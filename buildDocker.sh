#!/usr/bin/env bash

# build latest image
grunt prod

docker build -t loopsun/cyberchef:latest .

docker push loopsun/cyberchef:latest
