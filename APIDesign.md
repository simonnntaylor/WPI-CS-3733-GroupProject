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

## Login Organization

```
/loginOrganization
  POST
    {
        "user": "superUniqueUserName",
        "password": "password123"
    }
    200:
        {
            "token": "token-123-456-789",
        }
    400:
        {
            "error": "user does not exist"
        }
        {
            "error": "invalid password"
        }
```

## Change Password

```
/changePassword
  POST
    {
        "user": "superUniqueUserName",
        "oldPassword": "password123",
        "newPassword": "superSecurePassword456",
        "token": "token-123-456-789"
    }
    200:
        {
            "message": "password changed successfully"
        }
    400:
        {
            "error": "user does not exist"
        }
        {
            "error": "invalid authorization token"
        }
        {
            "error": "invalid old password"
        }
        {
            "error": "new password cannot be empty"
        }
        {
            "error": "new password cannot be the same as the old password"
        }
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
      "message": "Category successfully added"
    }
    400:
    {
      "error": "Category name can't be an empty string"
    }
    {
      "error": "Category already exists"
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
      "message": "Category successfully removed"
    }
    400:
    {
      "error": "Category not found"
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
            "category": "Furniture"
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
      {
         "error": "Category Item requested not found"
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

## Login DonationCenter

Syntax same as Login Organization.

```
/loginDonationCenter
  POST
    {
        "user": "superUniqueUserName",
        "password": "password123"
    }
    200:
        {
            "token": "token-123-456-789",
            "user": "superUniqueUserName",
        }
    400:
        {
            "error": "user does not exist"
        }
        {
            "error": "invalid password"
        }
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
