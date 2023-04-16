build:
	env GOOS=linux go build -ldflags="-s -w" -o bin/page-create page-create/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/page-load page-load/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/page-update page-update/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/screenshot screenshot/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/og-image-create og-image-create/main.go

clean:
	rm -rf ./bin/*.go ./vendor Gopkg.lock

deploy: clean build
	sls deploy --verbose
