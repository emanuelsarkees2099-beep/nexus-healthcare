#!/bin/bash

# Test the signup API
curl -X POST http://localhost:3000/api/debug/test-signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test'$(date +%s)'@example.com","password":"TestPassword123"}'
