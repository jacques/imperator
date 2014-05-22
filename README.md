# IMPERATOR

This is the cloud CnC solution for sphonic clouds in the JPC and SDC environments.

It is designed to be simple, small and flexible. Unlike OpenStack and others.

It is written in NodeJS. It is to be extended as required. Don't be precious about it.

### Concepts

```node
+-------------+
|             |
| Environment |
|             |
+------+------+
       |       
       |       
       |       
       |       
+------+------+
|             |
|  PLATFORM   |
|             |
+------+------+
       |       
       |       
       |       
   +---+--+    
   |      |    
   | TIER |    
   |      |    
   +--+---+    
      |        
      |        
      |        
      |        
      |        
  +---+-----+  
  |         |  
  | MACHINE |  
  |         |  
  +---------+  
```
### Environment

```node
{
  "environment": {
    "uuid": "965f91f0-e1b6-11e3-8b68-0800200c9a66",
    "name": "SPN Joyent BAU Production",
    "credentials": {
      "uuid": "linked_credentials_uuid_here",
      "sdc_account": "account_name_here",
      "sdc_url": "api_url_here"
    },
    "tiers": {
      "list_of_tiers_here": {}
    }
  }
}
```