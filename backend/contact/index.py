'''
Business: Handle contact form submissions and send email notifications
Args: event with httpMethod, body containing name, email, subject, message
Returns: HTTP response confirming message delivery
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

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
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
        
        admin_email = os.environ.get('ADMIN_EMAIL')
        if admin_email:
            try:
                msg = MIMEMultipart('alternative')
                msg['Subject'] = f'[Контакт] {subject}'
                msg['From'] = 'noreply@streamhub.com'
                msg['To'] = admin_email
                
                text = f'''
Новое сообщение с сайта:

От: {name} ({email})
Тема: {subject}

Сообщение:
{message}

---
ID: {message_id}
Время: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
                '''
                
                html = f'''
<html>
<body>
<h2>Новое сообщение с сайта</h2>
<p><strong>От:</strong> {name} ({email})</p>
<p><strong>Тема:</strong> {subject}</p>
<hr>
<p><strong>Сообщение:</strong></p>
<p>{message.replace(chr(10), '<br>')}</p>
<hr>
<p style="color: #888; font-size: 12px;">ID: {message_id} | Время: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
</body>
</html>
                '''
                
                part1 = MIMEText(text, 'plain')
                part2 = MIMEText(html, 'html')
                msg.attach(part1)
                msg.attach(part2)
                
                smtp_server = os.environ.get('SMTP_SERVER', 'localhost')
                smtp_port = int(os.environ.get('SMTP_PORT', '25'))
                
                with smtplib.SMTP(smtp_server, smtp_port) as server:
                    server.send_message(msg)
            except Exception as e:
                print(f'Email sending failed: {str(e)}')
        
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
