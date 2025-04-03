FROM python:3.10.4-buster

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--log-config", "logging.yml", "--port", "8000"]