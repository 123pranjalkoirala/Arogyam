# 🔧 eSewa 400 Bad Request Fix

## 🐛 Issue Identified
**Error**: `POST https://rc-epay.esewa.com.np/api/epay/main/v2/form 400 (Bad Request)`
**Problem**: eSewa API rejecting the form data structure

## 🔍 Root Cause Analysis

### Common eSewa 400 Errors:
1. **Missing required fields**
2. **Incorrect field order**
3. **Invalid signature format**
4. **Wrong field names**

### eSewa Required Fields (in order):
```
merchant_code
product_code
total_amount
transaction_uuid
signed_field_names
signature
```

## ✅ Fix Applied

### 1. Structured Form Field Order
```javascript
// OLD (random order):
Object.entries(data.paymentData).forEach(([key, value]) => {

// NEW (correct order):
const requiredFields = [
  'merchant_code',
  'product_code', 
  'total_amount',
  'transaction_uuid',
  'signed_field_names',
  'signature'
];
```

### 2. Field Validation
```javascript
// Added validation for each field:
requiredFields.forEach(fieldName => {
  if (data.paymentData[fieldName]) {
    console.log(`Adding field: ${fieldName} = ${data.paymentData[fieldName]}`);
    // Add field to form
  } else {
    console.error(`Missing required field: ${fieldName}`);
  }
});
```

### 3. Debug Logging
```javascript
// Added detailed logging:
console.log("Form data being sent to eSewa:");
console.log("Action:", form.action);
console.log("Method:", form.method);
```

## 🧪 Testing Instructions

### Test the Fix:
1. Start backend and frontend
2. Login as patient
3. Book appointment
4. Click "Pay Now"
5. Check console for field logging
6. Should see all 6 required fields

### Expected Console Output:
```
Payment Data: {merchant_code: "EPAYTEST", product_code: "EPAYTEST", ...}
Adding field: merchant_code = EPAYTEST
Adding field: product_code = EPAYTEST
Adding field: total_amount = 500
Adding field: transaction_uuid = 69a70313aab6b941ca0ec409
Adding field: signed_field_names = total_amount,transaction_uuid,product_code
Adding field: signature = abc123...
Form data being sent to eSewa:
Action: https://rc-epay.esewa.com.np/api/epay/main/v2/form
Method: POST
```

### If Still 400 Error:
Check these common issues:

#### 1. Missing Fields
```
Missing required field: signed_field_names
Missing required field: signature
```

#### 2. Backend Issues
- Check if signature is generated correctly
- Verify signed_field_names matches actual fields
- Ensure amount is string format

#### 3. eSewa Test Credentials
- Mobile: 9806800001
- Password: Nepal@123
- MPIN: 1122

## 🔍 Debug Steps

### 1. Check Backend Response
```javascript
// In browser console:
console.log("Payment Data:", data.paymentData);
// Should contain all 6 required fields
```

### 2. Check Form Fields
```javascript
// Should see all fields being added:
Adding field: merchant_code = EPAYTEST
Adding field: product_code = EPAYTEST
...
```

### 3. Check Network Request
```javascript
// In Network tab:
// POST to https://rc-epay.esewa.com.np/api/epay/main/v2/form
// Form data should contain all 6 fields
```

## 🎯 Expected Result

**If fix works:**
- ✅ No more 400 Bad Request
- ✅ eSewa payment page opens
- ✅ Can login with test credentials
- ✅ Payment completes successfully

**If still 400:**
- Check console for missing fields
- Verify backend signature generation
- Ensure all required fields present

**The form structure should now match eSewa API requirements!** 🚀
