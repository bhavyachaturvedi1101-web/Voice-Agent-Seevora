# Voice Call Agent API Integration Guide

This document provides the API endpoints, request/response formats, and `curl` commands required for frontend developers to integrate the voice calling system.

---

## ✅ Tested & Working — Real Credentials (Aug 18, 2026)

> These values have been tested and confirmed working against the live ngrok server.

| Field | Value |
| :--- | :--- |
| **ngrok Base URL** | `https://griminess-pry-visitor.ngrok-free.dev` |
| **Email** | `admin@test.com` |
| **Password** | `admin123` |
| **Real Agent ID** | `f1ae0794-120a-44e2-8a22-967ffcc9d022` |
| **Backend Type** | FastAPI (Python) — responses use `detail` field for errors |

### Step 1 — Login & Save Token (PowerShell)
```powershell
$response = Invoke-RestMethod -Uri "https://griminess-pry-visitor.ngrok-free.dev/auth/login" -Method POST -ContentType "application/json" -Body '{"email": "admin@test.com", "password": "admin123"}'

$headers = @{
    "Authorization" = "Bearer $($response.access_token)"
    "ngrok-skip-browser-warning" = "true"
}
```

### Step 2 — List Calls (PowerShell)
```powershell
Invoke-RestMethod -Uri "https://griminess-pry-visitor.ngrok-free.dev/calls" -Method GET -Headers $headers | ConvertTo-Json
```

### Step 3 — Dispatch Outbound Call (PowerShell)
```powershell
$dispatchBody = '{
  "agent_id": "f1ae0794-120a-44e2-8a22-967ffcc9d022",
  "phone_number": "+918120590466",
  "contact": {
    "firstName": "Bhavya",
    "lastName": ""
  }
}'

Invoke-RestMethod -Uri "https://griminess-pry-visitor.ngrok-free.dev/calls/dispatch" -Method POST -Headers $headers -ContentType "application/json" -Body $dispatchBody | ConvertTo-Json
```

### Step 4 — Get Call Detail & Transcript (PowerShell)
Replace `<CALL_ID>` with the `id` returned from the dispatch response above.
```powershell
Invoke-RestMethod -Uri "https://griminess-pry-visitor.ngrok-free.dev/calls/<CALL_ID>" -Method GET -Headers $headers | ConvertTo-Json -Depth 5
```

> **Note:** Always add `"ngrok-skip-browser-warning": "true"` to headers, otherwise ngrok returns an HTML warning page instead of JSON.

> **Note:** If the ngrok link changes, update the base URL in `api.js` → `const LIVE_BASE = '...'` (line 7).

---



## Authentication

All protected backend endpoints require a JSON Web Token (JWT) in the `Authorization` header.

### 1. User Login (Obtain Token)
Use this endpoint to authenticate a user and retrieve a JWT access token.

*   **HTTP Method:** `POST`
*   **Path:** `/auth/login`
*   **Authentication:** None

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | string | Yes | The user's registered email address. |
| `password` | string | Yes | The user's password. |

#### cURL Command
```bash
curl -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "yourpassword"
     }'
```

#### Response Body (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI..."
}
```

> [!TIP]
> The frontend should store the `access_token` securely and include it in all subsequent requests as:
> `Authorization: Bearer <access_token>`

---

## Call Management APIs

These APIs are defined on the backend under the `/calls` route and require JWT authentication.

### 1. Dispatch Outbound Call
Initiates an outbound voice call to a given customer using a specific agent. This automatically creates a LiveKit session room, dispatches the agent, and triggers the dial out.

*   **HTTP Method:** `POST`
*   **Path:** `/calls/dispatch`
*   **Authentication:** Bearer Token

#### Request Headers
```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `agent_id` | UUID string | Yes | The unique identifier of the Voice Agent configuration. |
| `phone_number` | string | Yes | Destination phone number in E.164 format (min 10, max 15 digits). |
| `contact` | object | No | Key-value pairs containing caller metadata (e.g. `firstName`, `lastName`) to dynamically customize greetings and system prompts. |

#### cURL Command
```bash
curl -X POST "http://localhost:8000/calls/dispatch" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     -H "Content-Type: application/json" \
     -d '{
       "agent_id": "c5f590a2-25de-4d7a-8f4b-cf1042cb412e",
       "phone_number": "+919876543210",
       "contact": {
         "firstName": "Rahul",
         "lastName": "Sharma",
         "course": "Class 6 Admission",
         "fee": "Rs 15,000"
       }
     }'
```

#### Response Body (201 Created)
```json
{
  "id": "e42bcde2-50d4-42f0-9118-202be4fa7162",
  "agent_id": "c5f590a2-25de-4d7a-8f4b-cf1042cb412e",
  "room_name": "call-e42bcde250d4",
  "phone_number": "+919876543210",
  "contact_name": "Rahul",
  "contact_meta": {
    "firstName": "Rahul",
    "lastName": "Sharma",
    "course": "Class 6 Admission",
    "fee": "Rs 15,000"
  },
  "direction": "outbound",
  "status": "calling",
  "duration_s": 0.0,
  "total_cost_rs": 0.0,
  "transcript": [],
  "started_at": null,
  "ended_at": null,
  "created_at": "2026-08-17T15:00:00.000Z"
}
```

---

### 2. List Calls
Fetches a paginated history of all voice calls. Optionally filters calls by a specific agent.

*   **HTTP Method:** `GET`
*   **Path:** `/calls`
*   **Authentication:** Bearer Token

#### Request Headers
```http
Authorization: Bearer <access_token>
```

#### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `agent_id` | UUID string | No | None | Filter logs to only show calls handled by this agent. |
| `skip` | integer | No | `0` | Number of logs to skip for pagination. |
| `limit` | integer | No | `50` | Maximum number of logs to return. |

#### cURL Command
```bash
curl -X GET "http://localhost:8000/calls?skip=0&limit=10" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Response Body (200 OK)
```json
[
  {
    "id": "e42bcde2-50d4-42f0-9118-202be4fa7162",
    "agent_id": "c5f590a2-25de-4d7a-8f4b-cf1042cb412e",
    "room_name": "call-e42bcde250d4",
    "phone_number": "+919876543210",
    "contact_name": "Rahul",
    "contact_meta": {
      "firstName": "Rahul",
      "lastName": "Sharma"
    },
    "direction": "outbound",
    "status": "completed",
    "duration_s": 42.5,
    "total_cost_rs": 1.25,
    "transcript": [
      {
        "role": "agent",
        "text": "Hello Rahul, how can I help you today?"
      },
      {
        "role": "user",
        "text": "I wanted to check my fee details."
      }
    ],
    "started_at": "2026-08-17T15:00:00.000Z",
    "ended_at": "2026-08-17T15:00:42.500Z",
    "created_at": "2026-08-17T14:59:50.000Z"
  }
]
```

---

### 3. Get Call Details & Transcript
Fetches detailed statistics, metadata, and the full text transcript of a single call session.

*   **HTTP Method:** `GET`
*   **Path:** `/calls/{call_id}`
*   **Authentication:** Bearer Token

#### Request Headers
```http
Authorization: Bearer <access_token>
```

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `call_id` | UUID string | Yes | The ID of the call session (retrieved from list or dispatch endpoints). |

#### cURL Command
```bash
curl -X GET "http://localhost:8000/calls/e42bcde2-50d4-42f0-9118-202be4fa7162" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Response Body (200 OK)
```json
{
  "id": "e42bcde2-50d4-42f0-9118-202be4fa7162",
  "agent_id": "c5f590a2-25de-4d7a-8f4b-cf1042cb412e",
  "room_name": "call-e42bcde250d4",
  "phone_number": "+919876543210",
  "contact_name": "Rahul",
  "contact_meta": {
    "firstName": "Rahul",
    "lastName": "Sharma"
  },
  "direction": "outbound",
  "status": "completed",
  "duration_s": 42.5,
  "total_cost_rs": 1.25,
  "transcript": [
    {
      "role": "agent",
      "text": "Hello Rahul, how can I help you today?"
    },
    {
      "role": "user",
      "text": "I wanted to check my fee details."
    }
  ],
  "started_at": "2026-08-17T15:00:00.000Z",
  "ended_at": "2026-08-17T15:00:42.500Z",
  "created_at": "2026-08-17T14:59:50.000Z"
}
```

---

## Next.js Frontend Dev Endpoint (Local/Testing Alternative)
If developing locally on the Next.js stack, the frontend developer can hit the Next.js API route directly. This dispatches to LiveKit directly without routing through the PostgreSQL DB first.

*   **HTTP Method:** `POST`
*   **Path:** `/api/dispatch`
*   **Authentication:** Local `DASHBOARD_PASSCODE` Cookie (if set)

#### cURL Command
```bash
curl -X POST "http://localhost:3000/api/dispatch" \
     -H "Content-Type: application/json" \
     -d '{
       "phoneNumber": "+919876543210",
       "prompt": "Offer information about student admissions.",
       "modelProvider": "groq",
       "voice": "pooja"
     }'
```

#### Response Body (200 OK)
```json
{
  "success": true,
  "roomName": "call-919876543210-4820",
  "dispatchId": "disp_L8Xj92NskE3"
}
```

---

## Inbound Calling Setup

> [!IMPORTANT]
> Inbound calls **do not utilize a REST API endpoint to initiate**. Instead, inbound routing is handled dynamically using **LiveKit SIP Dispatch Rules**.

### Inbound Workflow
1.  **Incoming SIP Call**: A customer dials your inbound SIP phone number.
2.  **LiveKit Dispatching**: LiveKit routes the caller to an active session room and dispatches the configured agent (`outbound-caller`).
3.  **Agent Detection**: The agent joins the room, detects that the user is already present, bypasses the outbound dialer block, and immediately starts speaking the greeting.
4.  **Automatic Ingestion**: When the customer hangs up, the agent automatically updates the backend database via the secure endpoint `/calls/ingest` (authed via the internal API key).

### Setting up Inbound Rules Programmatically
To link a phone number/SIP trunk to the AI agent, use the LiveKit SDK to register a `SIPDispatchRule`:

```python
from livekit import api
from livekit.protocol.sip import CreateSIPDispatchRuleRequest, SIPDispatchRule, SIPDispatchRuleDirect, SIPDispatchRuleInfo

async def register_inbound_sip_rule():
    lkapi = api.LiveKitAPI(url="LIVEKIT_URL", api_key="API_KEY", api_secret="API_SECRET")
    
    rule_info = SIPDispatchRuleInfo(
        name="inbound-sip-handler",
        rule=SIPDispatchRule(
            direct=SIPDispatchRuleDirect(room_name="inbound-call-room")
        ),
        trunk_ids=["TRUNK_ID_OF_YOUR_INBOUND_TRUNK"],
        hide_phone_number=False,
    )
    
    request = CreateSIPDispatchRuleRequest(rule=rule_info)
    dispatch_rule = await lkapi.sip.create_dispatch_rule(request)
    print(f"SIP Inbound Routing Active! Rule ID: {dispatch_rule.sip_dispatch_rule_id}")
    await lkapi.aclose()
```
