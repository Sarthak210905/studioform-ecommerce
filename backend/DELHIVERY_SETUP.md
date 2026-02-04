# Delhivery Integration Configuration Guide

## Step 1: Get Delhivery API Credentials

1. **Login to Delhivery One Panel**: https://direct.delhivery.com/
2. Navigate to: **Settings > API Setup > Existing API Token**
3. Click **View/Copy** to get your API keys

You will receive:
- **API Key** (Token) - Main authentication key
- **Surface Key** - For surface shipments
- **10KG Surface Key** - For heavier shipments (10kg+)

## Step 2: Add to .env File

Add these lines to your `backend/.env` file:

```env
# Delhivery API Configuration
DELHIVERY_ENABLED=true
DELHIVERY_API_KEY=your_api_key_here
DELHIVERY_API_URL=https://track.delhivery.com/api
DELHIVERY_SURFACE_KEY=your_surface_key_here
DELHIVERY_10KG_SURFACE_KEY=your_10kg_key_here

# Warehouse Details (Pickup Location)
WAREHOUSE_NAME=Main Warehouse
WAREHOUSE_ADDRESS=Your Full Address, Indore
WAREHOUSE_PINCODE=452001
WAREHOUSE_CITY=Indore
WAREHOUSE_STATE=Madhya Pradesh
WAREHOUSE_PHONE=9876543210
```

## Step 3: Test Configuration

### Test Pincode Serviceability
```bash
curl -X POST http://localhost:8000/delhivery/check-serviceability \
  -H "Content-Type: application/json" \
  -d '{"pincode": "110001"}'
```

### Response
```json
{
  "serviceable": true,
  "city": "NEW DELHI",
  "state": "DELHI",
  "cod_available": true,
  "prepaid_available": true
}
```

## Step 4: Create Test Shipment (Admin Only)

After placing an order, create a Delhivery shipment:

```bash
curl -X POST http://localhost:8000/delhivery/create-shipment \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"order_id": "ORDER_ID_HERE"}'
```

### Response
```json
{
  "success": true,
  "waybill": "1234567890",
  "message": "Shipment created successfully"
}
```

## Step 5: Track Shipment

```bash
curl http://localhost:8000/delhivery/track/1234567890
```

## Available Endpoints

### Public Endpoints
- `POST /delhivery/check-serviceability` - Check pincode serviceability
- `GET /delhivery/track/{waybill}` - Track shipment

### Admin Endpoints (Requires Admin Token)
- `POST /delhivery/create-shipment` - Create shipment for order
- `GET /delhivery/label/{waybill}` - Download shipping label PDF
- `POST /delhivery/cancel/{waybill}` - Cancel shipment
- `GET /delhivery/warehouses` - List registered warehouses

## Integration Flow

1. **Customer Places Order** → Order created with zone-based shipping cost
2. **Admin Creates Shipment** → Delhivery waybill generated
3. **Delhivery Pickup** → Automated pickup from warehouse
4. **Customer Tracks** → Real-time tracking via waybill
5. **Delivery Complete** → Status updated automatically

## Features

✅ **Zone-based pricing** - Predictable shipping costs from Indore
✅ **Delhivery fulfillment** - Professional logistics network
✅ **Real-time tracking** - Customer can track shipments
✅ **Automated labels** - Generate shipping labels
✅ **COD support** - Cash on delivery handling
✅ **Pickup requests** - Schedule pickups from warehouse

## Note for Development

Keep `DELHIVERY_ENABLED=false` during development to avoid creating real shipments.
Set to `true` only in production with valid API credentials.
