# 🐍 TrackPulse — Python DSA Expense Tracker & Analytics Engine

> A complete **Python-based implementation** of the Expense Tracker DSA Project, built with custom implementations of **Dynamic Array**, **Hash Map**, and **Binary Max-Heap**.

---

## 📁 Python Project Files

| File | Purpose |
| :--- | :--- |
| 🧠 [`dsa.py`](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/dsa-expense-tracker/python/dsa.py) | Pure Python implementations of `DynamicArray`, `CustomHashMap`, and `MaxHeap` with docstrings and type annotations. |
| 🖥️ [`main_cli.py`](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/dsa-expense-tracker/python/main_cli.py) | Interactive Terminal CLI Application allowing manual expense entry, category analytics, top expense leaderboard, and CSV export. |
| 🌐 [`web_server.py`](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/dsa-expense-tracker/python/web_server.py) | Lightweight Python HTTP Server powering the web app interface and JSON API endpoints. |

---

## 🚀 How to Run the Python App

### Option A: Interactive Terminal CLI App (Recommended for Viva / Evaluation)
Run the terminal application:
```bash
python python/main_cli.py
```

#### CLI Menu Options:
```text
=========================================================================
📊 TRACKPULSE — PYTHON DSA EXPENSE TRACKER & ANALYTICS ENGINE
=========================================================================
  💰 Total Spent: ₹0.00 | ⚙️ Budget: ₹50,000.00 (0.0% used)
  👑 Heap Max Expense: None
-------------------------------------------------------------------------
  [1] ➕ Add New Expense (Manual Input)
  [2] 📜 View All Expenses (Dynamic Array)
  [3] 📊 View Category Analytics (Hash Map)
  [4] 👑 View Top Expenses Leaderboard (Max-Heap)
  [5] ⚙️ Set Monthly Budget
  [6] 🪄 Load Demo Dataset
  [7] 📂 Export Records to CSV
  [8] 🚪 Exit
=========================================================================
```

---

### Option B: Python Web Application Server
Run the built-in Python web server:
```bash
python python/web_server.py
```
Open **`http://localhost:8000`** in your browser to view the interactive web dashboard powered by the Python server!

---

## 🧠 Python Data Structure Implementation Highlights

### 1. Dynamic Array (`DynamicArray` in `dsa.py`)
- Simulates low-level contiguous memory allocation.
- Automatically doubles buffer capacity ($2\times$) when `size == capacity`.
- $O(1)$ amortized push, $O(1)$ index access.

```python
class DynamicArray:
    def __init__(self, initial_capacity: int = 8):
        self.capacity = max(4, initial_capacity)
        self.size = 0
        self.buffer = [None] * self.capacity

    def push(self, item):
        if self.size >= self.capacity:
            self._resize(self.capacity * 2)
        self.buffer[self.size] = item
        self.size += 1
```

### 2. Hash Map with Separate Chaining (`CustomHashMap` in `dsa.py`)
- Custom **DJB2 String Hash** function: $hash(key) \pmod{capacity}$.
- Handles key collisions using separate chaining bucket lists.
- Computes load factor ($N / capacity$) and rehashes when load factor $> 0.75$.

```python
class CustomHashMap:
    def hash_code(self, key: str) -> int:
        hash_val = 5381
        for char in str(key):
            hash_val = ((hash_val << 5) + hash_val) ^ ord(char)
        return abs(hash_val) % self.capacity
```

### 3. Binary Max-Heap Priority Queue (`MaxHeap` in `dsa.py`)
- Stores complete binary tree representation in a Python list.
- Index arithmetic: Parent `(i-1)//2`, Left `2i+1`, Right `2i+2`.
- $O(1)$ `peek_max()`, $O(\log N)$ `insert()` (sift-up) and `extract_max()` (sift-down).

```python
class MaxHeap:
    def insert(self, expense: dict):
        self.heap.append(expense)
        self._sift_up(len(self.heap) - 1)
```
