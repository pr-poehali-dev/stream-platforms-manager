'''
Business: User authentication - register, login, and session management
Args: event with httpMethod, body, headers
Returns: HTTP response with authentication tokens or user data
'''

import json
import os
import hashlib
import secrets
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    if salt is None:
        salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return pwd_hash.hex(), salt

def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    pwd_hash, _ = hash_password(password, salt)
    return pwd_hash == stored_hash

def generate_token() -> str:
    return secrets.token_urlsafe(32)

def store_session(user_id: int, token: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, NOW() + INTERVAL '30 days')",
        (user_id, token)
    )
    conn.commit()
    cur.close()
    conn.close()

def get_user_from_token(token: str) -> Optional[Dict]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT u.id, u.email, u.username FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    return dict(user) if user else None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    path = event.get('queryStringParameters', {}).get('action', 'login')
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        if path == 'register':
            email = body_data.get('email')
            password = body_data.get('password')
            username = body_data.get('username', email.split('@')[0])
            
            if not email or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email and password are required'})
                }
            
            pwd_hash, salt = hash_password(password)
            password_with_salt = f"{pwd_hash}:{salt}"
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            existing_user = cur.fetchone()
            
            if existing_user:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User already exists'})
                }
            
            cur.execute(
                "INSERT INTO users (email, password_hash, username) VALUES (%s, %s, %s) RETURNING id, email, username, created_at",
                (email, password_with_salt, username)
            )
            user = cur.fetchone()
            conn.commit()
            
            token = generate_token()
            store_session(user['id'], token)
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': dict(user),
                    'token': token
                }, default=str)
            }
        
        elif path == 'login':
            email = body_data.get('email')
            password = body_data.get('password')
            
            if not email or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email and password are required'})
                }
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            cur.execute(
                "SELECT id, email, username, password_hash, created_at FROM users WHERE email = %s",
                (email,)
            )
            user = cur.fetchone()
            
            cur.close()
            conn.close()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid credentials'})
                }
            
            stored_hash, salt = user['password_hash'].split(':')
            
            if not verify_password(password, stored_hash, salt):
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid credentials'})
                }
            
            token = generate_token()
            store_session(user['id'], token)
            
            user_data = {
                'id': user['id'],
                'email': user['email'],
                'username': user['username'],
                'created_at': user['created_at']
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': user_data,
                    'token': token
                }, default=str)
            }
    
    if method == 'GET':
        token = event.get('headers', {}).get('x-auth-token')
        
        if not token:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'No token provided'})
            }
        
        user = get_user_from_token(token)
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid or expired token'})
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'authenticated': True, 'user': user})
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
