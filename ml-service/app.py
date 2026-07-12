from flask import Flask, request, jsonify
from flask_cors import CORS
from src.predict import predict_demand_and_reorder

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "ML Service is running"})


@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    seller_id = data.get("seller_id")
    product_id = data.get("product_id")
    days = data.get("days", 7)

    if not seller_id or not product_id:
        return jsonify({
            "error": "seller_id and product_id are required"
        }), 400

    result = predict_demand_and_reorder(
        seller_id,
        product_id,
        int(days)
    )

    return jsonify(result)


if __name__ == "__main__":
    import os

    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)