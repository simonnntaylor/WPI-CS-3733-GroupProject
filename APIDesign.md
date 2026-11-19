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
