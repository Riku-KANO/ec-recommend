.PHONY: proto
proto:
	protoc --go_out=. --go_opt=paths=source_relative \
		--go-grpc_out=. --go-grpc_opt=paths=source_relative \
		proto/user.proto

.PHONY: run
run:
	go run main.go

.PHONY: test
test:
	go test ./... -v

.PHONY: build
build:
	go build -o user-service main.go

.PHONY: docker-build
docker-build:
	docker build -t ec-recommend/user-service:latest .

.PHONY: docker-run
docker-run:
	docker run -p 50051:50051 \
		-e AWS_REGION=ap-northeast-1 \
		-e USER_TABLE_NAME=ec-recommend-users \
		-e USER_PREFS_TABLE_NAME=ec-recommend-user-preferences \
		-e USER_ADDRESS_TABLE_NAME=ec-recommend-user-addresses \
		ec-recommend/user-service:latest