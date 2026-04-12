# Image Loading Issues - Troubleshooting Guide

## Problem Summary
Images from the backend bucket are not loading in the POS UI application.

---

## Current Architecture

### Frontend Image Flow
1. **Upload**: User selects image file → sent as `FormData` to `/api/inventory/products/` 
2. **Response**: Backend returns Product object with:
   - `image` field (raw path/filename)
   - `image_url` field (full accessible URL)
3. **Display**: Component renders using `src={product.image_url || product.image}`
4. **Error Handling**: If image fails to load, a placeholder letter (first char of category) displays

### Production URLs
- **Frontend**: Any `.kokotoa.online` domain
- **API Backend**: `https://api-pos.kokotoa.online/api/`
- **Image URLs**: Should be served through same backend

### Proxy Configuration
- **Dev**: Vite proxies `/api` to `http://127.0.0.1:8000`
- **Prod**: Netlify redirects `/api/*` to `https://api-pos.kokotoa.online/api/:splat`

---

## Diagnosis Checklist

### 1. **Check Browser Network Tab** ⚠️ CRITICAL FIRST STEP
```
Open DevTools (F12) → Network tab
- Add a product with an image
- Look for failed image requests (red/pink)
- Note the image URL being requested
- Check the HTTP status code (404, 403, 500, etc.)
```

**Common findings:**
- ❌ **404**: Image file not stored or URL path incorrect
- ❌ **403**: Authentication/permission issue with image access
- ❌ **CORS error**: Image served from different domain without proper headers
- ❌ **No request**: URL might be empty/null

---

### 2. **Verify Backend is Returning image_url**
```javascript
// Check what the backend actually returns
// In DevTools Network tab, click on POST /api/inventory/products/
// Look at Response tab, find the "image_url" field

Example - GOOD response:
{
  "data": {
    "id": 123,
    "name": "Product Name",
    "image": "products/product_123.jpg",
    "image_url": "https://api-pos.kokotoa.online/api/inventory/products/123/image/"
  }
}

Example - BAD response (missing image_url):
{
  "data": {
    "id": 123,
    "name": "Product Name",
    "image": "products/product_123.jpg",
    "image_url": null  // ← Problem!
  }
}
```

---

### 3. **Test image_url Directly in Browser**
```
1. Copy the image_url from network response
2. Paste it into browser address bar
3. See what you get:
   - Image displays ✅ → Problem is in frontend rendering (check console logs)
   - 404 error ❌ → Backend not serving images properly
   - 403 error ❌ → Authentication/permission issue
   - Redirect loop → Configuration issue
```

---

### 4. **Check Backend Image Configuration**

Backend should have:
- ✅ File storage configured (local disk, S3, cloud storage, etc.)
- ✅ Image upload endpoint: `POST /api/inventory/products/` accepting multipart/form-data
- ✅ Image serving endpoint: `GET /api/inventory/products/{id}/image/` or similar
- ✅ Proper file paths returned in `image_url` field
- ✅ CORS headers configured (if serving from different domain)

**Ask backend team:**
- Where are uploaded images being stored?
- What is the full URL to access an uploaded image?
- Is there authentication required to view images?
- What is the image serving endpoint path?

---

### 5. **Common Backend Issues**

#### Issue 5.1: Image Storage Not Configured
```
Error: Images uploaded but not served
Cause: Backend might save filename but not configure storage location
Solution: Backend must specify storage backend (local/S3/etc)
```

#### Issue 5.2: Wrong image_url Format
```
Bad:    "image_url": "products/image.jpg"  (relative path)
Good:   "image_url": "https://api-pos.kokotoa.online/api/inventory/products/123/image/"
Good:   "image_url": "/api/inventory/products/123/image/"  (relative to domain)
```

#### Issue 5.3: Missing Image Serving Endpoint
```
Backend stores image ✅
But doesn't expose endpoint to GET it ❌
Symptom: image_url returns 404 when accessed
```

#### Issue 5.4: CORS Headers Missing
```
Image served from: https://bucket.example.com
Frontend from: https://app.kokotoa.online
Error: CORS policy blocks image loading
Solution: Backend must set Access-Control-Allow-Origin headers
```

#### Issue 5.5: Authentication Required
```
Image endpoint requires Authorization header
But browser can't send it for <img src="">
Symptom: Image loads in Postman/curl (with auth header) but not in browser
Solution: Make image endpoint public or implement token in URL/cookie
```

#### Issue 5.6: Storage Path Issues
```
File uploaded to: /uploads/products/image.jpg
But served from wrong path: /media/image.jpg
Symptom: 404 on image URL
Solution: Verify storage path matches serving path
```

---

### 6. **Frontend Console Logs**

**Where to check:**
1. Open DevTools → Console tab
2. Look for errors related to:
   - `[API] Response Data:` logs after uploading image
   - CORS errors
   - 404/403 errors

**Helpful debugging:**
```javascript
// Add to browser console to inspect product data
localStorage.getItem('products')  // Check if data stored locally
```

---

### 7. **Test with curl/Postman**

If you have backend access, test directly:

```bash
# 1. Upload image (get the JWT token first)
curl -X POST https://api-pos.kokotoa.online/api/inventory/products/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=Test Product" \
  -F "selling_price=1000" \
  -F "image=@/path/to/image.jpg"

# Response should include image_url
# Example response:
# {
#   "data": {
#     "id": 123,
#     "image_url": "https://api-pos.kokotoa.online/api/inventory/products/123/image/"
#   }
# }

# 2. Try to access the image_url
curl -I https://api-pos.kokotoa.online/api/inventory/products/123/image/
# Should get 200 OK, not 404
```

---

## How to Fix (By Component)

### For Frontend Developers
1. Check browser console for errors
2. Inspect network requests for image URLs
3. Test image URL directly in browser
4. Report actual image_url values to backend team

### For Backend Developers
1. Configure image storage backend
2. Ensure uploading stores files correctly
3. Create image serving endpoint
4. Return full accessible URL in `image_url` field
5. Test with curl before frontend integration
6. Ensure proper CORS/authentication setup

---

## Images Location in Code

### Upload Points
- [Inventory:ProductForm (lines 315-325)](src/pages/Inventory/index.tsx#L315)

### Display Points
- [POS Page (lines 405-420)](src/pages/POS/index.tsx#L405) - Main product grid
- [Inventory Modal (lines 449-475)](src/pages/Inventory/index.tsx#L449) - Preview before save
- [ProductDetailsModal (lines 46-48)](src/components/ProductDetailsModal.tsx#L46)

### API Endpoints
- Upload: `POST /api/inventory/products/` (FormData)
- Response field: `image_url` in Product object

---

## Recommended Debug Steps (In Order)

1. ✅ Open DevTools Network tab
2. ✅ Upload a test product with image
3. ✅ Find the POST request to `/inventory/products/`
4. ✅ Check response has `image_url` field
5. ✅ Copy the `image_url` value
6. ✅ Paste URL into new browser tab
7. ✅ See if image loads or get error (404/403/CORS)
8. ✅ Report findings to backend team

---

## Quick Reference: What Each Person Can Check

### QA/Tester
- [ ] Images show "no image" placeholder
- [ ] DevTools shows 404 when accessing image_url
- [ ] Image URL format looks wrong (missing domain, etc.)
- [ ] Error appears in console

### Frontend Dev
- [ ] API response has null/empty image_url
- [ ] Image URL is being used correctly in JSX
- [ ] fallback logic working (shows placeholder)
- [ ] Component receives Product data

### Backend Dev
- [ ] Image file is being saved to disk/storage
- [ ] image_url field is being populated in response
- [ ] Image serving endpoint (`GET /products/{id}/image/`) exists
- [ ] File path matches storage location
- [ ] CORS headers are set appropriately
