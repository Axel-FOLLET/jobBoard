from flask import Flask
from routes.ads import bp as ads_bp

app = Flask(__name__)
app.register_blueprint(ads_bp)

#------ lance un serveur--------
if __name__ == "__main__":
    app.run(port=5000, debug=True)