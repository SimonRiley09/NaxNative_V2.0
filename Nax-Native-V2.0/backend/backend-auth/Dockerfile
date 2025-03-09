FROM python:3.12.1

WORKDIR /app

COPY requirements.txt ./app

RUN pip install -r requirements.txt

COPY "API.py" /app

USER appregisterer

CMD ["python", "API.py"]