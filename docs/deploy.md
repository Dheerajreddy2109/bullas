# Deploying Bullas to AWS

This guide puts Bullas on one AWS server so that `bullas.in`, `admin.bullas.in`, every `name.bullas.in` and connected custom domains all work over HTTPS.

Do the steps in order. Commands that start with `$` run **on your Mac**; commands without it run **on the server** after you connect with SSH. Replace every `UPPERCASE_VALUE` with your own.

## How it fits together

```text
Visitor ──HTTPS──▶ Caddy (ports 80, 443) ──▶ React files on disk
                     │                     └▶ Node (127.0.0.1:4000) ──▶ MongoDB Atlas
                     └ gets certificates from Let's Encrypt
```

- **Caddy** handles HTTPS and certificates. It is the only thing the internet can reach.
- **Node** runs the API, kept alive by **PM2**. It listens only inside the server.
- **MongoDB Atlas** stays where it is now, so you don't run a database yourself.

## 1. Create the server

1. In the AWS console, open **EC2 → Launch instance**.
2. Choose **Ubuntu Server 24.04 LTS**, size **t3.small** (2 GB memory is comfortable for Node and Caddy).
3. Create or choose a **key pair**, and keep the `.pem` file safe. This is how you log in; there is no password.
4. Storage: **20 GB gp3**. Uploaded images live here, so allow room to grow.
5. Region: the one nearest your users, for example **ap-south-1 (Mumbai)**.

## 2. Open only the ports you need

In the instance's **security group**, allow:

| Port | From | Why |
|---|---|---|
| 22 (SSH) | **My IP** only | So only you can log in |
| 80 (HTTP) | Anywhere | Let's Encrypt checks and redirects to HTTPS |
| 443 (HTTPS) | Anywhere | The websites |

Don't open port 4000. Node is reached only through Caddy.

## 3. Give the server a permanent address (Elastic IP)

1. **EC2 → Elastic IPs → Allocate**, then **Associate** it with the instance.
2. Note this IP. Customers' main domains point at it with an A record, so **it must never change**.
3. Put it in the server `.env` as `SERVER_IP` (step 9).

## 4. DNS in Route 53

1. **Route 53 → Hosted zones → Create** a zone for `bullas.in`.
2. At the company where you bought `bullas.in`, change its **nameservers** to the four Route 53 shows.
3. In the zone, create these records, each pointing to your Elastic IP:

| Type | Name | Value | Why |
|---|---|---|---|
| A | `bullas.in` | Elastic IP | The main address |
| A | `*.bullas.in` | Elastic IP | Every site, including `admin.bullas.in`, without a record each |
| A | `sites.bullas.in` | Elastic IP | What customers' CNAME records point to |

Check from your Mac after a few minutes (it can take up to a day after changing nameservers):

```bash
$ dig +short dheeraj.bullas.in
$ dig +short sites.bullas.in
```

Both should print your Elastic IP.

## 5. Let Caddy edit DNS for the wildcard certificate

Caddy proves it controls `*.bullas.in` by adding a temporary TXT record in Route 53. Give the server permission for that zone only.

1. Note the hosted zone ID (looks like `Z0123456789ABC`).
2. **IAM → Policies → Create policy → JSON**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["route53:ListResourceRecordSets", "route53:ChangeResourceRecordSets"],
      "Resource": "arn:aws:route53:::hostedzone/YOUR_ZONE_ID"
    },
    {
      "Effect": "Allow",
      "Action": ["route53:ListHostedZonesByName", "route53:ListHostedZones", "route53:GetChange"],
      "Resource": "*"
    }
  ]
}
```

3. **IAM → Roles → Create role** for **EC2**, attach that policy, then **EC2 → Instance → Actions → Security → Modify IAM role** and attach it.

A role is safer than access keys, because there is no secret stored on the server to leak.

## 6. Connect and install Node and PM2

```bash
$ chmod 400 ~/Downloads/YOUR_KEY.pem
$ ssh -i ~/Downloads/YOUR_KEY.pem ubuntu@YOUR_ELASTIC_IP
```

On the server:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl

# Node 24, the same version as your Mac
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
node -v

sudo npm install -g pm2
```

## 7. Install Caddy with the Route 53 plugin

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy

# Add the Route 53 plugin, which the standard Caddy doesn't include
sudo caddy add-package github.com/caddy-dns/route53
caddy list-modules | grep route53

# Stop system updates from replacing Caddy with a version without the plugin
sudo apt-mark hold caddy
```

`caddy list-modules` must print `dns.providers.route53`. When you want to update Caddy later, run `sudo caddy upgrade`, which keeps the plugin.

## 8. Allow the server into MongoDB Atlas

In Atlas, **Security → Network Access → Add IP Address**, enter your **Elastic IP**, and label it `AWS server`. Don't use "Allow access from anywhere".

The free Atlas tier has no automatic backups. Before real customers rely on it, either move to a paid tier with backups or schedule `mongodump` (see step 14).

## 9. Get the code and set its secrets

```bash
sudo mkdir -p /var/www/bullas && sudo chown ubuntu:ubuntu /var/www/bullas
git clone https://github.com/Dheerajreddy2109/bullas.git /var/www/bullas
cd /var/www/bullas/server
npm ci --omit=dev
cp .env.example .env
nano .env
```

Set these in `server/.env`:

```bash
PORT=4000
ROOT_DOMAIN=bullas.in
MONGODB_URI="YOUR_ATLAS_CONNECTION_STRING"
# A NEW secret, different from your Mac's:
# node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=YOUR_NEW_SECRET
CNAME_TARGET=sites.bullas.in
SERVER_IP=YOUR_ELASTIC_IP
NODE_ENV=production
HOST=127.0.0.1
TRUST_PROXY=true
# Encrypts two-factor secrets. Back it up: losing it means everyone sets up 2FA again.
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
TWO_FACTOR_KEY=YOUR_NEW_KEY
```

On the live server, the super admin and builders **must** set up two-factor login at their first login. Have an authenticator app ready on your phone.

Then lock the file so only your user can read it:

```bash
chmod 600 .env
```

If the repository is private, GitHub will ask you to sign in for `git clone`; use a personal access token with read-only access to this one repository.

## 10. Prepare the database and admin account

Only on the very first deployment:

```bash
cd /var/www/bullas/server
node --env-file=.env scripts/seed.js
node --env-file=.env scripts/setSuperAdminPassword.js
```

If the super admin ever loses both their phone and their backup codes, reset their two-factor login on the server with `node --env-file=.env scripts/resetTwoFactor.js`.

If you use the same Atlas database as on your Mac, your existing sites and super admin are already there, so skip this step.

## 11. Build the React app

```bash
cd /var/www/bullas/client
npm ci
VITE_ROOT_DOMAIN=bullas.in npm run build
```

This creates `client/dist`, which Caddy serves. `VITE_ROOT_DOMAIN` is how the app tells `admin.bullas.in` apart from customer sites.

## 12. Start Node with PM2

```bash
cd /var/www/bullas
pm2 start deploy/ecosystem.config.cjs
pm2 logs bullas --lines 20
```

You should see `MongoDB connected` and `Bullas server running`. Then make it start after a reboot:

```bash
pm2 save
pm2 startup
# Run the command that pm2 startup prints.
```

## 13. Start Caddy

```bash
sudo cp /var/www/bullas/deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl edit caddy
```

In the editor that opens, add these lines, then save:

```ini
[Service]
Environment=ACME_EMAIL=YOUR_EMAIL
Environment=AWS_REGION=YOUR_REGION
```

Then:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl restart caddy
sudo journalctl -u caddy -f
```

Watch the log for `certificate obtained successfully` for `*.bullas.in`. Press `Ctrl+C` to stop watching.

## 14. Check everything

**Check the server's clock first.** Two-factor codes stop working the moment their timer ends, so if this clock is even a few seconds out, correct codes get refused. Run:

```bash
timedatectl
```

It should say `System clock synchronized: yes`. If it says `no`, turn it on with `sudo timedatectl set-ntp true`.

From your Mac:

```bash
$ curl -sI https://admin.bullas.in | head -1
$ curl -s https://dheeraj.bullas.in/api/site | head -c 120
```

Confirm the certificate was issued by Let's Encrypt and when it expires:

```bash
$ echo | openssl s_client -connect dheeraj.bullas.in:443 -servername dheeraj.bullas.in 2>/dev/null | openssl x509 -noout -issuer -subject -dates
```

The issuer should mention **Let's Encrypt**, and the subject `*.bullas.in`.

Confirm the internal check is hidden from the internet:

```bash
$ curl -s -o /dev/null -w '%{http_code}\n' "https://admin.bullas.in/api/internal/domain-allowed?domain=x.com"
```

This must print `404`.

## 15. Connecting a customer's custom domain

1. In **admin.bullas.in → Sites → Domain**, enter `dheeraj.com` and save. It shows **Waiting for DNS**.
2. The owner adds, at their domain company:
   - `CNAME` record: name `www`, value `sites.bullas.in`
   - `A` record: name `@`, value your Elastic IP
3. Click **Verify DNS**. When it says **Connected**, open `https://dheeraj.com`. The first visit takes a few seconds while Caddy gets the certificate.
4. Confirm the certificate:

```bash
$ echo | openssl s_client -connect dheeraj.com:443 -servername dheeraj.com 2>/dev/null | openssl x509 -noout -issuer -subject -dates
```

If it fails, check `sudo journalctl -u caddy -n 50` for the reason. A common one is the domain still pointing at its old host.

## 16. Updating the live site later

```bash
cd /var/www/bullas
git pull
cd server && npm ci --omit=dev
cd ../client && npm ci && VITE_ROOT_DOMAIN=bullas.in npm run build
pm2 reload bullas
```

If you changed `deploy/Caddyfile`, also copy it to `/etc/caddy/Caddyfile` and run `sudo systemctl reload caddy`.

## 17. Backups (decide who owns these)

Your quotation says the client arranges backups, but the sites now run on your server, so agree this in writing.

- **Uploaded images** live in `/var/www/bullas/server/uploads` on the server's disk. Use **EC2 → Lifecycle Manager** to snapshot the disk daily.
- **Database:** use a paid Atlas tier with backups, or add a daily `mongodump` to S3.
- **Secrets:** keep a copy of `server/.env` somewhere safe and offline. If you lose `JWT_SECRET`, everyone just logs in again; if you lose the Atlas password, reset it in Atlas.

## Optional: MongoDB on the server instead of Atlas

Only choose this if you are ready to handle database updates, security and backups yourself.

```bash
# Follow MongoDB's official guide for Ubuntu 24.04, then keep it private to this machine:
sudo sed -i 's/^  bindIp: .*/  bindIp: 127.0.0.1/' /etc/mongod.conf
sudo systemctl enable --now mongod
```

Then set `MONGODB_URI="mongodb://127.0.0.1:27017/bullas"` in `server/.env`, and never open port 27017 in the security group.
