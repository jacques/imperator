# IMPERATOR

This application allows the command and control of SmartOS clouds with CFEngine promises.

It is designed to be simple, small and flexible.

It is written in NodeJS.

It is to be extended as required.

Don't be precious with the code. We won't be.

The documentation is WORK IN PROGRESS.

## Concepts

The entity relationship diagram below shows the basic concepts of how Imperator sees it's world.

![alt tag](https://github.com/Sphonic/imperator/blob/master/images/Imperator%20Entity%20Relationship.jpg)

#### Environment


## Actions

#### Create a USER

#### Create an ENVIRONMENT

#### Create a PLATFORM

#### Create a TIER

#### Create a MACHINE

#### Create a PERSONA PACKAGE

#### Create a STINGRAY CONFIG 

#### Create a BOOTSTRAP SCRIPT

#### Create a ROLE


## Users

TODO: @khushil

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
    "name": "Joyent Public Cloud AMS 1",
    "system_name": "joyent_public_cloud_ams_1"
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
    "base_image": "base_image_uuid",
    "personas_package": "personas_package_uuid",
    "bootstrap_script": "bootstrap_script_name",
    "stingray_server": "stingray_uuid",
    "stingray_pool": "stingray_pool_name",
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

Pull stingray pool names from the stingray machine. API https://support.riverbed.com/content/support/software/stingray/traffic-manager.html .

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
    "creation_information": {
      "created_date_time": {},
      "created_user": {},
      "created_method": {}
    },
    "start_information": {
      "start_event_uuid": {},
      "start_user": {},
      "start_method": {},
      "start_reason_given": {}
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

### Stingray Configuration Package

This configuration container holds information about various stingray machines.

Username
Password
API REST Endpoint
etc.


## Related Work
* [Disnix](http://sandervanderburg.blogspot.co.uk/2011/02/disnix-toolset-for-distributed.html). Building on the powerful Nix functional package system, Disnix has an interesting set of three models: Services, which describes the components of the distributed system including dependencies, Machines which describes the resources available to the system, and Distribution, which describes the mapping between the two.
* [Collins](http://tumblr.github.io/collins/), developed at Tumblr, use explained in this [Ansible at Twitter](https://www.youtube.com/watch?v=fwGrKXzocg4?t=14m30s) talk, as a "Single Point of Truth (SPOT)" machine database.
