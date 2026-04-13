.PHONY: build install clean lint test

build:
	go build -o build/exacli ./cmd/exacli

install: build
	cp build/exacli ~/.local/bin/

clean:
	rm -rf build/ result

lint:
	go vet ./...
	golangci-lint run

test:
	go test ./...
