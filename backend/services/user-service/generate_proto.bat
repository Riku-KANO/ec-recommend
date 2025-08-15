@echo off
echo Generating Protocol Buffers code...

REM Create output directory
if not exist "proto\user\v1" mkdir "proto\user\v1"

REM Generate Go code
protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative proto/user.proto

echo Protocol Buffers code generation complete!