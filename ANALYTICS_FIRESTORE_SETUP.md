# Analytics Firestore Setup

The frontend tracker writes normalized events to `analytics_events` with these fields:

- `userId`
- `productId`
- `eventType`
- `categoryId`
- `timestamp`

The protected admin API is `GET /api/admin/analytics`. Revenue, order count, and AOV are calculated from all non-cancelled orders; funnel, weekly sales, and trending products use the last seven days. Events are read with a range filter and timestamp ordering. Create the single-field index in Firestore if the console requests one:

```text
Collection: analytics_events
Field: timestamp
Scope: Collection
Order: Ascending
```

The tracker is best-effort and must not block checkout. Before enabling client-side writes in production, configure Firebase Authentication/App Check and restrict Firestore writes to authenticated, valid event payloads. The current custom HttpOnly-cookie session is not visible to Firestore Security Rules as `request.auth`; a backend event-ingestion endpoint is the stronger option if anonymous client writes are not acceptable.

The recommendation matrix is stored in Realtime Database under `product_relations/{productId}/{relatedProductId}`. Each successful order increments every distinct product pair once using RTDB transactions.