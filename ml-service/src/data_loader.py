import os
from dotenv import load_dotenv
from pymongo import MongoClient
import pandas as pd

load_dotenv()


def load_sales_from_mongodb():
    """
    Load sales data from MongoDB.
    Returns DataFrame with columns:
    seller, product, daily_sales, date
    """

    client = MongoClient(os.getenv("MONGO_URI"))
    db = client["smart_inventory"]
    sales_collection = db["sales"]

    sales_data = list(
        sales_collection.find(
            {},
            {
                "_id": 0,
                "product": 1,
                "quantity": 1,
                "createdAt": 1,
                "seller": 1
            }
        )
    )

    if not sales_data:
        print("No sales data found.")
        return pd.DataFrame()

    df = pd.DataFrame(sales_data)

    df = df.rename(
        columns={
            "createdAt": "date",
            "quantity": "daily_sales"
        }
    )

    df["date"] = pd.to_datetime(df["date"])
    df["product"] = df["product"].astype(str)
    df["seller"] = df["seller"].astype(str)

    return df


def aggregate_daily_sales(df):
    """
    Aggregate sales per seller + product per day.
    """

    if df.empty:
        return pd.DataFrame()

    df["date"] = df["date"].dt.date

    daily_df = (
        df.groupby(["seller", "product", "date"])["daily_sales"]
        .sum()
        .reset_index()
    )

    daily_df["date"] = pd.to_datetime(daily_df["date"])

    return daily_df