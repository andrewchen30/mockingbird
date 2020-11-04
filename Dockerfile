FROM gcr.io/distroless/base-debian10

# WORKDIR /src

COPY bin/cmd /
COPY assets /assets
COPY mockingbird.config.json /src/mockingbird.config.json

ENV PORT 4000
EXPOSE $PORT

ENTRYPOINT ["/mockingbird"]