'''
Business: Handle contact messages - submit, list, manage, reply
Args: event with httpMethod, body, headers with X-Auth-Token for management
Returns: HTTP response with message data or operation results
'''

import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    token = headers.get('x-auth-token') or headers.get('X-Auth-Token')
    path = event.get('path', '')
    
    if method == 'GET':
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
                'body': json.dumps({'error': 'Invalid token'})
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT id, name, email, subject, message, created_at, is_read, replied_at
            FROM contact_messages
            ORDER BY created_at DESC
        ''')
        messages = cur.fetchall()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps([dict(m) for m in messages], default=str)
        }
    
    if method == 'POST' and not path.endswith('/reply'):
        try:
            body = json.loads(event.get('body', '{}'))
            name = body.get('name', '').strip()
            email = body.get('email', '').strip()
            subject = body.get('subject', 'Новое сообщение').strip()
            message = body.get('message', '').strip()
            
            if not name or not email or not message:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Name, email and message are required'})
                }
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            cur.execute(
                '''INSERT INTO contact_messages 
                   (name, email, subject, message, created_at) 
                   VALUES (%s, %s, %s, %s, NOW()) 
                   RETURNING id''',
                (name, email, subject, message)
            )
            message_id = cur.fetchone()['id']
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'message': 'Message received successfully',
                    'id': message_id
                })
            }
            
        except json.JSONDecodeError:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid JSON'})
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
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
            'body': json.dumps({'error': 'Invalid token'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        path_parts = [p for p in path.split('/') if p and p != 'read' and p != 'reply']
        message_id = path_parts[-1] if path_parts else None
        
        if path.endswith('/read') and method == 'PUT':
            cur.execute(
                'UPDATE contact_messages SET is_read = TRUE WHERE id = %s',
                (message_id,)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True})
            }
        
        elif path.endswith('/reply') and method == 'POST':
            body = json.loads(event.get('body', '{}'))
            reply_text = body.get('reply', '').strip()
            
            if not reply_text:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Reply text is required'})
                }
            
            cur.execute(
                'SELECT name, email, subject FROM contact_messages WHERE id = %s',
                (message_id,)
            )
            message = cur.fetchone()
            
            if not message:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Message not found'})
                }
            
            cur.execute(
                'UPDATE contact_messages SET replied_at = NOW() WHERE id = %s',
                (message_id,)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True})
            }
        
        elif method == 'DELETE':
            cur.execute('DELETE FROM contact_messages WHERE id = %s', (message_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True})
            }
        
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Not found'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        cur.close()
        conn.close()
