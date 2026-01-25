# Firebase Project Optimization Report

**project:** culturelens-2dd38  
**audit date:** 2026-01-24  
**audited by:** automated script + manual review

---

## current configuration

### project details

- **project ID:** culturelens-2dd38 (cannot be changed)
- **project number:** 407570374043
- **display name:** culturelens ⚠️ (should be "CultureLens")
- **resource location:** [Not specified] ⚠️ (should be "nam5")
- **default GCP resource location:** not set ⚠️

### enabled services

- ✅ firestore database (default)
- ✅ firebase authentication (configured but not in use)
- ❌ firebase storage (needs manual activation)
- ✅ firebase hosting
- ✅ google analytics

### apps configured

- **web app:** culturelens (1:407570374043:web:bb41d2c78e0097f2c3553e)
  - display name: "culturelens" ⚠️ (should be "CultureLens")

---

## issues identified

### 1. project display name (cosmetic)

**current:** "culturelens" (lowercase)  
**recommended:** "CultureLens"  
**impact:** low - affects console UI only  
**fix:** manual via firebase console

**how to fix:**

1. go to [project settings](https://console.firebase.google.com/project/culturelens-2dd38/settings/general)
2. click edit icon next to project name
3. change to "CultureLens"
4. save

### 2. resource location not set (important)

**current:** [Not specified]  
**recommended:** nam5 (North America - us-central1)  
**impact:** medium - affects data residency and latency  
**fix:** manual via firebase console

**why nam5:**

- geographically closest to target users (north america)
- supports all firebase features
- optimal latency for firestore and storage
- free tier available

**how to fix:**

1. go to [project settings](https://console.firebase.google.com/project/culturelens-2dd38/settings/general)
2. scroll to "default GCP resource location"
3. select "nam5 (us-central)"
4. confirm (this is permanent and cannot be changed later)

**⚠️ WARNING:** once set, resource location CANNOT be changed!

### 3. firebase storage not enabled (critical)

**current:** disabled  
**recommended:** enable with nam5 location  
**impact:** high - TTS audio uploads will fail  
**fix:** manual via firebase console

**how to fix:**

1. go to [storage](https://console.firebase.google.com/project/culturelens-2dd38/storage)
2. click "get started"
3. select "production mode"
4. choose "nam5" location (must match project resource location)
5. click "done"

after enabling, deploy rules:

```bash
firebase deploy --only storage:rules
```

### 4. app display name (cosmetic)

**current:** "culturelens"  
**recommended:** "CultureLens"  
**impact:** low - affects console UI  
**fix:** can be done via CLI or console

**how to fix (CLI):**

```bash
# unfortunately firebase CLI doesn't support updating app display names
# must be done via console
```

**how to fix (console):**

1. go to [project settings → general](https://console.firebase.google.com/project/culturelens-2dd38/settings/general)
2. scroll to "your apps"
3. click gear icon on web app
4. change display name to "CultureLens"
5. save

---

## firestore configuration

### databases

- ✅ **(default)** database in nam5 location
- mode: native mode (good for mobile/web)
- location: nam5 (optimal)

### security rules

- ✅ deployed and up to date
- ✅ allows server-side API access
- 🔵 ready for future auth implementation

### indexes

- ✅ composite index: sessions (status + createdAt)
- ✅ composite index: transcripts (sessionId + timestamp)
- ✅ all required indexes deployed

### collections (planned)

- `sessions` - conversation sessions
- `transcripts` - conversation transcripts

---

## firebase storage configuration

### current status

❌ **not enabled** - needs manual activation

### recommended configuration

- **location:** nam5 (must match firestore location)
- **security mode:** production mode
- **rules:** already configured in `storage.rules`

### storage paths (planned)

- `audio/tts/` - text-to-speech generated files
- `audio/sessions/` - uploaded session recordings

### estimated usage (free tier limits)

- **free tier storage:** 5 GB
- **free tier downloads:** 1 GB/day
- **estimated usage:** < 1 GB (well within limits)

assumptions:

- avg TTS file: 100 KB (30 sec audio)
- avg session recording: 5 MB (5 min conversation)
- 100 sessions/month: ~500 MB/month

---

## firebase authentication configuration

### current status

🔵 **enabled but not in use**

### recommended configuration

- **sign-in methods:** email/password (for MVP)
- **email templates:** customize for branding
- **authorized domains:**
  - localhost (for development)
  - culturelens.vercel.app (production)
  - custom domain (if acquired)

### future implementation

- add google sign-in
- add github sign-in (for dev team)
- enable email verification
- set up password reset flow

---

## firebase hosting configuration

### current status

✅ **configured** but not deployed

### recommended configuration

- **public directory:** out (next.js static export)
- **rewrites:** configured for SPA routing
- **headers:** add security headers

### deployment

```bash
npm run build
firebase deploy --only hosting
```

---

## google analytics configuration

### current status

✅ **enabled** via measurement ID

### recommended configuration

- **measurement ID:** G-JKXLH1QJTC
- **data retention:** 14 months (default)
- **user deletion:** enabled for GDPR compliance

### events to track

- session_start
- session_end
- tts_generated
- analysis_complete
- debrief_played

---

## free tier limits & monitoring

### firestore

- **reads:** 50,000/day (free) → monitor at 40,000
- **writes:** 20,000/day (free) → monitor at 15,000
- **deletes:** 20,000/day (free) → monitor at 15,000
- **storage:** 1 GB (free) → monitor at 800 MB

### storage

- **storage:** 5 GB (free) → monitor at 4 GB
- **downloads:** 1 GB/day (free) → monitor at 800 MB
- **uploads:** 1 GB/day (free) → monitor at 800 MB

### hosting

- **storage:** 10 GB (free)
- **transfer:** 360 MB/day (free)

### authentication

- **phone auth:** 10,000/month (free)
- **email/password:** unlimited (free)

### monitoring setup

```bash
# TODO: set up firebase usage alerts
# go to: https://console.firebase.google.com/project/culturelens-2dd38/usage
# set alerts at 80% of each limit
```

---

## security audit

### ✅ good practices in place

- service account key in .gitignore
- firestore security rules deployed
- storage security rules configured
- environment variables not committed
- github secrets used for CI/CD

### 🔵 recommended improvements

1. **enable app check** - prevent abuse from unauthorized clients
2. **set up budget alerts** - prevent unexpected charges
3. **enable audit logging** - track admin actions
4. **rotate service account keys** - every 90 days

### app check setup (future)

```bash
# prevents unauthorized access to firebase services
firebase apps:create web --display-name="CultureLens Web (App Check)"
```

---

## cost optimization strategies

### firestore

- ✅ use composite indexes (already done)
- ✅ minimize document writes (already optimized)
- 🔵 implement caching on client side (future)
- 🔵 use realtime listeners sparingly (future)

### storage

- ✅ use firebase storage (cheaper than cloud storage)
- 🔵 implement CDN caching (future)
- 🔵 compress audio files (future optimization)
- 🔵 delete old TTS files after 7 days (future)

### general

- ✅ stay on spark (free) plan - no credit card required
- monitor usage weekly
- set up usage alerts at 80%
- optimize queries before scaling

---

## action items

### immediate (manual actions required)

1. **set default resource location to nam5**
   - url: https://console.firebase.google.com/project/culturelens-2dd38/settings/general
   - impact: CRITICAL - must be done before enabling storage
   - time: 2 minutes
   - ⚠️ permanent - cannot be changed later

2. **enable firebase storage**
   - url: https://console.firebase.google.com/project/culturelens-2dd38/storage
   - location: nam5 (must match project location)
   - impact: CRITICAL - required for TTS uploads
   - time: 2 minutes

3. **update project display name to "CultureLens"**
   - url: https://console.firebase.google.com/project/culturelens-2dd38/settings/general
   - impact: LOW - cosmetic only
   - time: 1 minute

4. **update web app display name to "CultureLens"**
   - url: https://console.firebase.google.com/project/culturelens-2dd38/settings/general
   - scroll to "your apps" section
   - impact: LOW - cosmetic only
   - time: 1 minute

5. **add github secret for auto-deployment**
   - url: https://github.com/sunnypatell/culturelens/settings/secrets/actions
   - secret name: FIREBASE_SERVICE_ACCOUNT
   - secret value: contents of firebase-adminsdk-key.json
   - impact: MEDIUM - enables auto-deployment
   - time: 2 minutes

### near-term (within 1 week)

6. **set up usage alerts**
   - url: https://console.firebase.google.com/project/culturelens-2dd38/usage
   - set alerts at 80% of free tier limits
   - impact: MEDIUM - prevents service interruption
   - time: 5 minutes

7. **customize email templates**
   - url: https://console.firebase.google.com/project/culturelens-2dd38/authentication/emails
   - update branding and copy
   - impact: LOW - better UX
   - time: 10 minutes

8. **configure authorized domains**
   - url: https://console.firebase.google.com/project/culturelens-2dd38/authentication/settings
   - add production domain when deployed
   - impact: MEDIUM - required for auth
   - time: 2 minutes

### future enhancements

9. **implement app check**
   - prevents unauthorized API access
   - impact: HIGH - security improvement
   - time: 30 minutes

10. **set up monitoring dashboards**
    - track usage patterns
    - identify optimization opportunities
    - impact: MEDIUM - operational visibility
    - time: 1 hour

---

## verification checklist

after completing manual actions, verify:

```bash
# run the firebase test script
./scripts/test-firebase.sh

# check firestore connection
curl http://localhost:3000/api/sessions

# test TTS upload (after enabling storage)
curl -X POST http://localhost:3000/api/elevenlabs/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "testing firebase storage integration"}'

# verify github actions secret
# make a small change to firestore.rules and push to main
# check actions tab for successful deployment
```

---

## summary

**overall health:** 🟡 GOOD (needs 2 critical manual actions)

**critical issues:** 2

- resource location not set (must fix before storage)
- firebase storage not enabled

**medium issues:** 1

- github secret not configured (blocks auto-deployment)

**low priority:** 2

- project display name (cosmetic)
- app display name (cosmetic)

**estimated time to fix all critical issues:** 5 minutes

**next immediate step:** set default resource location to nam5

---

## references

- [firebase console](https://console.firebase.google.com/project/culturelens-2dd38)
- [firestore quotas](https://firebase.google.com/docs/firestore/quotas)
- [storage quotas](https://firebase.google.com/docs/storage/quotas)
- [pricing calculator](https://firebase.google.com/pricing)
- [security rules](https://firebase.google.com/docs/rules)
