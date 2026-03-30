from flask import Flask , jsonify

app = Flask(__name__)




#routes 
@app.route("/telemetry")
def getTelemetry():
    return 


