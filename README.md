# VMS Vehicle Approval System

A modern React-based vehicle management and approval system with enhanced validation and user-friendly interface.

## 🚀 Deployment to EC2

### Prerequisites
- AWS EC2 instance (Amazon Linux 2 recommended)
- SSH access to your EC2 instance
- Domain name (optional)

### Step-by-Step Deployment

#### 1. **Launch EC2 Instance**
```bash
# Launch Amazon Linux 2 instance
# Instance Type: t2.micro (free tier) or t2.small
# Security Group: Allow HTTP (80) and HTTPS (443)
```

#### 2. **Connect to EC2**
```bash
# Using SSH key
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Or using AWS Systems Manager Session Manager
aws ssm start-session --target i-1234567890abcdef0
```

#### 3. **Deploy Application**

**Option A: Automated Deployment**
```bash
# Build the application
npm run build

# Upload files to EC2
npm run deploy:upload

# Run deployment script
npm run deploy:setup
```

**Option B: Manual Deployment**
```bash
# 1. Update system
sudo yum update -y

# 2. Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 16
nvm use 16

# 3. Install nginx
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# 4. Upload your dist folder to /var/www/html/
sudo cp -r dist/* /var/www/html/

# 5. Configure nginx (see nginx.conf below)
# 6. Restart nginx
sudo systemctl restart nginx
```

#### 4. **Nginx Configuration**
Create `/etc/nginx/conf.d/react-app.conf`:
```nginx
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

#### 5. **SSL Certificate (Optional)**
```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Environment Variables**
Create `.env` file on EC2:
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/vms/vehicle/plant

# Theme Configuration
VITE_DEFAULT_THEME=teal
```

### **Monitoring & Maintenance**

#### **Logs**
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
pm2 logs
```

#### **Updates**
```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
npm run build
sudo cp -r dist/* /var/www/html/
sudo systemctl restart nginx
```

#### **Backup**
```bash
# Backup application files
sudo tar -czf /backup/app-$(date +%Y%m%d).tar.gz /var/www/html/

# Backup nginx config
sudo cp /etc/nginx/conf.d/react-app.conf /backup/nginx-config-$(date +%Y%m%d).conf
```

### **Troubleshooting**

#### **Common Issues**

1. **App not loading**
   ```bash
   # Check nginx status
   sudo systemctl status nginx
   
   # Check nginx config
   sudo nginx -t
   ```

2. **Permission issues**
   ```bash
   # Fix permissions
   sudo chown -R nginx:nginx /var/www/html/
   sudo chmod -R 755 /var/www/html/
   ```

3. **Firewall issues**
   ```bash
   # Check firewall
   sudo firewall-cmd --list-all
   
   # Allow HTTP/HTTPS
   sudo firewall-cmd --permanent --add-service=http
   sudo firewall-cmd --permanent --add-service=https
   sudo firewall-cmd --reload
   ```

### **Performance Optimization**

1. **Enable Gzip Compression**
   ```nginx
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
   ```

2. **Browser Caching**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **CDN Integration**
   - Use CloudFront for global distribution
   - Configure S3 for static assets

### **Security Best Practices**

1. **Security Headers** (already included in nginx config)
2. **Regular Updates**
   ```bash
   sudo yum update -y
   ```
3. **Backup Strategy**
4. **Monitoring Setup**
5. **SSL Certificate**

## 🎯 Features

- **Enhanced Validation System**
- **Compact UI/UX Design**
- **Progressive Requirements Display**
- **Real-time Status Updates**
- **Responsive Design**

## 📱 Usage

1. Open the application in your browser
2. Navigate through different sections (Pending, Approved, Rejected)
3. Click on vehicle cards to view details
4. Use the approval requirements system to track validation status
5. Approve or reject vehicles based on requirements

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
``` 