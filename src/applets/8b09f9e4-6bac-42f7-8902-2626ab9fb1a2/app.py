
from flask import Flask
from tasks import main_task

app = Flask(__name__)

@app.route('/')
def hello_world():
    result = main_task()
    return f'Result from main_task: {result}'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)
