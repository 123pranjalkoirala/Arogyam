# 🔍 eSewa 400 Error Debug Guide

## 🐛 Current Issue
**Error**: `POST https://rc-epay.esewa.com.np/api/epay/main/v2/form 400 (Bad Request)`

## 🔧 Debug Steps Added

### 1. Backend Signature Debug
```javascript
// Added to payment controller:
console.log("=== SIGNATURE DEBUG ===");
console.log("Data String:", dataString);
console.log("Secret Key:", secretKeyString ? "Present" : "Missing");
console.log("Generated Signature:", signature);
```

### 2. Complete Payment Data Debug
```javascript
// Added to payment controller:
console.log("All Payment Fields:");
Object.entries(paymentData).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
});
```

### 3. Frontend Form Field Debug
```javascript
// Added to PatientDashboard:
console.log(`Adding field: ${fieldName} = ${data.paymentData[fieldName]}`);
console.log("Form data being sent to eSewa:");
```

## 🧪 Testing Instructions

### Step 1: Check Backend Console
When you click "Pay Now", check backend console for:
```
=== SIGNATURE DEBUG ===
Data String: total_amount=500,transaction_uuid=69a70313aab6b941ca0ec409,product_code=EPAYTEST
Secret Key: Present
Generated Signature: abc123...
=== eSewa Payment Initiated ===
All Payment Fields:
  merchant_code: EPAYTEST
  product_code: EPAYTEST
  total_amount: 500
  transaction_uuid: 69a70313aab6b941ca0ec409
  success_url: http://localhost:5000/api/payments/esewa/callback
  failure_url: http://localhost:5000/api/payments/esewa/failure
  signed_field_names: total_amount,transaction_uuid,product_code
  signature: abc123...
```

### Step 2: Check Frontend Console
Check browser console for:
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

### Step 3: Check Network Tab
In browser Network tab:
1. Look for POST request to eSewa
2. Check "Payload" or "Form Data" section
3. Verify all 6 fields are present

## 🚨 Common 400 Error Causes

### 1. Missing Signature
```
Missing required field: signature
```
**Fix**: Check if ESEWA_SECRET_KEY is set in .env

### 2. Wrong Signature Format
```
Generated Signature: (empty or wrong format)
```
**Fix**: Check signature generation debug output

### 3. Missing signed_field_names
```
Missing required field: signed_field_names
```
**Fix**: Ensure signed_field_names matches actual fields

### 4. Amount Format Issue
```
total_amount: 500 (should be "500")
```
**Fix**: Ensure amount is string format

### 5. Transaction UUID Issue
```
transaction_uuid: (empty or invalid)
```
**Fix**: Ensure UUID is properly generated

## 🔍 What to Check

### Backend Console Should Show:
- ✅ ESEWA_SECRET_KEY: Present
- ✅ Data String: correct format
- ✅ Generated Signature: non-empty
- ✅ All 6+ payment fields present

### Frontend Console Should Show:
- ✅ All 6 required fields being added
- ✅ No "Missing required field" errors
- ✅ Form action and method correct

### Network Tab Should Show:
- ✅ POST to eSewa URL
- ✅ Form data contains all fields
- ✅ No missing fields in payload

## 🎯 Next Steps

### If Debug Shows All Fields Present:
The issue might be with:
1. eSewa test API being down
2. Signature algorithm mismatch
3. Field format requirements

### If Debug Shows Missing Fields:
Fix the missing field in backend or frontend.

### If Debug Shows Wrong Signature:
Check the ESEWA_SECRET_KEY value.

## 📞 Run the Test

1. Start backend: `node server.js`
2. Start frontend: `npm run dev`
3. Try payment flow
4. Copy all console output here
5. I'll analyze and fix the specific issue

**The debug output will tell us exactly what's wrong!** 🔍
