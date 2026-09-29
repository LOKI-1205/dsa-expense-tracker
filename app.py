"""
=============================================================================
TRACKPULSE — PYTHON FLASK WEB APPLICATION & DSA ENGINE
=============================================================================
Run with: python app.py
Open: http://localhost:5000 in your browser
"""

import os
import csv
import json
import io
from datetime import datetime
from flask import Flask, jsonify, request, send_file, render_template_string

# Import Pure Python Data Structures
from dsa import DynamicArray, CustomHashMap, MaxHeap

app = Flask(__name__)

# Global Python DSA Instances
transactions_array = DynamicArray(initial_capacity=8)
category_hashmap = CustomHashMap(initial_capacity=8)
max_heap = MaxHeap()
monthly_budget = 50000.0


def update_hashmap_category(category: str, amount: float, action: str = 'add'):
    """Helper to update Hash Map Category Key-Value Totals."""
    existing = category_hashmap.get(category)
    if not existing:
        existing = {'totalAmount': 0.0, 'count': 0}

    if action == 'add':
        existing['totalAmount'] += amount
        existing['count'] += 1
    elif action == 'remove':
        existing['totalAmount'] -= amount
        existing['count'] -= 1

    if existing['count'] <= 0 or existing['totalAmount'] <= 0:
        category_hashmap.delete(category)
    else:
        category_hashmap.set(category, existing)


def populate_data(items):
    """Clears and re-populates all 3 Data Structures in Python."""
    transactions_array.clear()
    category_hashmap.clear()
    max_heap.clear()

    for item in items:
        exp = {
            'id': item.get('id') or f"{int(datetime.now().timestamp())}_{item.get('description', '')[:3]}",
            'description': str(item['description']),
            'amount': float(item['amount']),
            'category': str(item['category']),
            'date': str(item['date']),
            'priority': str(item.get('priority', 'Essential')),
            'notes': str(item.get('notes', ''))
        }
        transactions_array.push(exp)
        update_hashmap_category(exp['category'], exp['amount'], 'add')
        max_heap.insert(exp)


@app.route('/')
def home():
    """Serves main Single Page Application index.html."""
    html_path = os.path.join(os.path.dirname(__file__), 'index.html')
    if os.path.exists(html_path):
        with open(html_path, 'r', encoding='utf-8') as f:
            return f.read()
    return "<h1>TrackPulse Python Application</h1><p>index.html not found.</p>"


@app.route('/<path:filename>')
def serve_static(filename):
    """Serves static CSS, JS, and asset files."""
    file_path = os.path.join(os.path.dirname(__file__), filename)
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        mimetype = 'text/plain'
        if filename.endswith('.css'):
            mimetype = 'text/css'
        elif filename.endswith('.js'):
            mimetype = 'application/javascript'
        elif filename.endswith('.html'):
            mimetype = 'text/html'

        return content, 200, {'Content-Type': mimetype}
    return f"File {filename} not found", 404


# =============================================================================
# REST API ENDPOINTS — EXECUTED PURELY IN PYTHON
# =============================================================================

@app.route('/api/dsa_state', methods=['GET'])
def get_dsa_state():
    """Returns complete state of all 3 Data Structures in Python memory."""
    total_spending = sum(exp['amount'] for exp in transactions_array.to_list())
    top_exp = max_heap.peekMax()

    # Category breakdown
    cat_entries = category_hashmap.entries()
    highest_cat = "None"
    highest_amt = 0.0
    for cat, info in cat_entries:
        if info['totalAmount'] > highest_amt:
            highest_amt = info['totalAmount']
            highest_cat = cat

    # Format Hash Map buckets for visualizer
    buckets_formatted = []
    for i in range(category_hashmap.capacity):
        bucket_items = []
        for k, v in category_hashmap.buckets[i]:
            bucket_items.append({'key': k, 'totalAmount': v['totalAmount'], 'count': v['count']})
        buckets_formatted.append({'bucketIndex': i, 'items': bucket_items})

    return jsonify({
        'status': 'success',
        'kpi': {
            'totalSpending': total_spending,
            'monthlyBudget': monthly_budget,
            'topExpenseAmount': top_exp['amount'] if top_exp else 0.0,
            'topExpenseTitle': top_exp['description'] if top_exp else 'No expenses',
            'topCategoryName': highest_cat,
            'topCategoryAmount': highest_amt
        },
        'dynamicArray': {
            'size': transactions_array.size,
            'capacity': transactions_array.capacity,
            'items': transactions_array.to_list(),
            'logs': list(reversed(transactions_array.resize_logs[-15:]))
        },
        'hashMap': {
            'size': category_hashmap.size,
            'capacity': category_hashmap.capacity,
            'loadFactor': category_hashmap.get_load_factor(),
            'buckets': buckets_formatted,
            'entries': [{'category': k, 'totalAmount': v['totalAmount'], 'count': v['count']} for k, v in cat_entries]
        },
        'maxHeap': {
            'size': max_heap.size(),
            'arrayStorage': max_heap.heap,
            'topK': max_heap.get_top_k(5)
        }
    })


@app.route('/api/add_expense', methods=['POST'])
def add_expense():
    """Adds a new expense into Python Data Structures."""
    data = request.json or {}
    description = str(data.get('description', '')).strip()
    amount_raw = str(data.get('amount', '0')).replace(',', '').strip()

    try:
        amount = float(amount_raw)
    except ValueError:
        return jsonify({'status': 'error', 'message': 'Invalid amount'}), 400

    if not description:
        return jsonify({'status': 'error', 'message': 'Description required'}), 400

    category = str(data.get('category', 'Other'))
    date_str = str(data.get('date', datetime.now().strftime('%Y-%m-%d')))
    priority = str(data.get('priority', 'Essential'))
    notes = str(data.get('notes', ''))

    new_exp = {
        'id': f"{int(datetime.now().timestamp())}_{description[:3]}",
        'description': description,
        'amount': amount,
        'category': category,
        'date': date_str,
        'priority': priority,
        'notes': notes
    }

    # Execute Python DSA calls
    transactions_array.push(new_exp)
    update_hashmap_category(category, amount, 'add')
    max_heap.insert(new_exp)

    return jsonify({'status': 'success', 'message': f'Expense "{description}" added successfully!', 'expense': new_exp})


@app.route('/api/delete_expense', methods=['POST'])
def delete_expense():
    """Deletes an expense from Python Data Structures by ID."""
    data = request.json or {}
    target_id = str(data.get('id', ''))

    found_idx = -1
    target_exp = None

    for i in range(transactions_array.size):
        if transactions_array.get(i)['id'] == target_id:
            found_idx = i
            target_exp = transactions_array.get(i)
            break

    if found_idx != -1 and target_exp:
        # 1. Remove from Dynamic Array
        transactions_array.remove_at(found_idx)
        # 2. Update Hash Map Category Total
        update_hashmap_category(target_exp['category'], target_exp['amount'], 'remove')
        # 3. Rebuild Max Heap
        max_heap.heapify(transactions_array.to_list())

        return jsonify({'status': 'success', 'message': f'Deleted expense "{target_exp["description"]}"'})

    return jsonify({'status': 'error', 'message': 'Expense ID not found'}), 404


@app.route('/api/set_budget', methods=['POST'])
def set_budget():
    """Sets Monthly Budget in Python backend."""
    global monthly_budget
    data = request.json or {}
    raw_val = str(data.get('budget', '50000')).replace(',', '').strip()

    try:
        val = float(raw_val)
        if val >= 0:
            monthly_budget = val
            return jsonify({'status': 'success', 'message': f'Monthly budget updated to ₹{val:,.2f}', 'budget': val})
    except ValueError:
        pass

    return jsonify({'status': 'error', 'message': 'Invalid budget amount'}), 400


@app.route('/api/load_demo', methods=['POST'])
def load_demo():
    """Loads demo datasets in Python backend."""
    data = request.json or {}
    preset_type = str(data.get('type', 'cs-student'))
    today_str = datetime.now().strftime('%Y-%m-%d')

    demo_items = []
    if preset_type == 'cs-student':
        demo_items = [
            {'description': 'MacBook Pro M3 (CS Lab)', 'amount': 149900.0, 'category': 'Shopping & Tech', 'date': today_str, 'priority': 'Essential', 'notes': '#laptop'},
            {'description': 'University Tuition Fee', 'amount': 45000.0, 'category': 'Education & Books', 'date': today_str, 'priority': 'Essential', 'notes': '#semester'},
            {'description': 'AWS Cloud Credits & VPS', 'amount': 3500.0, 'category': 'Shopping & Tech', 'date': today_str, 'priority': 'Essential', 'notes': '#dsa'},
            {'description': 'Hostel Apartment Rent', 'amount': 12000.0, 'category': 'Housing & Rent', 'date': today_str, 'priority': 'Essential', 'notes': '#rent'},
            {'description': 'Coffee & Snacks', 'amount': 350.0, 'category': 'Food & Dining', 'date': today_str, 'priority': 'Discretionary', 'notes': '#cafe'}
        ]
    elif preset_type == 'freelancer':
        demo_items = [
            {'description': 'Client Dinner & Lunch', 'amount': 4800.0, 'category': 'Food & Dining', 'date': today_str, 'priority': 'Essential'},
            {'description': 'Ergonomic Standing Desk', 'amount': 24000.0, 'category': 'Shopping & Tech', 'date': today_str, 'priority': 'Investment'},
            {'description': 'Fiber Broadband WiFi', 'amount': 1499.0, 'category': 'Utilities & Bills', 'date': today_str, 'priority': 'Essential'}
        ]
    elif preset_type == 'vacation':
        demo_items = [
            {'description': 'Flight Ticket (Goa / Manali)', 'amount': 18500.0, 'category': 'Travel & Transit', 'date': today_str, 'priority': 'Essential'},
            {'description': 'Resort Stay 4 Nights', 'amount': 16000.0, 'category': 'Travel & Transit', 'date': today_str, 'priority': 'Essential'}
        ]

    populate_data(demo_items)
    return jsonify({'status': 'success', 'message': f'Loaded {preset_type} dataset into Python DSA engine!'})


@app.route('/api/clear_data', methods=['POST'])
def clear_data():
    """Clears all expense data in Python memory."""
    transactions_array.clear()
    category_hashmap.clear()
    max_heap.clear()
    return jsonify({'status': 'success', 'message': 'All expense records cleared.'})


@app.route('/api/export_csv', methods=['GET'])
def export_csv():
    """Generates and downloads CSV file from Python backend."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Index', 'ID', 'Description', 'Amount (INR)', 'Category', 'Date', 'Priority', 'Notes'])

    items = transactions_array.to_list()
    for idx, exp in enumerate(items):
        writer.writerow([idx, exp['id'], exp['description'], exp['amount'], exp['category'], exp['date'], exp.get('priority', ''), exp.get('notes', '')])

    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'expense_export_{datetime.now().strftime("%Y%m%d_%H%M")}.csv'
    )


def main():
    print("=========================================================================")
    print("🚀 TrackPulse Python Web Application Backend Running")
    print("=========================================================================")
    print("👉 Open http://localhost:5000 in your browser to view the app!")
    print("=========================================================================")
    app.run(host='0.0.0.0', port=5000, debug=True)


if __name__ == '__main__':
    main()
