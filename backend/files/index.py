'''
Business: File management - upload, list, get file info, and manage user files
Args: event with httpMethod, body, headers with X-Auth-Token
Returns: HTTP response with file data or operation results
'''

import json
import os
import base64
import uuid
from typing import Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def get_user_id_from_token(token: str) -> int:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT user_id FROM sessions WHERE token = %s AND expires_at > NOW()",
        (token,)
    )
    result = cur.fetchone()
    cur.close()
    conn.close()
    return result['user_id'] if result else None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    token = headers.get('x-auth-token') or headers.get('X-Auth-Token')
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Authentication required'})
        }
    
    user_id = get_user_id_from_token(token)
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid or expired token'})
        }
    
    if method == 'GET':
        query_params = event.get('queryStringParameters') or {}
        file_id = query_params.get('id')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        if file_id:
            cur.execute(
                "SELECT id, filename, original_filename, file_type, file_size, file_url, mime_type, created_at FROM files WHERE id = %s AND user_id = %s",
                (file_id, user_id)
            )
            file = cur.fetchone()
            cur.close()
            conn.close()
            
            if not file:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'File not found'})
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(file), default=str)
            }
        else:
            cur.execute(
                "SELECT id, filename, original_filename, file_type, file_size, file_url, mime_type, created_at FROM files WHERE user_id = %s ORDER BY created_at DESC",
                (user_id,)
            )
            files = cur.fetchall()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(f) for f in files], default=str)
            }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        filename = body_data.get('filename')
        file_content = body_data.get('content')
        file_type = body_data.get('file_type', 'application/octet-stream')
        mime_type = body_data.get('mime_type', file_type)
        
        if not filename or not file_content:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Filename and content are required'})
            }
        
        try:
            file_bytes = base64.b64decode(file_content)
            file_size = len(file_bytes)
        except Exception:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid file content'})
            }
        
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_url = f"data:{mime_type};base64,{file_content}"
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            "INSERT INTO files (user_id, filename, original_filename, file_type, file_size, file_url, mime_type) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id, filename, original_filename, file_type, file_size, file_url, mime_type, created_at",
            (user_id, unique_filename, filename, file_type, file_size, file_url, mime_type)
        )
        new_file = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(new_file), default=str)
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }