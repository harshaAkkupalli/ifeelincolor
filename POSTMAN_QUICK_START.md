# ⚡ Postman Quick Start - 5 Minutes

Get started testing your API in Postman right now!

---

## 🚀 Step 1: Start Backend

```powershell
cd rough-main
npm start
```

Server runs on: `http://localhost:3000`

---

## 🔧 Step 2: Setup Postman

### Create Environment

1. Open Postman
2. Click **"Environments"** → **"+"**
3. Name: **"Local"**
4. Add variables:
   - `base_url` = `http://localhost:3000`
   - `token` = (leave empty)
5. Click **"Save"**
6. Select **"Local"** environment (top right)

---

## 🔐 Step 3: Login (Get Token)

### Request Setup

1. Click **"New"** → **"HTTP Request"**
2. Method: **POST**
3. URL: `{{base_url}}/api/admin/login`
4. **Headers** tab:
   - `Content-Type`: `application/json`
5. **Body** tab:
   - Select **"raw"** → **"JSON"**
   - Paste:
   ```json
   {
     "email": "admin@ifeelincolor.com",
     "password": "Admin@123"
   }
   ```
6. Click **"Send"**

### Save Token

1. Copy `token` from response
2. Go to **Environments** → **Local**
3. Paste in `token` variable
4. Click **"Save"**

---

## ✅ Step 4: Test Endpoint

### Get All Body Assessments

1. **New Request**
2. Method: **GET**
3. URL: `{{base_url}}/api/bodytest`
4. **Headers** tab:
   - `Authorization`: `Bearer {{token}}`
5. Click **"Send"**

**Expected:** List of assessments

---

## 📝 Common Requests

### Create Assessment

**POST** `{{base_url}}/api/bodytest`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "question": "How do you feel?",
  "answer": "Good",
  "type": "mcq",
  "score": 10,
  "part": "507f1f77bcf86cd799439011",
  "mcqOptions": [
    {
      "text": "Joyful",
      "color": "#FFC107"
    }
  ]
}
```

---

### Get by ID

**GET** `{{base_url}}/api/bodytest/YOUR_ID_HERE`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

### Update

**PUT** `{{base_url}}/api/bodytest/YOUR_ID_HERE`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "question": "Updated question"
}
```

---

### Delete

**DELETE** `{{base_url}}/api/bodytest/YOUR_ID_HERE`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 🎯 Test Credentials

### Super Admin
- Email: `admin@ifeelincolor.com`
- Password: `Admin@123`

### Test Users
- Admin: `test@test.com` / `123`
- Org Admin: `org@gmail.com` / `123`
- Manager: `test@gmail.com` / `123`

---

## 🐛 Quick Fixes

### "Cannot connect"
- ✅ Check server is running
- ✅ Verify URL: `http://localhost:3000`

### "401 Unauthorized"
- ✅ Login again to get new token
- ✅ Check `Authorization` header format

### "404 Not Found"
- ✅ Check URL path is correct
- ✅ Verify route exists

---

## 📚 Full Guide

See `POSTMAN_TESTING_GUIDE.md` for:
- Complete endpoint list
- Advanced features
- Troubleshooting
- Best practices

---

**You're ready to test! 🚀**









