# 🧪 Esewa Integration Test Guide

## 🚀 Quick Test Steps

### 1. Start Backend
```bash
cd backend
node server.js
```
**Expected Output:**
```
=== ESEWA CONFIGURATION ===
ESEWA_SECRET_KEY exists: true
ESEWA_MERCHANT_CODE: EPAYTEST
ESEWA_PRODUCT_CODE: EPAYTEST
ESEWA_BASE_URL: https://rc-epay.esewa.com.np/api/epay/main/v2/form
Server running on port 5000
```

### 2. Start Frontend
```bash
cd newfrontend
npm run dev
```

### 3. Test Complete Flow

#### A. Book Appointment
1. Login as patient
2. Select doctor
3. Choose date/time
4. Click "Book Appointment"
5. Check backend console for appointment creation

#### B. Approve Appointment (Doctor)
1. Login as doctor
2. Go to dashboard
3. Find pending appointment
4. Click "Approve"
5. Check appointment status changes to "approved"

#### C. Make Payment (Patient)
1. Go to patient dashboard
2. Find approved appointment
3. Click "Pay Now - Rs. 500"
4. Check console for payment initiation
5. Should redirect to eSewa test page
6. Login with test credentials:
   - Mobile: 9806800001
   - Password: Nepal@123
   - MPIN: 1122
7. Complete payment
8. Should redirect to success page

#### D. Check Payment Status
1. Check appointment status in database
2. Should show: paymentStatus: "paid", status: "approved"

## 🔍 Debug Console Logs

### Backend Should Show:
```
=== PAYMENT INITIATION ===
User ID: 64f5a8b9c2f4a2d8d7d
Appointment Data: {doctorId: '...', date: '...', time: '...'}
Created appointment: 64f5a8b9c2f4a2d8d7d
=== ESEWA PAYMENT INITIATED ===
Payment Data: {formUrl: '...', formData: {...}}
```

### Frontend Should Show:
```
Initiating payment for appointment: 64f5a8b9c2f4a2d8d7d
Sending appointment data: {doctorId: '...', date: '...', time: '...'}
Payment response status: 200
Payment response data: {success: true, paymentData: {...}}
```

### Browser Should Show:
```
=== ESEWA PAYMENT FORM ===
Payment params: {merchant_code: 'EPAYTEST', product_code: 'EPAYTEST', ...}
```

## 🐛 Common Issues & Solutions

### Issue: "Payment service not configured"
**Cause:** ESEWA_SECRET_KEY not loaded
**Solution:** Check .env file and restart backend

### Issue: "merchant_code is not defined"
**Cause:** Missing merchant_code in callback
**Solution:** Fixed in complete controller with safe extraction

### Issue: "Amount mismatch"
**Cause:** Decimal places or currency conversion
**Solution:** Both amounts formatted consistently

### Issue: "Invalid signature"
**Cause:** Secret key mismatch or format error
**Solution:** Check signature generation and comparison

### Issue: "Appointment not found in callback"
**Cause:** Server restart or Map usage
**Solution:** Fixed by using direct DB query

## ✅ Success Indicators

### Backend Working:
- [ ] Configuration logs appear
- [ ] Appointment created successfully
- [ ] Payment data generated correctly
- [ ] Signature verification passes
- [ ] Callback endpoint accessible

### Frontend Working:
- [ ] Payment form redirects to eSewa
- [ ] Success page loads
- [ ] Appointment status updates
- [ ] Error messages show properly

### Database Working:
- [ ] Appointments saved with correct status
- [ ] Payment status updates correctly
- [ ] Transaction codes stored

## 🎯 Test Results

### Pass Test If:
- ✅ Backend starts without errors
- ✅ Frontend loads and shows payment button
- ✅ Payment initiation returns success
- ✅ Redirect to eSewa works
- ✅ Test payment completes successfully
- ✅ Callback processes payment correctly
- ✅ Appointment status updates to "approved"
- ✅ Success page shows appointment details

### Fail Test If:
- ❌ Backend fails to start
- ❌ Payment initiation returns error
- ❌ No redirect to eSewa
- ❌ Callback not accessible
- ❌ Signature verification fails
- ❌ Appointment status doesn't update

---

## 🎉 Integration Complete!

When all tests pass, your eSewa integration is fully functional and ready for production deployment.

**The complete system now includes:**
- Production-ready security
- Proper error handling
- Comprehensive logging
- Working frontend components
- Complete documentation
- Deployment guides

**Ready for university project submission!** 🏥⚕
