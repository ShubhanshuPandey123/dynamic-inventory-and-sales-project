import pandas as pd

# ================= TRAINING FEATURES =================
def create_features_for_training(df):
    """
    Create lag, rolling, trend, and time features.
    Target = next day's sales (NOT 7-day total).
    """

    df = df.sort_values(["seller", "product", "date"])

    group_cols = ["seller", "product"]

    # LAG features
    for lag in [1, 3, 7, 14, 21]:
        df[f"lag_{lag}"] = df.groupby(group_cols)["daily_sales"].shift(lag)

    # Rolling mean features
    for window in [7, 14, 21]:
        df[f"rolling_mean_{window}"] = (
            df.groupby(group_cols)["daily_sales"]
            .rolling(window)
            .mean()
            .reset_index(level=[0,1], drop=True)
        )

    # Trend features
    df["pct_change_7"] = df.groupby(group_cols)["daily_sales"].pct_change(7)
    df["pct_change_14"] = df.groupby(group_cols)["daily_sales"].pct_change(14)

    # Time features
    df["day_of_week"] = df["date"].dt.dayofweek
    df["month"] = df["date"].dt.month
    df["is_weekend"] = df["day_of_week"].apply(lambda x: 1 if x >= 5 else 0)

    #  TARGET = NEXT DAY SALES
    df["target"] = df.groupby(group_cols)["daily_sales"].shift(-1)

    df = df.dropna()

    return df


# ================= PREDICTION FEATURES =================
def create_features_for_prediction(df, feature_list=None):
    """
    Create features for recursive prediction.
    """

    df = df.sort_values(["seller", "product", "date"])
    group_cols = ["seller", "product"]

    for lag in [1, 3, 7, 14, 21]:
        df[f"lag_{lag}"] = df.groupby(group_cols)["daily_sales"].shift(lag)

    for window in [7, 14, 21]:
        df[f"rolling_mean_{window}"] = (
            df.groupby(group_cols)["daily_sales"]
            .rolling(window)
            .mean()
            .reset_index(level=[0,1], drop=True)
        )

    df["pct_change_7"] = df.groupby(group_cols)["daily_sales"].pct_change(7)
    df["pct_change_14"] = df.groupby(group_cols)["daily_sales"].pct_change(14)

    df["day_of_week"] = df["date"].dt.dayofweek
    df["month"] = df["date"].dt.month
    df["is_weekend"] = df["day_of_week"].apply(lambda x: 1 if x >= 5 else 0)

    df = df.fillna(0)

    if feature_list is not None:
        df = df.reindex(columns=feature_list, fill_value=0)

    return df
