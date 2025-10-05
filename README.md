# MMMF - Max Money Market Funds

<h1 align="center">MMMF</h1>
<h3 align="center">Max Money Market Funds</h3>
<h4 align="center">A Forecasting Application Predicting Account Balance by Date for Best Money Market Funds Deposit Amount.</h4>
<p align="center"><img src="public/icon-500.svg" alt="Logo" width="150" /></p>

## Features

- **Balance Forecasting**: Visualize your account balance over time
- **Starting Balance**: Set and adjust your initial account balance
- **Future Date Based Transactions**: Add income and expenses with specific dates
- **Recurring Transactions**: Store frequently used transactions for quick access
- **Persistent Storage**: All data stored in file-based database
- **Clear Calculations**: Remove all transactions while keeping recurring ones

## Getting Started

### Web Interface

- Access the web interface at `http://<host_ip>:5173`

### Run Using Docker Compose

```yaml
services:
  mmmf:
    image: jasonyangee/mmmf:latest
    container_name: mmmf
    restart: unless-stopped
    ports:
      - "5173:5173"
    volumes:
      - ./mmmf/data:/app/data
    environment:
      TZ: America/Los_Angeles
```

### Docker Image

- [Docker Hub](https://hub.docker.com/r/jasonyangee/mmmf)

  ```
  jasonyangee/mmmf:latest
  ```

- [GitHub Container Registry](https://github.com/jasonyang-ee/mmmf/pkgs/container/mmmf)

  ```
  ghcr.io/jasonyang-ee/mmmf:latest
  ```

### Supported Platforms

- Linux AMD64
- Linux ARM64
- Linux ARMv7

### Data Persistence

- Bind mounts to preserve data: `/app/data/`

### Folder Permissions

It is recommended to run the container with a non-root user. The default user ID is `1000`.

Change to the user ID of your host system if necessary. You can do this by modifying the `user` field in the Docker Compose file.
