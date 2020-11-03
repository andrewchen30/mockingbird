
PATH := ${CURDIR}/bin:$(PATH)

goexe = $(shell go env GOEXE)

.PHONY: build
build:
	ls cmd | xargs -I {} go build -o bin/cmd/{} cmd/{}/main.go
	for file in ${STATIC_FILES}; do cp -R $$file bin/cmd/; done