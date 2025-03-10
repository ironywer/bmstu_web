all:
	npm install
	docker-compose build
	docker-compose up -d
	npm run dev-front
down: clean
	docker-compose down
	npm cache clean --force
clean:
	rm -rf node_modules pg_data