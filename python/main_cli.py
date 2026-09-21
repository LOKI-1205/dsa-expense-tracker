"""
=============================================================================
TRACKPULSE — PYTHON TERMINAL & CLI EXPENSE TRACKER (DSA ENGINE)
=============================================================================
Run with: python main_cli.py
"""

import sys
import csv
import json
from datetime import datetime
from dsa import DynamicArray, CustomHashMap, MaxHeap

# Global State
transactions_array = DynamicArray(initial_capacity=8)
category_hashmap = CustomHashMap(initial_capacity=8)
max_heap = MaxHeap()
monthly_budget = 50000.0


def format_inr(amount: float) -> str:
    """Formats floating point currency into Indian Rupees (INR) format."""
    try:
        return f"₹{amount:,.2f}"
    except Exception:
        return f"₹{amount}"


def update_hashmap_category(category: str, amount: float, action: str = 'add'):
    """Updates Hash Map Category Key-Value Totals."""
    existing = category_hashmap.get(category)
    if not existing:
        existing = {'total': 0.0, 'count': 0}
    
    if action == 'add':
        existing['total'] += amount
        existing['count'] += 1
    elif action == 'remove':
        existing['total'] -= amount
        existing['count'] -= 1

    if existing['count'] <= 0 or existing['total'] <= 0:
        category_hashmap.delete(category)
    else:
        category_hashmap.set(category, existing)


def add_expense():
    print("\n--- ➕ ADD NEW EXPENSE ---")
    desc = input("Description / Title: ").strip()
    if not desc:
        print("❌ Description cannot be empty!")
        return

    amount_str = input("Amount in ₹ (e.g. 19500, 250.50): ").strip().replace(',', '')
    try:
        amount = float(amount_str)
    except ValueError:
        print("❌ Invalid numeric amount!")
        return

    print("\nSelect Category:")
    categories = [
        "Food & Dining", "Shopping & Tech", "Housing & Rent",
        "Travel & Transit", "Entertainment", "Utilities & Bills",
        "Education & Books", "Health & Fitness", "Other"
    ]
    for idx, cat in enumerate(categories, 1):
        print(f"  [{idx}] {cat}")
    print("  [0] Type Custom Category...")

    choice = input("Enter choice (0-9): ").strip()
    if choice == '0':
        cat_name = input("Type custom category name: ").strip()
        category = f"🏷️ {cat_name}" if cat_name else "Other"
    elif choice.isdigit() and 1 <= int(choice) <= len(categories):
        category = categories[int(choice) - 1]
    else:
        category = "Other"

    date_str = input(f"Date (YYYY-MM-DD) [Default: Today]: ").strip()
    if not date_str:
        date_str = datetime.now().strftime("%Y-%m-%d")

    priority = input("Priority (Essential / Discretionary / Investment) [Default: Essential]: ").strip().capitalize()
    if priority not in ['Essential', 'Discretionary', 'Investment']:
        priority = 'Essential'

    notes = input("Notes / Tags (Optional): ").strip()

    item = {
        'id': f"{int(datetime.now().timestamp())}",
        'description': desc,
        'amount': amount,
        'category': category,
        'date': date_str,
        'priority': priority,
        'notes': notes
    }

    # Insert into DSA Structures
    transactions_array.push(item)
    update_hashmap_category(category, amount, 'add')
    max_heap.insert(item)

    print(f"\n✅ Expense '{desc}' of {format_inr(amount)} added successfully!")


def view_all_expenses():
    print("\n=========================================================================")
    print("📜 ALL TRANSACTIONS (POWRED BY DYNAMIC ARRAY BUFFER)")
    print("=========================================================================")
    if len(transactions_array) == 0:
        print("No expenses recorded yet.")
        return

    items = transactions_array.to_list()
    print(f"{'Idx':<5} | {'Description':<25} | {'Category':<18} | {'Amount':<12} | {'Date':<10}")
    print("-" * 75)
    for idx, item in enumerate(items):
        print(f"[{idx:<3}] | {item['description'][:24]:<25} | {item['category'][:17]:<18} | {format_inr(item['amount']):<12} | {item['date']:<10}")

    print("-" * 75)
    print(f"DynamicArray Size: {transactions_array.size} | Buffer Capacity: {transactions_array.capacity}")


def view_category_analytics():
    print("\n=========================================================================")
    print("📊 CATEGORY ANALYTICS (CUSTOM HASH MAP BUCKET VIEW)")
    print("=========================================================================")
    entries = category_hashmap.entries()
    if not entries:
        print("No categories logged yet.")
        return

    print(f"Hash Map Load Factor: {category_hashmap.get_load_factor()} | Total Keys: {category_hashmap.size} | Capacity: {category_hashmap.capacity}\n")
    for category, info in entries:
        print(f"  • {category:<20}: {format_inr(info['total']):<12} ({info['count']} transaction(s))")

    print("\n--- BUCKET MEMORY LAYOUT ---")
    for i, bucket in enumerate(category_hashmap.buckets):
        if not bucket:
            print(f"  Bucket [{i}]: (empty)")
        else:
            chain_str = " -> ".join([f"{k} ({format_inr(v['total'])})" for k, v in bucket])
            print(f"  Bucket [{i}]: {chain_str}")


def view_top_expenses():
    print("\n=========================================================================")
    print("👑 TOP EXPENSES (EXTRACTED LIVE FROM BINARY MAX-HEAP)")
    print("=========================================================================")
    if max_heap.size() == 0:
        print("No expenses recorded.")
        return

    k_str = input("How many top expenses to view? (Default: 5): ").strip()
    k = int(k_str) if k_str.isdigit() else 5

    top_k = max_heap.get_top_k(k)
    print(f"\nTop {len(top_k)} Largest Expenses:")
    for idx, exp in enumerate(top_k, 1):
        print(f"  #{idx} {exp['description']} - {format_inr(exp['amount'])} [{exp['category']} on {exp['date']}]")

    print(f"\nHeap Root Node (Highest Single Expense): {format_inr(max_heap.peek_max()['amount'])}")


def set_monthly_budget():
    global monthly_budget
    print("\n--- ⚙️ SET MONTHLY BUDGET ---")
    print(f"Current Monthly Budget: {format_inr(monthly_budget)}")
    val_str = input("Enter new monthly budget in ₹: ").strip().replace(',', '')
    try:
        val = float(val_str)
        monthly_budget = val
        print(f"✅ Monthly Budget updated to {format_inr(monthly_budget)}!")
    except ValueError:
        print("❌ Invalid numeric amount!")


def load_demo_data():
    print("\n--- 🪄 LOAD DEMO DATASET ---")
    print("  [1] CS Student Life")
    print("  [2] Tech Freelancer")
    print("  [3] Vacation Trip")
    choice = input("Select dataset (1-3): ").strip()

    demo_data = []
    if choice == '1':
        demo_data = [
            {'description': 'MacBook Pro M3', 'amount': 149900.0, 'category': 'Shopping & Tech', 'date': '2026-09-01', 'priority': 'Essential'},
            {'description': 'College Tuition Fee', 'amount': 45000.0, 'category': 'Education & Books', 'date': '2026-09-02', 'priority': 'Essential'},
            {'description': 'AWS Cloud Credits', 'amount': 3500.0, 'category': 'Shopping & Tech', 'date': '2026-09-03', 'priority': 'Essential'},
            {'description': 'Hostel Rent', 'amount': 12000.0, 'category': 'Housing & Rent', 'date': '2026-09-05', 'priority': 'Essential'},
            {'description': 'Coffee & Snacks', 'amount': 350.0, 'category': 'Food & Dining', 'date': '2026-09-08', 'priority': 'Discretionary'}
        ]
    elif choice == '2':
        demo_data = [
            {'description': 'Standing Office Desk', 'amount': 24000.0, 'category': 'Shopping & Tech', 'date': '2026-09-01', 'priority': 'Investment'},
            {'description': 'Fiber Broadband WiFi', 'amount': 1499.0, 'category': 'Utilities & Bills', 'date': '2026-09-04', 'priority': 'Essential'},
            {'description': 'Co-Working Space Pass', 'amount': 8000.0, 'category': 'Housing & Rent', 'date': '2026-09-06', 'priority': 'Essential'}
        ]
    elif choice == '3':
        demo_data = [
            {'description': 'Flight Ticket', 'amount': 18500.0, 'category': 'Travel & Transit', 'date': '2026-09-10', 'priority': 'Essential'},
            {'description': 'Resort Hotel Stay', 'amount': 16000.0, 'category': 'Travel & Transit', 'date': '2026-09-12', 'priority': 'Essential'}
        ]
    else:
        print("Invalid selection.")
        return

    transactions_array.clear()
    category_hashmap.clear()
    max_heap.clear()

    for item in demo_data:
        item['id'] = f"{int(datetime.now().timestamp())}"
        transactions_array.push(item)
        update_hashmap_category(item['category'], item['amount'], 'add')
        max_heap.insert(item)

    print(f"✅ Loaded demo dataset with {len(demo_data)} entries!")


def export_csv():
    filename = f"expense_export_{datetime.now().strftime('%Y%m%d')}.csv"
    items = transactions_array.to_list()
    if not items:
        print("❌ No transactions to export!")
        return

    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Index', 'ID', 'Description', 'Amount (INR)', 'Category', 'Date', 'Priority', 'Notes'])
        for idx, item in enumerate(items):
            writer.writerow([idx, item['id'], item['description'], item['amount'], item['category'], item['date'], item.get('priority', ''), item.get('notes', '')])

    print(f"✅ Exported {len(items)} records to {filename}")


def main_menu():
    while True:
        total_spend = sum(item['amount'] for item in transactions_array.to_list())
        used_pct = round((total_spend / monthly_budget) * 100, 1) if monthly_budget > 0 else 0

        print("\n=========================================================================")
        print("📊 TRACKPULSE — PYTHON DSA EXPENSE TRACKER & ANALYTICS ENGINE")
        print("=========================================================================")
        print(f"  💰 Total Spent: {format_inr(total_spend)} | ⚙️ Budget: {format_inr(monthly_budget)} ({used_pct}% used)")
        top_exp = max_heap.peek_max()
        top_str = f"{top_exp['description']} ({format_inr(top_exp['amount'])})" if top_exp else "None"
        print(f"  👑 Heap Max Expense: {top_str}")
        print("-------------------------------------------------------------------------")
        print("  [1] ➕ Add New Expense (Manual Input)")
        print("  [2] 📜 View All Expenses (Dynamic Array)")
        print("  [3] 📊 View Category Analytics (Hash Map)")
        print("  [4] 👑 View Top Expenses Leaderboard (Max-Heap)")
        print("  [5] ⚙️ Set Monthly Budget")
        print("  [6] 🪄 Load Demo Dataset")
        print("  [7] 📂 Export Records to CSV")
        print("  [8] 🚪 Exit")
        print("=========================================================================")

        choice = input("Enter option (1-8): ").strip()
        if choice == '1':
            add_expense()
        elif choice == '2':
            view_all_expenses()
        elif choice == '3':
            view_category_analytics()
        elif choice == '4':
            view_top_expenses()
        elif choice == '5':
            set_monthly_budget()
        elif choice == '6':
            load_demo_data()
        elif choice == '7':
            export_csv()
        elif choice == '8':
            print("\nThank you for using TrackPulse Python DSA Engine! Goodbye 👋\n")
            sys.exit(0)
        else:
            print("Invalid option. Please enter 1-8.")


if __name__ == '__main__':
    main_menu()
