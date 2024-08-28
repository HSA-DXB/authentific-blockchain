# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

# Deployment Guide for Authentific API

## Adding SSH Key

To securely access your DigitalOcean Droplet, you need to add your SSH key. Follow the instructions in the official DigitalOcean documentation: [How to Add SSH Keys](https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/).

## Deployment Steps

1. **Log into DigitalOcean**

   - Go to your DigitalOcean account and navigate to the Droplet named `Blockchain-ubuntu-s-1vcpu-1gb-fra1-01`.

2. **SSH into the Server**

   - Click on the IPv4 address of your Droplet.
   - Open your terminal and connect to the server using:
     ```bash
     ssh root@<your_ipv4_address>
     ```

3. **Navigate to the Project Directory**

   - Once logged in, navigate to the project directory:
     ```bash
     cd /home/projects/node/blockchain
     ```

4. **Pull the Latest Code**

   - Update your codebase by pulling the latest changes from your repository:
     ```bash
     git pull
     ```

5. **Check Node Version**

   - Before installing new modules, check the current Node.js version:
     ```bash
     node -v
     ```
   - If you encounter any issues related to the Node.js version, use NVM (Node Version Manager) to switch to the required version.

6. **Using NVM**

   - If NVM is not recognized, run the following command to load it:
     ```bash
     source ~/.bashrc
     ```

7. **Install Node Modules**

   - After ensuring the correct Node.js version, install the necessary modules:
     ```bash
     npm install
     ```

8. **Run the Application in the Background**

   - We use PM2 to manage the Node.js process in the background. The API runs on port 80.
   - Check the running processes with:
     ```bash
     pm2 list
     ```

9. **Restart the Process**
   - Identify the application name or ID (e.g., `blockchain` or ID `0`) and restart the process:
     ```bash
     pm2 restart <app_name_or_id>
     ```

Now your Authentific API should be up and running on your DigitalOcean Droplet!
