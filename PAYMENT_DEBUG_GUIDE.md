# 🔍 Payment Issue Debugging Guide

## 🚨 Current Issue
**Problem**: Payment succeeds but appointment shows "pending" and success page shows "no appointment found"

## 🔍 Root Cause Analysis

### **Most Likely Issues:**
1. **eSewa callback not being called** (wrong URLs)
2. **Appointment not found in callback** (wrong paymentId)
3. **Payment status not updated** (callback logic issue)
4. **Frontend not finding appointment** (wrong appointmentId)

## 🧪 Debugging Steps

### **Step 1: Check Backend Console**
When you complete a payment, check the backend console for:

#### **Expected Output:**
```
=== ESEWA PAYMENT CALLBACK ===
Request method: POST
Request headers: {...}
Request body: {...}
Extracted callback data:
  transaction_code: 01XV31A
  total_amount: 500.00
  transaction_uuid: txn_123456_abc123
  status: COMPLETE
Searching for appointment with paymentId: txn_123456_abc123
Found appointment: 69a7041eaab6b941ca0ec4fb
Current payment status: pending
=== PAYMENT SUCCESSFUL ===
Appointment updated: 69a7041eaab6b941ca0ec4fb
```

#### **Problem Indicators:**
- ❌ No callback log → eSewa not calling backend
- ❌ "Appointment not found" → paymentId mismatch
- ❌ "Amount mismatch" → amount validation issue

### **Step 2: Check eSewa Callback URLs**
The callback URLs should point to backend, not frontend:

#### **✅ Correct (Fixed):**
```javascript
success_url: "http://localhost:5000/api/esewa/callback"
failure_url: "http://localhost:5000/api/esewa/callback"
```

#### **❌ Wrong (Before Fix):**
```javascript
success_url: "http://localhost:5173/payment-success"
failure_url: "http://localhost:5173/payment-failed"
```

### **Step 3: Check Appointment Creation**
When payment is initiated, check:

#### **Expected:**
```
Created appointment: 69a7041eaab6b941ca0ec4fb
Payment Data: {
  transaction_uuid: "txn_123456_abc123",
  ...
}
```

#### **Verify:**
- ✅ Appointment created with `paymentId: transaction_uuid`
- ✅ `paymentStatus: "pending"`
- ✅ `status: "pending"`

### **Step 4: Check Payment Status API**
After payment, check the status API:

#### **Frontend Call:**
```javascript
GET http://localhost:5000/api/esewa/status/69a7041eaab6b941ca0ec4fb
Authorization: Bearer <token>
```

#### **Expected Response:**
```json
{
  "success": true,
  "data": {
    "appointmentId": "69a7041eaab6b941ca0ec4fb",
    "paymentStatus": "paid",
    "status": "approved",
    "amount": 500,
    "paymentDate": "2026-03-03T...",
    "transactionCode": "01XV31A",
    "paymentId": "txn_123456_abc123"
  }
}
```

## 🔧 Fixes Applied

### **1. Fixed Callback URLs**
```javascript
// OLD (wrong):
success_url: `${CLIENT_URL}/payment-success`

// NEW (correct):
success_url: `http://localhost:5000/api/esewa/callback`
```

### **2. Enhanced Callback Debugging**
```javascript
// Added comprehensive logging:
console.log("=== ESEWA PAYMENT CALLBACK ===");
console.log("Request method:", req.method);
console.log("Request body:", req.body);
console.log("Searching for appointment with paymentId:", transaction_uuid);
```

### **3. Better Error Handling**
```javascript
// Added appointment search debugging:
if (!appointment) {
  console.log("Searching all appointments to see what paymentIds exist...");
  const allAppointments = await Appointment.find({ paymentId: { $exists: true } });
  console.log("Found appointments with paymentId:", allAppointments.map(a => ({ id: a._id, paymentId: a.paymentId })));
}
```

## 🎯 Testing Instructions

### **Complete Test Flow:**
1. **Start backend**: `node server.js`
2. **Start frontend**: `npm run dev`
3. **Login as patient**
4. **Book appointment** with doctor
5. **Click "Pay Now"**
6. **Complete payment** on eSewa test page
7. **Check backend console** for callback logs
8. **Check frontend** for success page

### **What to Look For:**

#### **Backend Console:**
- ✅ "=== ESEWA PAYMENT CALLBACK ==="
- ✅ "Found appointment: [id]"
- ✅ "=== PAYMENT SUCCESSFUL ==="

#### **Frontend:**
- ✅ Redirects to success page
- ✅ Shows appointment details
- ✅ Payment status shows "paid"

#### **Database:**
- ✅ Appointment `paymentStatus: "paid"`
- ✅ Appointment `status: "approved"`
- ✅ `paymentDate` populated

## 🚨 If Still Not Working

### **Check These:**

#### **1. eSewa Test Credentials:**
- Mobile: `9806800001`
- Password: `Nepal@123`
- MPIN: `1122`

#### **2. Network Issues:**
- Backend running on port 5000
- Frontend can reach backend
- eSewa can reach backend (may need ngrok for production)

#### **3. Database Connection:**
- MongoDB connected
- Appointments being created
- Updates being saved

## 📞 Next Steps

### **Run Test and Share Results:**
1. **Complete a payment**
2. **Copy backend console output**
3. **Copy frontend console output**
4. **Share results here**

### **Based on Results:**
- If no callback → eSewa URL issue
- If appointment not found → paymentId mismatch
- If status not updated → callback logic issue

**The debugging is now comprehensive - it will show exactly where the issue is!** 🔍
