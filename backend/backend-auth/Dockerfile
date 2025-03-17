FROM python:3.12.1-alpine

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY "API.py" ./
RUN adduser -D appregisterer
USER appregisterer

CMD ["python", "API.py"]