"""Главный API для сайта maninov — авторизация, услуги, бронирование, чат, акции"""
import json
import os
import hashlib
import uuid
import psycopg2
import psycopg2.extras

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def json_response(status, body, headers_extra=None):
    h = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'}
    if headers_extra:
        h.update(headers_extra)
    return {'statusCode': status, 'headers': h, 'body': json.dumps(body, default=str)}

def get_user_by_token(token):
    if not token:
        return None
    token = token.replace('Bearer ', '')
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT id, email, name, phone, role, lang, theme FROM users WHERE token = '%s'" % token.replace("'", "''"))
    user = cur.fetchone()
    conn.close()
    return dict(user) if user else None

def handle_auth(event, action):
    body = json.loads(event.get('body', '{}') or '{}')
    
    if action == 'register':
        email = body.get('email', '').strip().lower()
        password = body.get('password', '')
        name = body.get('name', '')
        if not email or not password:
            return json_response(400, {'error': 'Email и пароль обязательны'})
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT id FROM users WHERE email = '%s'" % email.replace("'", "''"))
        if cur.fetchone():
            conn.close()
            return json_response(400, {'error': 'Пользователь уже зарегистрирован'})
        token = uuid.uuid4().hex
        pw_hash = hash_password(password)
        cur.execute("INSERT INTO users (email, password_hash, name, token) VALUES ('%s', '%s', '%s', '%s') RETURNING id, email, name, role, lang, theme" % (email.replace("'", "''"), pw_hash, name.replace("'", "''"), token))
        user = dict(cur.fetchone())
        conn.commit()
        conn.close()
        user['token'] = token
        return json_response(200, {'user': user})
    
    if action == 'login':
        email = body.get('email', '').strip().lower()
        password = body.get('password', '')
        if not email or not password:
            return json_response(400, {'error': 'Email и пароль обязательны'})
        pw_hash = hash_password(password)
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT id, email, name, role, lang, theme FROM users WHERE email = '%s' AND password_hash = '%s'" % (email.replace("'", "''"), pw_hash))
        user = cur.fetchone()
        if not user:
            conn.close()
            return json_response(401, {'error': 'Неверный email или пароль'})
        user = dict(user)
        token = uuid.uuid4().hex
        cur.execute("UPDATE users SET token = '%s' WHERE id = %d" % (token, user['id']))
        conn.commit()
        conn.close()
        user['token'] = token
        return json_response(200, {'user': user})
    
    if action == 'me':
        auth = event.get('headers', {}).get('X-Authorization', '') or event.get('headers', {}).get('x-authorization', '')
        user = get_user_by_token(auth)
        if not user:
            return json_response(401, {'error': 'Не авторизован'})
        return json_response(200, {'user': user})
    
    if action == 'update-profile':
        auth = event.get('headers', {}).get('X-Authorization', '') or event.get('headers', {}).get('x-authorization', '')
        user = get_user_by_token(auth)
        if not user:
            return json_response(401, {'error': 'Не авторизован'})
        name = body.get('name', user['name'])
        phone = body.get('phone', user.get('phone', ''))
        lang = body.get('lang', user.get('lang', 'ru'))
        theme = body.get('theme', user.get('theme', 'dark'))
        conn = get_db()
        cur = conn.cursor()
        cur.execute("UPDATE users SET name='%s', phone='%s', lang='%s', theme='%s' WHERE id=%d" % (name.replace("'","''"), phone.replace("'","''"), lang, theme, user['id']))
        conn.commit()
        conn.close()
        return json_response(200, {'success': True})
    
    return json_response(404, {'error': 'Not found'})

def handle_categories(event, method):
    auth = event.get('headers', {}).get('X-Authorization', '') or event.get('headers', {}).get('x-authorization', '')
    
    if method == 'GET':
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT * FROM categories ORDER BY sort_order, id")
        cats = [dict(r) for r in cur.fetchall()]
        conn.close()
        return json_response(200, {'categories': cats})
    
    user = get_user_by_token(auth)
    if not user or user['role'] != 'admin':
        return json_response(403, {'error': 'Нет доступа'})
    
    body = json.loads(event.get('body', '{}') or '{}')
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    if method == 'POST':
        name = body.get('name', '')
        if not name:
            conn.close()
            return json_response(400, {'error': 'Название обязательно'})
        cur.execute("INSERT INTO categories (name) VALUES ('%s') RETURNING *" % name.replace("'", "''"))
        cat = dict(cur.fetchone())
        conn.commit()
        conn.close()
        return json_response(200, {'category': cat})
    
    if method == 'DELETE':
        cat_id = body.get('id')
        if not cat_id:
            conn.close()
            return json_response(400, {'error': 'ID обязателен'})
        cur.execute("SELECT is_default FROM categories WHERE id = %d" % int(cat_id))
        cat = cur.fetchone()
        if cat and cat['is_default']:
            conn.close()
            return json_response(400, {'error': 'Нельзя удалить раздел по умолчанию'})
        cur.execute("UPDATE services SET category_id = (SELECT id FROM categories WHERE is_default = TRUE LIMIT 1) WHERE category_id = %d" % int(cat_id))
        cur.execute("DELETE FROM categories WHERE id = %d AND is_default = FALSE" % int(cat_id))
        conn.commit()
        conn.close()
        return json_response(200, {'success': True})
    
    conn.close()
    return json_response(404, {'error': 'Not found'})

def handle_services(event, method):
    auth = event.get('headers', {}).get('X-Authorization', '') or event.get('headers', {}).get('x-authorization', '')
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    params = event.get('queryStringParameters', {}) or {}
    
    if method == 'GET':
        service_id = params.get('id', '')
        if service_id:
            cur.execute("SELECT s.*, c.name as category_name FROM services s LEFT JOIN categories c ON s.category_id = c.id WHERE s.id = %d" % int(service_id))
            svc = cur.fetchone()
            if not svc:
                conn.close()
                return json_response(404, {'error': 'Услуга не найдена'})
            svc = dict(svc)
            cur.execute("SELECT * FROM service_slots WHERE service_id = %d ORDER BY slot_date, slot_time" % int(service_id))
            svc['slots'] = [dict(r) for r in cur.fetchall()]
            cur.execute("SELECT s.id, s.name, s.price, s.photos FROM services s WHERE s.category_id = %d AND s.id != %d LIMIT 4" % (svc.get('category_id') or 0, int(service_id)))
            svc['related'] = [dict(r) for r in cur.fetchall()]
            conn.close()
            return json_response(200, {'service': svc})
        
        cat_id = params.get('category_id', '')
        sort = params.get('sort', 'new')
        order = 'created_at DESC'
        if sort == 'cheap':
            order = 'price ASC'
        elif sort == 'expensive':
            order = 'price DESC'
        elif sort == 'popular':
            order = 'is_popular DESC, created_at DESC'
        
        where = ''
        if cat_id:
            where = "WHERE s.category_id = %d" % int(cat_id)
        
        cur.execute("SELECT s.*, c.name as category_name FROM services s LEFT JOIN categories c ON s.category_id = c.id %s ORDER BY %s" % (where, order))
        svcs = [dict(r) for r in cur.fetchall()]
        conn.close()
        return json_response(200, {'services': svcs})
    
    user = get_user_by_token(auth)
    if not user or user['role'] != 'admin':
        conn.close()
        return json_response(403, {'error': 'Нет доступа'})
    
    body = json.loads(event.get('body', '{}') or '{}')
    
    if method == 'POST':
        name = body.get('name', '')
        description = body.get('description', '')
        price = body.get('price', 0)
        category_id = body.get('category_id')
        photos = json.dumps(body.get('photos', []))
        is_popular = body.get('is_popular', False)
        slots = body.get('slots', [])
        
        if not name or not price:
            conn.close()
            return json_response(400, {'error': 'Название и цена обязательны'})
        
        cat_part = "NULL" if not category_id else str(int(category_id))
        pop = 'TRUE' if is_popular else 'FALSE'
        cur.execute("INSERT INTO services (name, description, price, category_id, photos, is_popular) VALUES ('%s', '%s', %s, %s, '%s', %s) RETURNING *" % (name.replace("'","''"), description.replace("'","''"), float(price), cat_part, photos.replace("'","''"), pop))
        svc = dict(cur.fetchone())
        
        for slot in slots:
            slot_date = slot.get('date', '')
            slot_time = slot.get('time', '')
            if slot_date and slot_time:
                cur.execute("INSERT INTO service_slots (service_id, slot_date, slot_time) VALUES (%d, '%s', '%s')" % (svc['id'], slot_date, slot_time))
        
        conn.commit()
        conn.close()
        return json_response(200, {'service': svc})
    
    if method == 'PUT':
        svc_id = body.get('id')
        if not svc_id:
            conn.close()
            return json_response(400, {'error': 'ID обязателен'})
        updates = []
        if 'name' in body:
            updates.append("name='%s'" % body['name'].replace("'","''"))
        if 'description' in body:
            updates.append("description='%s'" % body['description'].replace("'","''"))
        if 'price' in body:
            updates.append("price=%s" % float(body['price']))
        if 'category_id' in body:
            updates.append("category_id=%d" % int(body['category_id']))
        if 'photos' in body:
            updates.append("photos='%s'" % json.dumps(body['photos']).replace("'","''"))
        if 'is_popular' in body:
            updates.append("is_popular=%s" % ('TRUE' if body['is_popular'] else 'FALSE'))
        if updates:
            cur.execute("UPDATE services SET %s WHERE id = %d" % (', '.join(updates), int(svc_id)))
        
        if 'slots' in body:
            cur.execute("DELETE FROM service_slots WHERE service_id = %d AND is_booked = FALSE" % int(svc_id))
            for slot in body['slots']:
                slot_date = slot.get('date', '')
                slot_time = slot.get('time', '')
                if slot_date and slot_time:
                    cur.execute("INSERT INTO service_slots (service_id, slot_date, slot_time) VALUES (%d, '%s', '%s')" % (int(svc_id), slot_date, slot_time))
        
        conn.commit()
        conn.close()
        return json_response(200, {'success': True})
    
    if method == 'DELETE':
        svc_id = body.get('id')
        if not svc_id:
            conn.close()
            return json_response(400, {'error': 'ID обязателен'})
        cur.execute("DELETE FROM service_slots WHERE service_id = %d" % int(svc_id))
        cur.execute("DELETE FROM favorites WHERE service_id = %d" % int(svc_id))
        cur.execute("DELETE FROM bookings WHERE service_id = %d" % int(svc_id))
        cur.execute("DELETE FROM services WHERE id = %d" % int(svc_id))
        conn.commit()
        conn.close()
        return json_response(200, {'success': True})
    
    conn.close()
    return json_response(404, {'error': 'Not found'})

def handle_bookings(event, method):
    auth = event.get('headers', {}).get('X-Authorization', '') or event.get('headers', {}).get('x-authorization', '')
    user = get_user_by_token(auth)
    
    if method == 'GET':
        if not user:
            return json_response(401, {'error': 'Не авторизован'})
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        if user['role'] == 'admin':
            cur.execute("SELECT b.*, s.name as service_name, ss.slot_date, ss.slot_time FROM bookings b LEFT JOIN services s ON b.service_id = s.id LEFT JOIN service_slots ss ON b.slot_id = ss.id ORDER BY b.created_at DESC")
        else:
            cur.execute("SELECT b.*, s.name as service_name, ss.slot_date, ss.slot_time FROM bookings b LEFT JOIN services s ON b.service_id = s.id LEFT JOIN service_slots ss ON b.slot_id = ss.id WHERE b.user_id = %d ORDER BY b.created_at DESC" % user['id'])
        bookings = [dict(r) for r in cur.fetchall()]
        conn.close()
        return json_response(200, {'bookings': bookings})
    
    if method == 'POST':
        if not user:
            return json_response(401, {'error': 'Не авторизован'})
        body = json.loads(event.get('body', '{}') or '{}')
        service_id = body.get('service_id')
        slot_id = body.get('slot_id')
        name = body.get('name', '')
        phone = body.get('phone', '')
        email = body.get('email', '')
        age = body.get('age')
        comment = body.get('comment', '')
        
        if not service_id or not slot_id:
            return json_response(400, {'error': 'Выберите услугу и окошко'})
        
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT is_booked FROM service_slots WHERE id = %d" % int(slot_id))
        slot = cur.fetchone()
        if not slot or slot['is_booked']:
            conn.close()
            return json_response(400, {'error': 'Это окошко уже забронировано'})
        
        age_val = "NULL" if not age else str(int(age))
        cur.execute("INSERT INTO bookings (service_id, slot_id, user_id, name, phone, email, age, comment) VALUES (%d, %d, %d, '%s', '%s', '%s', %s, '%s') RETURNING *" % (int(service_id), int(slot_id), user['id'], name.replace("'","''"), phone.replace("'","''"), email.replace("'","''"), age_val, comment.replace("'","''")))
        booking = dict(cur.fetchone())
        cur.execute("UPDATE service_slots SET is_booked = TRUE WHERE id = %d" % int(slot_id))
        conn.commit()
        conn.close()
        return json_response(200, {'booking': booking})
    
    return json_response(404, {'error': 'Not found'})

def handle_promotions(event, method):
    auth = event.get('headers', {}).get('X-Authorization', '') or event.get('headers', {}).get('x-authorization', '')
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    if method == 'GET':
        cur.execute("SELECT * FROM promotions ORDER BY created_at DESC")
        promos = [dict(r) for r in cur.fetchall()]
        conn.close()
        return json_response(200, {'promotions': promos})
    
    user = get_user_by_token(auth)
    if not user or user['role'] != 'admin':
        conn.close()
        return json_response(403, {'error': 'Нет доступа'})
    
    body = json.loads(event.get('body', '{}') or '{}')
    
    if method == 'POST':
        title = body.get('title', '')
        description = body.get('description', '')
        cover_url = body.get('cover_url', '')
        end_date = body.get('end_date', '')
        
        if not title:
            conn.close()
            return json_response(400, {'error': 'Название обязательно'})
        
        end_part = "NULL" if not end_date else "'%s'" % end_date
        cur.execute("INSERT INTO promotions (title, description, cover_url, end_date) VALUES ('%s', '%s', '%s', %s) RETURNING *" % (title.replace("'","''"), description.replace("'","''"), cover_url.replace("'","''"), end_part))
        promo = dict(cur.fetchone())
        conn.commit()
        conn.close()
        return json_response(200, {'promotion': promo})
    
    if method == 'DELETE':
        promo_id = body.get('id')
        if not promo_id:
            conn.close()
            return json_response(400, {'error': 'ID обязателен'})
        cur.execute("DELETE FROM promotions WHERE id = %d" % int(promo_id))
        conn.commit()
        conn.close()
        return json_response(200, {'success': True})
    
    conn.close()
    return json_response(404, {'error': 'Not found'})

def handle_chat(event, method):
    auth = event.get('headers', {}).get('X-Authorization', '') or event.get('headers', {}).get('x-authorization', '')
    user = get_user_by_token(auth)
    if not user:
        return json_response(401, {'error': 'Не авторизован'})
    
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    params = event.get('queryStringParameters', {}) or {}
    
    if method == 'GET':
        if user['role'] == 'admin':
            chat_user_id = params.get('user_id', '')
            if chat_user_id:
                cur.execute("SELECT * FROM chat_messages WHERE user_id = %d ORDER BY created_at ASC" % int(chat_user_id))
                msgs = [dict(r) for r in cur.fetchall()]
                cur.execute("UPDATE chat_messages SET is_read = TRUE WHERE user_id = %d AND sender_role = 'user'" % int(chat_user_id))
                conn.commit()
                conn.close()
                return json_response(200, {'messages': msgs})
            cur.execute("SELECT DISTINCT ON (cm.user_id) cm.user_id, u.name, u.email, cm.message as last_message, cm.created_at, (SELECT COUNT(*) FROM chat_messages cm2 WHERE cm2.user_id = cm.user_id AND cm2.is_read = FALSE AND cm2.sender_role = 'user') as unread FROM chat_messages cm JOIN users u ON cm.user_id = u.id ORDER BY cm.user_id, cm.created_at DESC")
            chats = [dict(r) for r in cur.fetchall()]
            conn.close()
            return json_response(200, {'chats': chats})
        else:
            cur.execute("SELECT * FROM chat_messages WHERE user_id = %d ORDER BY created_at ASC" % user['id'])
            msgs = [dict(r) for r in cur.fetchall()]
            cur.execute("UPDATE chat_messages SET is_read = TRUE WHERE user_id = %d AND sender_role = 'admin'" % user['id'])
            conn.commit()
            conn.close()
            return json_response(200, {'messages': msgs})
    
    if method == 'POST':
        body = json.loads(event.get('body', '{}') or '{}')
        message = body.get('message', '').strip()
        if not message:
            conn.close()
            return json_response(400, {'error': 'Сообщение не может быть пустым'})
        
        if user['role'] == 'admin':
            target_user_id = body.get('user_id')
            if not target_user_id:
                conn.close()
                return json_response(400, {'error': 'user_id обязателен'})
            cur.execute("INSERT INTO chat_messages (user_id, sender_role, message) VALUES (%d, 'admin', '%s') RETURNING *" % (int(target_user_id), message.replace("'","''")))
        else:
            cur.execute("INSERT INTO chat_messages (user_id, sender_role, message) VALUES (%d, 'user', '%s') RETURNING *" % (user['id'], message.replace("'","''")))
        
        msg = dict(cur.fetchone())
        conn.commit()
        conn.close()
        return json_response(200, {'message': msg})
    
    conn.close()
    return json_response(404, {'error': 'Not found'})

def handle_favorites(event, method):
    auth = event.get('headers', {}).get('X-Authorization', '') or event.get('headers', {}).get('x-authorization', '')
    user = get_user_by_token(auth)
    if not user:
        return json_response(401, {'error': 'Не авторизован'})
    
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    if method == 'GET':
        cur.execute("SELECT s.* FROM favorites f JOIN services s ON f.service_id = s.id WHERE f.user_id = %d ORDER BY f.created_at DESC" % user['id'])
        favs = [dict(r) for r in cur.fetchall()]
        conn.close()
        return json_response(200, {'favorites': favs})
    
    body = json.loads(event.get('body', '{}') or '{}')
    service_id = body.get('service_id')
    
    if method == 'POST':
        cur.execute("SELECT id FROM favorites WHERE user_id = %d AND service_id = %d" % (user['id'], int(service_id)))
        if cur.fetchone():
            cur.execute("DELETE FROM favorites WHERE user_id = %d AND service_id = %d" % (user['id'], int(service_id)))
            conn.commit()
            conn.close()
            return json_response(200, {'favorited': False})
        cur.execute("INSERT INTO favorites (user_id, service_id) VALUES (%d, %d)" % (user['id'], int(service_id)))
        conn.commit()
        conn.close()
        return json_response(200, {'favorited': True})
    
    conn.close()
    return json_response(404, {'error': 'Not found'})

def handler(event, context):
    """API маникюрного мастера maninov — авторизация, услуги, бронирование, чат, акции"""
    if event.get('httpMethod') == 'OPTIONS':
        return json_response(200, '')
    
    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters', {}) or {}
    route = params.get('route', '')
    
    if not route:
        return json_response(200, {'status': 'ok', 'service': 'maninov API'})
    
    if route.startswith('auth/'):
        action = route.replace('auth/', '')
        return handle_auth(event, action)
    elif route == 'categories':
        return handle_categories(event, method)
    elif route == 'services':
        return handle_services(event, method)
    elif route == 'bookings':
        return handle_bookings(event, method)
    elif route == 'promotions':
        return handle_promotions(event, method)
    elif route == 'chat':
        return handle_chat(event, method)
    elif route == 'favorites':
        return handle_favorites(event, method)
    
    return json_response(404, {'error': 'Маршрут не найден'})
