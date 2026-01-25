#!/bin/bash

echo "🧪 testing firebase configuration..."
echo ""

# check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    exit 1
fi

# check if firebase env vars are set
echo "📋 checking environment variables..."
if grep -q "NEXT_PUBLIC_FIREBASE_API_KEY=" .env && \
   grep -q "NEXT_PUBLIC_FIREBASE_PROJECT_ID=" .env; then
    echo "✅ firebase environment variables configured"
else
    echo "❌ firebase environment variables missing"
    exit 1
fi

# check if admin SDK key exists
if [ -f firebase-adminsdk-key.json ]; then
    echo "✅ firebase admin SDK key found"
else
    echo "⚠️  firebase admin SDK key not found (optional for local dev)"
fi

# check firebase CLI
if command -v firebase &> /dev/null; then
    echo "✅ firebase CLI installed ($(firebase --version))"
else
    echo "❌ firebase CLI not installed"
    exit 1
fi

# check firebase project
echo ""
echo "📊 firebase project status:"
firebase projects:list | grep culturelens

echo ""
echo "🔥 firestore database:"
firebase firestore:databases:list 2>&1 | head -5

echo ""
echo "✅ firebase configuration test complete!"
