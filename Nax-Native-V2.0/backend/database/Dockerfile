FROM postgres:16-alpine

RUN apt-get update && apt-get install -y locales

COPY APIs.sql /docker-entrypoint-initdb.d/

CMD ["postgres"]

USER postgres
