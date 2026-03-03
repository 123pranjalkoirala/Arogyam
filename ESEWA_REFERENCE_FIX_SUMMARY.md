# 🔧 eSewa Fix Based on Reference Implementation

## 🎯 Key Issues Fixed by Comparing Reference Code

### ❌ **BEFORE (Your Original Code)**
```javascript
// OLD - Incorrect field structure
const paymentData = {
    merchant_code: ESEWA_MERCHANT_CODE,  // ❌ Wrong field name
    product_code: ESEWA_PRODUCT_CODE,
    total_amount: appointment.amount.toString(),  // ❌ Wrong format
    transaction_uuid: appointment._id.toString(),
    success_url: ESEWA_SUCCESS_URL,
    failure_url: ESEWA_FAILURE_URL,
    signed_field_names: "total_amount,transaction_uuid,product_code"  // ❌ Missing fields
};

// OLD - Wrong response structure
res.json({
    success: true,
    paymentData,  // ❌ Wrong structure
    appointmentId: appointment._id
});
```

### ✅ **AFTER (Reference Implementation)**
```javascript
// NEW - Correct field structure
const totalAmountFormatted = appointment.amount.toFixed(2);  // ✅ Proper decimal format
const paymentData = {
    amount: totalAmountFormatted,              // ✅ Required field
    tax_amount: "0",                          // ✅ Required field
    total_amount: totalAmountFormatted,        // ✅ Required field
    transaction_uuid: appointment._id.toString(),
    product_code: ESEWA_PRODUCT_CODE,
    product_service_charge: "0",             // ✅ Required field
    product_delivery_charge: "0",             // ✅ Required field
    success_url: ESEWA_SUCCESS_URL,
    failure_url: ESEWA_FAILURE_URL,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: signature
};

// NEW - Correct response structure
res.json({
    success: true,
    data: {
        transactionUuid: appointment._id.toString(),
        formData: paymentData,  // ✅ Nested under formData
        formUrl: ESEWA_BASE_URL
    }
});
```

## 🔧 **Specific Fixes Applied**

### **1. Form Data Structure**
- ✅ Added `amount` field
- ✅ Added `tax_amount: "0"`
- ✅ Added `product_service_charge: "0"`
- ✅ Added `product_delivery_charge: "0"`
- ✅ Removed `merchant_code` (not needed in form)
- ✅ Fixed `total_amount` to use 2 decimal places

### **2. Response Structure**
- ✅ Changed `paymentData` to `data.formData`
- ✅ Added `data.formUrl` for frontend
- ✅ Added `data.transactionUuid`

### **3. Frontend Updates**
- ✅ Updated to read `data.data.formData`
- ✅ Updated to use `data.data.formUrl`
- ✅ Added all 11 required fields
- ✅ Fixed field validation

### **4. Required Fields (Complete List)**
```javascript
const requiredFields = [
  'amount',                    // ✅ NEW
  'tax_amount',               // ✅ NEW
  'total_amount',
  'transaction_uuid',
  'product_code',
  'product_service_charge',   // ✅ NEW
  'product_delivery_charge',  // ✅ NEW
  'success_url',
  'failure_url',
  'signed_field_names',
  'signature'
];
```

## 🧪 **Testing Instructions**

### **Expected Backend Output:**
```
=== eSewa Payment Initiated ===
Payment Data: {
  amount: "500.00",
  tax_amount: "0",
  total_amount: "500.00",
  transaction_uuid: "69a70313aab6b941ca0ec409",
  product_code: "EPAYTEST",
  product_service_charge: "0",
  product_delivery_charge: "0",
  success_url: "http://localhost:5000/api/payments/esewa/callback",
  failure_url: "http://localhost:5000/api/payments/esewa/failure",
  signed_field_names: "total_amount,transaction_uuid,product_code",
  signature: "abc123..."
}
```

### **Expected Frontend Output:**
```
Payment response data: {success: true, data: {formData: {...}, formUrl: "..."}}
Payment Data: {formData: {...}, formUrl: "..."}
Adding field: amount = 500.00
Adding field: tax_amount = 0
Adding field: total_amount = 500.00
Adding field: transaction_uuid = 69a70313aab6b941ca0ec409
Adding field: product_code = EPAYTEST
Adding field: product_service_charge = 0
Adding field: product_delivery_charge = 0
Adding field: success_url = http://localhost:5000/api/payments/esewa/callback
Adding field: failure_url = http://localhost:5000/api/payments/esewa/failure
Adding field: signed_field_names = total_amount,transaction_uuid,product_code
Adding field: signature = abc123...
Form data being sent to eSewa:
Action: https://rc-epay.esewa.com.np/api/epay/main/v2/form
Method: POST
```

## 🎯 **Result**

**The eSewa integration now matches the working reference implementation:**
- ✅ **Correct field structure** (11 fields instead of 6)
- ✅ **Proper decimal formatting** (500.00 instead of 500)
- ✅ **Required service/delivery charges** (set to "0")
- ✅ **Correct response structure** (nested formData)
- ✅ **Frontend matches backend** (proper data access)

**This should fix the 400 Bad Request error!** 🚀

## 📞 **Next Steps**

1. **Restart backend server** (to load new code)
2. **Try payment flow**
3. **Check console outputs** (should match above)
4. **Should redirect to eSewa** without 400 error

**The implementation now follows the exact same pattern as the working reference code!** ✅
