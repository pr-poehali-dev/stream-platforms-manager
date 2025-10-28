"""
Business: Manage user profile settings (name, avatar, wallpaper, theme, email, password)
Args: event with httpMethod, body, headers; context with request_id
Returns: HTTP response with user profile data or success status
"""

import json
import os
import hashlib
import psycopg2
from typing import Dict, Any, Optional

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    session_token = headers.get('x-session-token') or headers.get('X-Session-Token')
    
    if not session_token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Session token required'})
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT u.id, u.email, u.display_name, u.avatar_url, u.wallpaper_url, u.theme
            FROM users u
            JOIN sessions s ON u.id = s.user_id
            WHERE s.token = %s AND s.expires_at > NOW()
        """, (session_token,))
        
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid or expired session'})
            }
        
        user_id, email, display_name, avatar_url, wallpaper_url, theme = user
        
        if method == 'GET':
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'id': user_id,
                    'email': email,
                    'displayName': display_name,
                    'avatarUrl': avatar_url,
                    'wallpaperUrl': wallpaper_url,
                    'theme': theme or 'system'
                })
            }
        
        if method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            update_fields = []
            params = []
            
            if 'displayName' in body_data:
                update_fields.append('display_name = %s')
                params.append(body_data['displayName'])
            
            if 'avatarUrl' in body_data:
                update_fields.append('avatar_url = %s')
                params.append(body_data['avatarUrl'])
            
            if 'wallpaperUrl' in body_data:
                update_fields.append('wallpaper_url = %s')
                params.append(body_data['wallpaperUrl'])
            
            if 'theme' in body_data:
                update_fields.append('theme = %s')
                params.append(body_data['theme'])
            
            if 'email' in body_data:
                new_email = body_data['email']
                cur.execute('SELECT id FROM users WHERE email = %s AND id != %s', (new_email, user_id))
                if cur.fetchone():
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email already in use'})
                    }
                update_fields.append('email = %s')
                params.append(new_email)
            
            if 'password' in body_data:
                update_fields.append('password_hash = %s')
                params.append(hash_password(body_data['password']))
            
            if update_fields:
                params.append(user_id)
                query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
                cur.execute(query, tuple(params))
                conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Profile updated'})
            }
        
        if method == 'DELETE':
            cur.execute('DELETE FROM sessions WHERE user_id = %s', (user_id,))
            cur.execute('DELETE FROM files WHERE user_id = %s', (user_id,))
            cur.execute('DELETE FROM users WHERE id = %s', (user_id,))
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Account deleted'})
            }
        
        cur.close()
        conn.close()
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
