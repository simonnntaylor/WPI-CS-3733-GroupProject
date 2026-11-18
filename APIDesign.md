# API Design

The frontend and backend communicate through a RESTful API.

```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```

## Add Category - Sam

```
/addCategory
POST
{
   "name": "Appliances"
}
    200:
    {
      "name": "Appliances",
      "message": "Catagory successfully added"
    }
    400:
    {
      "error": "Catagory name can't be an empty string"
    }
    {
      "error": "Catagory already exists"
    }
    {
      "error": "Low price cannot exceed high price"
    }
   
```

## Remove Category - Sam

```
/removeCategory
POST
{
   "name": "Appliances"
}
    200:
    {
      "name": "Appliances",
      "message": "Catagory successfully removed"
    }
    400:
    {
      "error": "Catagory not found"
    }
    
```

## Upload Category Items - Sam


```
/uploadCategoryItems
POST
{
   "category": "Furniture",
   "name": "Chair"
   "lowPrice": 10.0,
   "highPrice": 30.0
}
    200:
       {
         "name": "Chair"
         "message": "Item successfully added"

       }
    400:
    {
      "error": "Category for this item does not exist yet"
    }
    {
      "error": "Catagory for this item already exists
    }
```

## Remove Category Item - Sam


```
/removeCategoryItem
POST
{
   "category": "Furniture",
   "name": "Chair"
}
    200:
       {
         "name": "Chair"
         "message": "Item successfully removed"

       }
    400:
    {
      "error": "Category for this item does not exist"
    }
     {
      "error": "Category Item for this item does not exist"
    }
```

## Edit Category Item - Sam
```
/editCategoryItem
PUT
{
  "category": "Furniture",
  "originalName": "Chair",
  "name": "Office Chair",
  "lowPrice": 15,
  "highPrice": 40
}
   200:
      {
      "message": "Category item successfully updated"
      }    
   400:
      {
      "error": "Low price cannot exceed high price"
      }
```

## List DonationCenters


```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```

## Register DonationCenter


```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```

## Remove DonationCenter


```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```

## List Inventory


```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```

## List DonationCenters (pagination)


```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```

## Map DonationCenters


```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```

## Search DonationCenters by WishList


```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```

## Prepare Box


```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```

## Add Item to Box


```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```

## Remove Item from Box


```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```

## Complete Box Donation


```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```
