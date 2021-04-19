MyStore's analytics platform is consuming various data sources from its operational systems and is planning to extend its solution by adding more data based on new business cases requirements. Data is coming from two different channels, website and stores. MyStore is building a unique analytics platform to handle both of them.

## Data sources

Here is the current list of data sources:

* Web sale: sales coming from the Web channel. It contains one row per item that can be group by order ID
* Store sale: sales coming from the Store channel. It contains 2 different formats coming from different operational systems:
  * One row per item that can be group by ticket ID
  * One JSON object per sale (identified by a ticket ID) with all the items of the sale in nested array. This data is not yet consumed by the analytics platform.
* Web customer: customers from the Web channel identified by their unique ID. When customers update their personal information, they keep the same ID
* Web customer address: customer addresses coming from the Web channel including Customer demographics and Household demographics. They are identified by a Customer Address ID. Each update in the address of customers generate a new ID
* Store customer: customers from the Store channel identified by their unique ID. When customers update their personal information, they keep the same ID
* Store customer address: customer addresses coming from the Store channel including Customer demographics and Household demographics. They are identified by a Customer Address ID. Each update in the address of customers generate a new ID
* Promotion: promotions available on items and identified by a promo ID
* Item: items available for purchase and identified by item ID
* Warehouse: warehouses responsible for delivering items from Web sales and identified by warehouse ID
* Store: stores where customers purchased items (grouped in sales) and identified by store ID

## Data model

![Data-model](../resources/data-model.png)
