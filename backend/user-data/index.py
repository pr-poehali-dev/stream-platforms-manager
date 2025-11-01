import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User data storage for platforms and games
    Args: event with httpMethod, body, headers
    Returns: HTTP response with user's platforms and games
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'No auth token provided'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    safe_token = auth_token.replace("'", "''")
    cur.execute(f"SELECT user_id FROM user_sessions WHERE token = '{safe_token}' AND expires_at > NOW()")
    session = cur.fetchone()
    
    if not session:
        cur.close()
        conn.close()
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Invalid or expired token'})
        }
    
    user_id = session['user_id']
    
    if method == 'GET':
        cur.execute(f"SELECT platforms, games FROM user_data WHERE user_id = {user_id}")
        result = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if result:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'platforms': result['platforms'] or [],
                    'games': result['games'] or []
                })
            }
        else:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'platforms': [], 'games': []})
            }
    
    elif method == 'POST' or method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        platforms = body_data.get('platforms', [])
        games = body_data.get('games', [])
        
        platforms_json = json.dumps(platforms).replace("'", "''")
        games_json = json.dumps(games).replace("'", "''")
        
        cur.execute(f"""
            INSERT INTO user_data (user_id, platforms, games)
            VALUES ({user_id}, '{platforms_json}', '{games_json}')
            ON CONFLICT (user_id) 
            DO UPDATE SET platforms = EXCLUDED.platforms, games = EXCLUDED.games, updated_at = NOW()
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True})
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }