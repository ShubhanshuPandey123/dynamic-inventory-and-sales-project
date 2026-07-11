import joblib
import logging
import json
from pathlib import Path
import pandas as pd
from pymongo import MongoClient
from bson import ObjectId

from data_loader import load_sales_from_mongodb, aggregate_daily_sales
from feature_engineering import create_features_for_prediction
from train import train_model

logger = logging.getLogger(__name__)

MIN_REQUIRED_DAYS = 20


# ================= STOCK FETCH =================
def get_current_stock(product_id):
    client = MongoClient("mongodb://localhost:27017/")
    db = client["smart_inventory"]
    products_collection = db["products"]

    try:
        product_id = product_id.strip()

        if len(product_id) == 24:
            prod = products_collection.find_one({"_id": ObjectId(product_id)})
        else:
            prod = None

        if prod:
            return prod.get("quantity", 0)

    except Exception:
        pass

    return 0


# ================= PREDICTION =================
def predict_demand_and_reorder(seller_id, product_id, n_days=7):

    df = load_sales_from_mongodb()

    if df.empty:
        return {"error": "No sales data available"}

    seller_id = str(seller_id)
    product_id = str(product_id)

    product_df = df[
        (df["seller"] == seller_id) &
        (df["product"] == product_id)
    ]

    if product_df.empty:
        return {"error": "No sales history for this product"}

    daily_df = aggregate_daily_sales(product_df)

    if len(daily_df) < MIN_REQUIRED_DAYS:
        return {"error": f"Not enough data to train model (need {MIN_REQUIRED_DAYS} days)"}

    repo_root = Path(__file__).resolve().parents[1]
    model_path = repo_root / "models" / "demand_model.pkl"
    features_path = repo_root / "models" / "features_list.pkl"

    if not model_path.exists() or not features_path.exists():
        train_model()

    try:
        model = joblib.load(model_path)
        FEATURES = joblib.load(features_path)
    except Exception as e:
        return {"error": f"Model loading failed: {str(e)}"}

    temp_df = daily_df.copy()
    predictions = []

    for _ in range(n_days):

        feature_df = create_features_for_prediction(
            temp_df,
            feature_list=FEATURES
        )

        latest_row = feature_df.iloc[-1]
        X = pd.DataFrame([latest_row[FEATURES].astype(float)])

        pred = float(model.predict(X)[0])
        pred = max(0.0, pred)

        predictions.append(pred)

        last_date = temp_df.iloc[-1]["date"]
        next_date = last_date + pd.Timedelta(days=1)

        new_row = {
            "seller": seller_id,
            "product": product_id,
            "date": next_date,
            "daily_sales": pred
        }

        temp_df = pd.concat(
            [temp_df, pd.DataFrame([new_row])],
            ignore_index=True
        )

    predicted_total = float(sum(predictions))
    current_stock = int(get_current_stock(product_id))
    reorder_qty = float(max(predicted_total - current_stock, 0))

    trend_msg = (
        "increasing"
        if predicted_total > current_stock
        else "stable/decreasing"
    )

    return {
        "predicted_total": predicted_total,
        "current_stock": current_stock,
        "reorder_qty": reorder_qty,
        "trend": trend_msg,
        "daily_predictions": predictions
    }


# ================= MAIN =================
if __name__ == "__main__":
    seller_id = input().strip()
    product_id = input().strip()
    days = int(input().strip())

    result = predict_demand_and_reorder(
        seller_id,
        product_id,
        n_days=days
    )

    print(json.dumps(result))