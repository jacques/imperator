# IMPERATOR

This is the cloud CnC solution for sphonic clouds in the JPC and SDC environments.

It is designed to be simple, small and flexible. Unlike OpenStack and others.

It is written in NodeJS. It is to be extended as required. Don't be precious about it.

### Concepts

```node
   +------+    
   |      |    
   | USER |    
   |      |    
   +--+---+    
      |        
      |        
      |        
      |        
+-----+-------+
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

### User

This configuration container holds information about a user of Imperator.

```node
{
  "user": {
    "uuid": "965f91f0-e1b6-11e3-8b68-0800200c9a66",
    "username": "",
    "encrypted_password": "",
    "two_factor_id": "",
    "roles": {
      "system_role_1": "administrator",
      "system_role_n": "can_create_cfe_roles"
    },
    "environments": {
      "environment_1": "",
      "environment_2": ""
    }
  }
}
```

### Environment

This configuration container holds information about which environment we are dealing with.

It contains a link to a security database where a users environmental credentials are securely held.

It contains a link to the platforms a user has access to.

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
    "platforms": {
      "list_of_platforms_here": {}
    }
  }
}
```

### Platforms

This configuration container holds infomation about the makeup of each platform within the Environment.

```node
{
  "platform": {
    "uuid": "965f91f0-e1b6-11e3-8b68-0800200c9a66",
    "name": "BAU PRODUCTION",
    "alias": "bau_production",
    "tiers": {
      "list_of_tiers_here": {}
    }
  }
}
```

### Tiers

This configuration container holds information about the makeup of each tier within the Platform.

It identifies the home network for the machines on this tier.

It identifies the network ACL's for the machines on this tier.

```node
{
  "tier": {
    "uuid": "965f91f0-e1b6-11e3-8b68-0800200c9a66",
    "name": "xml_processing_tier",
    "alias": "XML Processing Tier",
    "home_network": "network_uuid_here",
    "machines": {
      "list_of_machines_here": {}
    },
    "network_acls": {
      "inbound_open_ports": {
        "inbound_network_uuid": {
          "port_number": {
            "port_name": {},
            "protocol": {},
            "port_open_reason": {}
          }
        }
      },
      "outbound_open_ports": {
        "outbound_network_uuid": {
          "port_number": {
            "port_name": {},
            "protocol": {},
            "port_open_reason": {}
          }
        }
      }
    }
  }
}
```

### Machines

This configuration container holds information about the makeup of each machine witin the Tier.

It contains information about the CFE roles assigned to this machine. CFE roles are linked to tiers.
You cannot assing a CFE role not permitted on the tier this machine is linked to.

It contains information about the creation of the machine.

It contains information about any shutdown events on the machine.

It contains information about the destruction of the machine.


```node
{
  "machine": {
    "uuid": "965f91f0-e1b6-11e3-8b68-0800200c9a66",
    "roles": {
      "cfe_role_name_1": {},
      "cfe_role_name_n": {}
    },
    "creation_information": {
      "created_date_time": {},
      "created_user": {},
      "created_method": {}
    },
    "shutdown_information": {
      "shutdown_event_uuid": {},
      "shutdown_user": {},
      "shutdown_method": {},
      "shutdown_reason_given": {}
    },
    "destruction_information": {
      "destruction_event_uuid": {},
      "destruction_user": {},
      "destruction_method": {},
      "destruction_reason_given": {}
    }
  }
}
```