
PATH := ${CURDIR}/bin:$(PATH)

goexe = $(shell go env GOEXE)

.PHONY: build
build:
	ls cmd | xargs -I {} go build -o bin/cmd/{} cmd/{}/main.go
	for file in ${STATIC_FILES}; do cp -R $$file bin/cmd/; done

proto: clean-up-pb bin/protoc-gen-go
	protoc \
		--plugin="protoc-gen-ts=./web/node_modules/.bin/protoc-gen-ts" \
		--go_out="./pkg" \
		--ts_out="./web/src/interfaces" \
		./pkg/pb/*.proto

bin/protoc-gen-go$(go_exe):
	go build -o $@ google.golang.org/protobuf/cmd/protoc-gen-go


clean-up-pb:
	rm -rf ./pkg/pb/*.pb.go && rm -rf ./web/src/interfaces/pb/*