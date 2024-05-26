from flask import Flask, render_template, request, redirect, url_for, session, jsonify, Response
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import time

app = Flask(__name__)

# Initialize the database
def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_name TEXT NOT NULL,
            admin_email TEXT NOT NULL,
            privacy TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

timing = 0

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    email = request.json.get('email')
    password = request.json.get('password')
    
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email=?", (email,))
    user = cursor.fetchone()
    conn.close()
    
    if user and check_password_hash(user[2], password):
        session['email'] = email
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'})

@app.route('/signup', methods=['POST'])
def signup():
    email = request.json.get('email')
    password = request.json.get('password')
    
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE email=?", (email,))
    existing_user = cursor.fetchone()
    
    if existing_user:
        return jsonify({'success': False, 'message': 'Email already registered'})
    
    hashed_password = generate_password_hash(password)
    cursor.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, hashed_password))
    conn.commit()
    conn.close()
    
    session['email'] = email
    return jsonify({'success': True})

@app.route('/logout')
def logout():
    session.pop('email', None)
    return redirect(url_for('index'))

@app.route('/create-group', methods=['POST'])
def create_group():
    if 'email' not in session:
        return jsonify({'success': False, 'message': 'You must be logged in to create a group'})
    
    #check the number of groups
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM groups WHERE admin_email=?", (session['email'],))
    group_count = cursor.fetchone()[0]
    conn.close()

    max_groups = 10  #max limit of groups

    if group_count >= max_groups:
        return jsonify({'success': False, 'message': 'You have reached the maximum limit of groups'})
    
    group_name = request.json.get('group_name')
    admin_email = session['email']
    privacy = request.json.get('privacy')
    
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM groups WHERE group_name=? AND admin_email=?", (group_name, admin_email))
    existing_group = cursor.fetchone()
    if existing_group:
        return jsonify({'success': False, 'message': 'Group name already exists. Please choose a different name'})
    
    cursor.execute("INSERT INTO groups (group_name, admin_email, privacy) VALUES (?, ?, ?)", 
                   (group_name, admin_email, privacy))
    conn.commit()
    group_id = cursor.lastrowid
    conn.close()
    return jsonify({'success': True, 'group_id': group_id})

@app.route('/public-groups', methods=['GET'])
def public_groups():
    try:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute("SELECT id, group_name FROM groups WHERE privacy='public'")
        public_groups = cursor.fetchall()
        conn.close()
        return jsonify(public_groups)
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/group/<int:group_id>')
def group(group_id):
    return render_template('group.html', group_id=group_id)

@app.route('/join-group', methods=['POST'])
def join_group():
    group_id = request.json.get('group_id')
    user_email = session.get('email')

    if not user_email:
        return jsonify({'success': False, 'message': 'You must be logged in to join a group'})

    #is user already a member of group?
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM group_members WHERE group_id=? AND member_email=?", (group_id, user_email))
    existing_membership = cursor.fetchone()

    if existing_membership:
        return jsonify({'success': False, 'message': 'You are already a member of this group'})

    cursor.execute("INSERT INTO group_members (group_id, member_email) VALUES (?, ?)", (group_id, user_email))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'You have successfully joined the group'})

@app.route('/content', methods=['GET'])
def content():
    global timing
    def timer(t):
        for i in range(t):
            time.sleep(1)
            yield str(i)
    return Response(timer(timing), mimetype='text/html')

if __name__ == "__main__":
    app.run(debug=True)
