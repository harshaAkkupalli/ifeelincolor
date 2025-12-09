# 🚀 Postman API Testing Guide

Complete guide for testing your backend API using Postman.

---

## 📋 Table of Contents

1. [Setup](#setup)
2. [Environment Variables](#environment-variables)
3. [Authentication](#authentication)
4. [Testing Endpoints](#testing-endpoints)
5. [Common Endpoints](#common-endpoints)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup

### Step 1: Start Your Backend Server

```powershell
cd rough-main
npm start
# or for development
npm run dev
```

**Default Port:** `3000`  
**Base URL:** `http://localhost:3000`

### Step 2: Install Postman

- Download from: https://www.postman.com/downloads/
- Or use Postman Web: https://web.postman.co/

### Step 3: Create Environment

1. Click **"Environments"** in left sidebar
2. Click **"+"** to create new environment
3. Name it: **"Local Development"**
4. Add variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:3000` | `http://localhost:3000` |
| `token` | (leave empty) | (will be set after login) |

5. Click **"Save"**

---

## 🔐 Authentication

### Step 1: Login to Get Token

**Endpoint:** `POST {{base_url}}/api/admin/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@ifeelincolor.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "Admin",
  "email": "admin@ifeelincolor.com"
}
```

### Step 2: Save Token to Environment

1. After login, copy the `token` from response
2. Go to **Environments** → **Local Development**
3. Paste token in `token` variable
4. Click **"Save"**

### Step 3: Use Token in Requests

For protected routes, add header:
```
Authorization: Bearer {{token}}
```

---

## 📝 Testing Endpoints

### Body Assessment Endpoints

#### 1. Create Body Assessment

**Method:** `POST`  
**URL:** `{{base_url}}/api/bodytest`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "question": "How does your shoulder feel?",
  "answer": "Joyful",
  "type": "mcq",
  "score": 10,
  "part": "507f1f77bcf86cd799439011",
  "mcqOptions": [
    {
      "text": "Joyful",
      "color": "#FFC107",
      "emotionHierarchy": {
        "primary": {
          "id": "joy",
          "name": "Joy",
          "color": "#FFD700"
        },
        "secondary": {
          "id": "content",
          "name": "Content",
          "color": "#FFD700"
        },
        "tertiary": {
          "id": "joyful",
          "name": "Joyful",
          "color": "#FFC107",
          "description": "Full of happiness"
        }
      }
    },
    {
      "text": "Courageous",
      "color": "#FFA933",
      "emotionHierarchy": {
        "primary": {
          "id": "joy",
          "name": "Joy",
          "color": "#FFD700"
        },
        "secondary": {
          "id": "powerful",
          "name": "Powerful",
          "color": "#FF9700"
        },
        "tertiary": {
          "id": "courageous",
          "name": "Courageous",
          "color": "#FFA933",
          "description": "Brave and fearless"
        }
      }
    }
  ]
}
```

**Expected Response:**
```json
{
  "status": "success",
  "body": {
    "_id": "...",
    "question": "How does your shoulder feel?",
    "answer": "Joyful",
    "type": "mcq",
    "score": 10,
    "part": "507f1f77bcf86cd799439011",
    "mcqOptions": [...]
  },
  "message": "Body Assessment created successfully"
}
```

---

#### 2. Get All Body Assessments

**Method:** `GET`  
**URL:** `{{base_url}}/api/bodytest`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response:**
```json
{
  "status": "success",
  "body": [
    {
      "_id": "...",
      "question": "...",
      "answer": "...",
      ...
    }
  ]
}
```

---

#### 3. Get Body Assessment by ID

**Method:** `GET`  
**URL:** `{{base_url}}/api/bodytest/:id`

**Example:** `{{base_url}}/api/bodytest/507f1f77bcf86cd799439011`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response:**
```json
{
  "status": "success",
  "body": {
    "_id": "507f1f77bcf86cd799439011",
    "question": "...",
    ...
  }
}
```

---

#### 4. Update Body Assessment

**Method:** `PUT`  
**URL:** `{{base_url}}/api/bodytest/:id`

**Example:** `{{base_url}}/api/bodytest/507f1f77bcf86cd799439011`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "question": "Updated question",
  "answer": "Updated answer",
  "score": 20
}
```

**Expected Response:**
```json
{
  "status": "success",
  "body": {
    "_id": "...",
    "question": "Updated question",
    ...
  },
  "message": "Body Assessment updated successfully"
}
```

---

#### 5. Delete Body Assessment

**Method:** `DELETE`  
**URL:** `{{base_url}}/api/bodytest/:id`

**Example:** `{{base_url}}/api/bodytest/507f1f77bcf86cd799439011`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Body Assessment deleted successfully"
}
```

---

#### 6. Take Body Assessment (Submit Answer)

**Method:** `POST`  
**URL:** `{{base_url}}/api/bodytest/take`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "assessmentId": "507f1f77bcf86cd799439011",
  "answer": "Joyful",
  "patientId": "507f1f77bcf86cd799439012"
}
```

---

#### 7. Get Questions by Part

**Method:** `GET`  
**URL:** `{{base_url}}/api/questions/:partId`

**Example:** `{{base_url}}/api/questions/507f1f77bcf86cd799439011`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

#### 8. Get Questions by Multiple Parts

**Method:** `POST`  
**URL:** `{{base_url}}/api/questions-by-parts`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "partIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ]
}
```

---

## 🔑 Common Endpoints

### Authentication

#### Admin Login
- **Method:** `POST`
- **URL:** `{{base_url}}/api/admin/login`
- **Body:**
```json
{
  "email": "admin@ifeelincolor.com",
  "password": "Admin@123"
}
```

#### Patient Login
- **Method:** `POST`
- **URL:** `{{base_url}}/api/auth/patient-login`
- **Body:**
```json
{
  "email": "patient@example.com",
  "password": "password123"
}
```

#### Patient Register
- **Method:** `POST`
- **URL:** `{{base_url}}/api/auth/patient-register`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

---

### Admin Endpoints

All admin endpoints require: `Authorization: Bearer {{token}}`

Base URL: `{{base_url}}/api/admin`

---

### Patient Endpoints

Base URL: `{{base_url}}/api/patients`

Requires authentication token.

---

### Organization Endpoints

Base URL: `{{base_url}}/api/organization`

---

## 📦 Creating Postman Collection

### Step 1: Create Collection

1. Click **"Collections"** in left sidebar
2. Click **"+"** → **"New Collection"**
3. Name it: **"iFeelInColor API"**

### Step 2: Add Folders

Create folders for organization:
- **Authentication**
- **Body Assessments**
- **Patients**
- **Admin**
- **Organizations**

### Step 3: Add Requests

1. Right-click folder → **"Add Request"**
2. Name the request
3. Set method and URL
4. Add headers and body
5. Click **"Save"**

### Step 4: Use Environment Variables

In URL, use: `{{base_url}}/api/endpoint`  
In headers, use: `Bearer {{token}}`

---

## 🎯 Quick Test Checklist

### ✅ Before Testing

- [ ] Backend server is running
- [ ] Postman is installed
- [ ] Environment is created
- [ ] Base URL is set correctly

### ✅ Authentication

- [ ] Login endpoint works
- [ ] Token is received
- [ ] Token is saved to environment

### ✅ Test Endpoints

- [ ] Create request works
- [ ] Get all works
- [ ] Get by ID works
- [ ] Update works
- [ ] Delete works

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to server"

**Solutions:**
1. Check if backend is running: `npm start`
2. Verify port: Default is `3000`
3. Check URL: Should be `http://localhost:3000`
4. Check firewall settings

---

### Issue: "401 Unauthorized"

**Solutions:**
1. Make sure you're logged in
2. Check token is set in environment
3. Verify token format: `Bearer {{token}}`
4. Token might be expired - login again

---

### Issue: "404 Not Found"

**Solutions:**
1. Check URL path is correct
2. Verify route exists in backend
3. Check base URL is correct
4. Ensure server is running

---

### Issue: "400 Bad Request"

**Solutions:**
1. Check request body format (JSON)
2. Verify required fields are present
3. Check data types match schema
4. Validate email format, etc.

---

### Issue: "500 Internal Server Error"

**Solutions:**
1. Check backend console for errors
2. Verify database connection
3. Check environment variables
4. Review server logs

---

## 💡 Pro Tips

### 1. Use Pre-request Scripts

Add to request → **Pre-request Script** tab:
```javascript
// Auto-refresh token if expired
if (!pm.environment.get("token")) {
    // Login and set token
}
```

### 2. Use Tests Tab

Add assertions in **Tests** tab:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has status field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('status');
});
```

### 3. Save Responses

1. Click **"Save Response"** after request
2. Save as example for documentation
3. Use for reference later

### 4. Use Variables

In URL or body, use variables:
- `{{base_url}}` - Base URL
- `{{token}}` - Auth token
- `{{assessment_id}}` - Save ID from create response

### 5. Export Collection

1. Right-click collection → **Export**
2. Share with team
3. Import in other Postman instances

---

## 📚 API Endpoint Summary

| Endpoint | Method | Auth Required |
|----------|--------|---------------|
| `/api/admin/login` | POST | No |
| `/api/bodytest` | GET, POST | Yes |
| `/api/bodytest/:id` | GET, PUT, DELETE | Yes |
| `/api/bodytest/take` | POST | Yes |
| `/api/questions/:partId` | GET | Yes |
| `/api/questions-by-parts` | POST | Yes |
| `/api/auth/patient-login` | POST | No |
| `/api/auth/patient-register` | POST | No |
| `/api/patients` | GET, POST | Yes |
| `/api/organization` | GET, POST | Yes |

---

## 🚀 Quick Start Example

### 1. Login
```
POST http://localhost:3000/api/admin/login
Body: { "email": "admin@ifeelincolor.com", "password": "Admin@123" }
```

### 2. Save Token
Copy token from response → Set in environment variable

### 3. Test Endpoint
```
GET http://localhost:3000/api/bodytest
Header: Authorization: Bearer {{token}}
```

---

## 📖 Next Steps

1. **Create Postman Collection** - Organize all endpoints
2. **Add Tests** - Automate validation
3. **Document** - Add descriptions to requests
4. **Share** - Export and share with team
5. **Automate** - Use Postman CLI for CI/CD

---

**Happy Testing! 🎉**









