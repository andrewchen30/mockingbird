FROM gcr.io/distroless/base-debian10

COPY bin/cmd /
COPY assets /assets

ENV PORT 4000
EXPOSE $PORT

ENTRYPOINT ["/management-server"]