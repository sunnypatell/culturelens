#!/bin/bash
set -e

export GOOGLE_APPLICATION_CREDENTIALS="${PWD}/firebase-adminsdk-key.json"

echo "🔍 FIREBASE PROJECT AUDIT - CULTURELENS"
echo "========================================"
echo ""

echo "📋 PROJECT INFORMATION:"
echo "----------------------"
firebase projects:list | grep culturelens || true
echo ""

echo "📦 FIREBASE APPS:"
echo "----------------"
firebase apps:list
echo ""

echo "🗄️ FIRESTORE STATUS:"
echo "-------------------"
firebase firestore:databases:list 2>&1 | head -10
echo ""

echo "📊 FIRESTORE INDEXES:"
echo "--------------------"
firebase firestore:indexes 2>&1 | head -20 || echo "checking indexes..."
echo ""

echo "💾 STORAGE STATUS:"
echo "-----------------"
firebase functions:config:get 2>&1 || echo "no functions config"
echo ""

echo "🔐 AUTH CONFIGURATION:"
echo "---------------------"
echo "checking if auth is enabled..."
gcloud services list --project=culturelens-2dd38 --filter="name:firebase" --format="table(name,state)" 2>&1 | head -20 || echo "using firebase CLI instead"
echo ""

echo "✅ AUDIT COMPLETE"
