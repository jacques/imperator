# IMPERATOR

This is the cloud CnC solution for sphonic clouds in the JPC and SDC environments.

It is designed to be simple, small and flexible. Unlike OpenStack and others.

It is written in NodeJS. It is to be extended as required. Don't be precious about it.

### Concepts

```asciidoc
   +------+    
   |      |    
   | USER |    
   |      |    
   +---+--+    
       |       
       |       
       |       
       |       
+------+------+
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
    +--+---+   
    |      |   
    | TIER |   
    |      |   
    +--+---+   
       |       
       |       
       |       
       |       
       |       
  +----+----+  
  |         |  
  | MACHINE |  
  |         |  
  +---------+  
```

### User

This container holds information about a user of Imperator. Examples of fields required can be seen
in the json example below. We must also integrate DUOSEC 2FA into the security for this solution.
The DUOSEC integration API can be found at https://www.duosecurity.com/api.


```json
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
      "environment_1": {
       "roles": {
         "system_role_1": "administrator",
         "system_role_n": "can_create_cfe_roles"
       },
      },
      "environment_2": {
       "roles": {
       },
      }
    }
    "platforms": {
      "platform_uudi_here": {
        ""
      }
    }
  }
}
```

The roles are the system actions which this user is permitted to perform.

* Add new users
* Suspend users (users can be reactivated)
* Tombstone users (users can not be reactivated)
* Create Environment configuration
* Create Platform configurations
* Create Tier configurations
* Create Machine configurations
* CRUD for cfengine roles assignable to Tiers and Machines
* CRUD for networks on the platform


### Environment

The ENVIRONMENT container holds information about a particular cloud environment. There is only
one per environment and access is restricted by whatever is set at the USER level.

A unique UUID identifies the particular environment to the system. It has a common name, a user
firendly name. There is also a system name where only alphanums and the underscore character are
allowed. A list of platform UUIDs which associate platforms with this ENVIRONMENT is also present.

```json
{
  "environment": {
    "uuid": "965f91f0-e1b6-11e3-8b68-0800200c9a66",
    "name": "SPN Joyent Amsterdam 1",
    "system_name": "spn_joyent_amsterdam_1"
    "platforms": {
      "platform_uuid_1": "uuid_here",
      "platform_uuid_n": "uuid_here"
    }
  }
}
```

### Platforms

The PLATFORM container holds information about a logical platform within an ENVIRONMENT. Each
platform has a unique UUID which identifies in within Imperator. There is a common name which is
user friendly as well as a system name which is machine friendly.

```json
{
  "platform": {
    "uuid": "965f91f0-e1b6-11e3-8b68-0800200c9a66",
    "common_name": "Sphonic BAU Production",
    "system_name": "sphonic_bau_production"
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

```json
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


```json
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
