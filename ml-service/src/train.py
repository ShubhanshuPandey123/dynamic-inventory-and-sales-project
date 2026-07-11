from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib
import os
from pathlib import Path

from data_loader import load_sales_from_mongodb, aggregate_daily_sales
from feature_engineering import create_features_for_training


def train_model():

    print("Loading data...")
    df = load_sales_from_mongodb()
    if df.empty:
        print("No data found.")
        return

    print("Aggregating daily sales...")
    daily_df = aggregate_daily_sales(df)

    print("Creating features...")
    feature_df = create_features_for_training(daily_df)
    if feature_df.empty:
        print("Not enough data after feature engineering.")
        return

    feature_columns = [
        "lag_1",
        "lag_3",
        "lag_7",
        "lag_14",
        "lag_21",
        "rolling_mean_7",
        "rolling_mean_14",
        "rolling_mean_21",
        "pct_change_7",
        "pct_change_14",
        "day_of_week",
        "month",
        "is_weekend",
    ]

    X = feature_df[feature_columns]
    y = feature_df["target"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, shuffle=False
    )

    print("Training RandomForest model...")
    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    print(f"Model MAE on test set: {mae:.2f}")

    repo_root = Path(__file__).resolve().parents[1]
    models_dir = repo_root / "models"
    os.makedirs(models_dir, exist_ok=True)

    model_path = models_dir / "demand_model.pkl"
    joblib.dump(model, model_path)

    features_list_path = models_dir / "features_list.pkl"
    joblib.dump(feature_columns, features_list_path)

    print("Model saved successfully.")


if __name__ == "__main__":
    train_model()
