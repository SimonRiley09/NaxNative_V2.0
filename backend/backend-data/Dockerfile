FROM python:3.12.1

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY app.py functions.py ./templates ./

RUN useradd app

USER app

CMD [ "python", "app.py" ]