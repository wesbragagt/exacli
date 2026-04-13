.PHONY: build install clean

build:
	go build -o build/exacli ./cmd/exacli

install: build
	cp build/exacli ~/.local/bin/

clean:
	rm -rf build/ result
