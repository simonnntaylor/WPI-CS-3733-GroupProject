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

## Add Category

```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```

## Remove Category

```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```

## Upload Category Items


```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```

## Remove Category Item


```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```

## Edit Category Item


```
/resourceName
  GET or POST
    Payload-to-aws-if-present
    200:
       Payload-out-on-success
    400:
       Payload-out-on-failure
```

## List DonationCenters - Mike


```
/listDonationCenters
GET
    200:
    {
      "donationCenters": [
        {
          "name": "Worcester Food Pantry",
          "totalItems": 42,
          "totalInventoryValue": 1250.00
        },
        {
          "name": "Lowell Community Closet",
          "totalItems": 17,
          "totalInventoryValue": 310.50
        }
      ]
    }
```

## Register DonationCenter -Mike


```
/registerDonationCenter
POST
    {
      "name": "Worcester Food Pantry",
      "streetAddress": "100 Institute Rd, Worcester, MA 01609",
      "latitude": 42.2746,
      "longitude": -71.8063,
      "password": "secret123"
    }
    200:
    {
      "name": "Worcester Food Pantry",
      "streetAddress": "100 Institute Rd, Worcester, MA 01609",
      "latitude": 42.2746,
      "longitude": -71.8063,
      "message": "DonationCenter successfully registered"
    }
    400:
    {
      "error": "DonationCenter name can't be an empty string"
    }
    {
      "error": "Street address can't be an empty string"
    }
    {
      "error": "Password can't be an empty string"
    }
    {
      "error": "Password must be at least 8 characters and contain at least one letter and one number"
    }
    {
      "error": "GPS location is invalid"
    }
    {
      "error": "DonationCenter name already exists"
    }
    {
      "error": "A DonationCenter is already registered at this street address"
    }
```

## Remove DonationCenter - Mike


```
/removeDonationCenter
POST
    {
      "token": "abc123token",
      "confirm": true
    }
    200:
    {
      "name": "Worcester Food Pantry",
      "message": "DonationCenter successfully removed"
    }
    400:
    {
      "error": "Invalid or expired token"
    }
    {
      "error": "Removal must be confirmed"
    }
```

## List Inventory - Mike


```
/listInventory
POST
    {
      "token": "abc123token",
      "page": 1,
      "pageSize": 10
    }
    200:
    {
      "items": [
        {
          "name": "Winter Coat",
          "category": "Clothing",
          "lowPrice": 15.0,
          "highPrice": 40.0
        },
        {
          "name": "Canned Soup",
          "category": "Food",
          "lowPrice": 1.0,
          "highPrice": 3.0
        }
      ],
      "page": 1,
      "pageSize": 10,
      "totalItems": 42,
      "totalPages": 5
    }
    400:
    {
      "error": "Invalid or expired token"
    }
    {
      "error": "Page must be greater than zero"
    }
    {
      "error": "Page size must be greater than zero"
    }
    {
      "error": "Page does not exist"
    }
```

## List DonationCenters (pagination) - Mike


```
/browseDonationCenters
POST
    {
      "page": 1,
      "pageSize": 10
    }
    200:
    {
      "donationCenters": [
        {
          "name": "Worcester Food Pantry",
          "streetAddress": "100 Institute Rd, Worcester, MA 01609",
          "latitude": 42.2746,
          "longitude": -71.8063
        },
        {
          "name": "Lowell Community Closet",
          "streetAddress": "50 Market St, Lowell, MA 01852",
          "latitude": 42.6334,
          "longitude": -71.3162
        }
      ],
      "page": 1,
      "pageSize": 10,
      "totalDonationCenters": 23,
      "totalPages": 3
    }
    400:
    {
      "error": "Page must be greater than zero"
    }
    {
      "error": "Page size must be greater than zero"
    }
    {
      "error": "Page does not exist"
    }
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
