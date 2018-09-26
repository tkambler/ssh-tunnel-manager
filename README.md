# SSH Tunnel Manager

The running container expects to find a configuration file (see below) at `/tunnels/config.json`;

## Sample Config File

```
{
    "tunnels": [
        {
            "ssh_host": "host.com",
            "ssh_user": "ubuntu",
            "ssh_port": 22,
            "ssh_identity_file": "/opt/app/private-key.pem",
            "dest_host": "desthost.com",
            "dest_port": 5432,
            "local_port": 5432
        }
    ]
}
```