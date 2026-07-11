from pymongo import MongoClient
from datetime import datetime, timedelta
import random

def generate_sales():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["smart_inventory"]  

    products_collection = db["products"]
    sales_collection = db["sales"]

    products = list(products_collection.find())

    if not products:
        print("No products found. Please add some products first.")
        return

    print(f"Found {len(products)} products.")

    sales_records = []

    for product in products:
        product_id = product["_id"]
        seller_id = product["seller"]

        # Generate 60 days of history
        for i in range(60):
            date = datetime.now() - timedelta(days=i)

            # Generate realistic demand pattern
            base_demand = random.randint(5, 20)

            # Weekend boost
            if date.weekday() >= 5:
                base_demand += random.randint(3, 10)

            # Make sure we don't sell more than available stock
            current_quantity = product.get("quantity", 0)
            sale_quantity = min(base_demand, current_quantity)

            if sale_quantity <= 0:
                continue  # Skip if no stock left

            # Insert the sale record
            sales_records.append({
                "product": product_id,
                "quantity": sale_quantity,
                "seller": seller_id,
                "createdAt": date,
                "updatedAt": date
            })

            # Reduce the product quantity in inventory
            products_collection.update_one(
                {"_id": product_id},
                {"$inc": {"quantity": -sale_quantity}}
            )

            # Update local product dict to reflect new quantity
            product["quantity"] = current_quantity - sale_quantity

    if sales_records:
        sales_collection.insert_many(sales_records)
        print(f"Inserted {len(sales_records)} sales records successfully.")

if __name__ == "__main__":
    generate_sales()