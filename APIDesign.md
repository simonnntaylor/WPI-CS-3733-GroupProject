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
/searchDonationCenters
  POST
    {
      "wishListItem" : "shoes"
    }
    200:
    {
      "donationCenters" : [
        {
          "donationCenterName" : "Worcester Community Closet",
          "address" : "100 Institute Rd, Worcester, MA",
          "zipCode" : "01609",
          "wishListItem" : "shoes",
          "quantityNeeded" : 20
        }
      ]
    }
    400:
    {
      "error" : "wishListItem is required"
    }
```

## Prepare Box


```
/prepareBox
  POST
    {
      "donationCenterName" : "Worcester Community Closet",
    }
    200:
    {
      "boxID" : "box-456"
    }
    400:
    {
      "error" : "Donation Center does not exist"
    }
    {
      "error" : "box ID already exists"
    }
```

## Add Item to Box
```
/addItemToBox
  POST
    {
      "boxID" : "box-456",
      "itemName" : "shoes",
      "quantity" : 2
    }
    200:
    {
      "boxID" : "box-456",
      "items" : [
        {
          "itemName" : "shoes",
          "quantity" : 2
        }
      ]
    }
    400:
    {
      "error" : "Must have an item to add into Box"
    }
    {
      "error" : "Box ID already exists"
    }
```

## Remove Item from Box


```
/removeItemFromBox
  POST
    {
      "boxID" : "box-456".
      "itemName" : "shoes",
      "quantity" : 1
    }
    200:
    {
      "boxID" : "box-456",
      "items" : [
        {
          "itemName" : "shoes",
          "quantity" : 1
        }
      ]
    }
    400:
    {
      "error" : "item is not in box"
    }
    {
      "error" : "quantity to remove item is less than quantity in box"
    }
    {
      "error" : "Box ID does not exist"
    }
```

## Complete Box Donation


```
/completeBoxDonation
  POST
    {
      "boxID" : "box-456"
    }
    200:
    {
      "boxID" : "box-456",
      "donationCenterName" : "Worcester Community Closet",
      "items" : [
        {
          "itemName" : "shoes",
          "quantity" : 1
        }
      ]
    }
    400:
    {
      "error" : "Box box-456 is empty"
    }
    {
      "error" : "Box-456 is already donated"
    }
```
