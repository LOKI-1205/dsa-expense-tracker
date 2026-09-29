"""
=============================================================================
TRACKPULSE — PYTHON DATA STRUCTURES & ALGORITHMS ENGINE
=============================================================================
Topic: Expense Tracker with Analytics
Key Data Structures:
1. DynamicArray (Contiguous buffer allocation, 2x resizing strategy, O(1) access)
2. CustomHashMap (DJB2 String Hashing, Separate Chaining buckets, O(1) avg lookup)
3. MaxHeap (Binary Max-Heap Priority Queue, Sift-Up, Sift-Down, O(1) Peek, O(log N) Heapify)
=============================================================================
"""

import math
from typing import List, Dict, Any, Optional, Tuple, Callable


# =============================================================================
# 1. DYNAMIC ARRAY DATA STRUCTURE
# =============================================================================
class DynamicArray:
    """
    Custom Resizable Dynamic Array implementation in Python.
    Simulates contiguous memory allocation and capacity expansion.
    """
    def __init__(self, initial_capacity: int = 8):
        self.capacity: int = max(4, initial_capacity)
        self.size: int = 0
        self.buffer: List[Any] = [None] * self.capacity
        self.resize_logs: List[str] = [f"[SYSTEM] DynamicArray initialized with capacity {self.capacity}."]

    def push(self, item: Any) -> int:
        """
        Appends element to dynamic array buffer.
        Resizes by doubling capacity (2x strategy) when size reaches capacity.
        Amortized Time Complexity: O(1)
        """
        if self.size >= self.capacity:
            self._resize(self.capacity * 2)

        self.buffer[self.size] = item
        self.size += 1
        return self.size

    def get(self, index: int) -> Any:
        """Retrieves item at index in O(1) time."""
        if index < 0 or index >= self.size:
            raise IndexError(f"Index {index} out of bounds for array size {self.size}")
        return self.buffer[index]

    def set(self, index: int, value: Any) -> None:
        """Sets item at index in O(1) time."""
        if index < 0 or index >= self.size:
            raise IndexError(f"Index {index} out of bounds for array size {self.size}")
        self.buffer[index] = value

    def remove_at(self, index: int) -> Any:
        """Removes element at index and shifts remaining elements left in O(N) time."""
        if index < 0 or index >= self.size:
            return None

        removed_item = self.buffer[index]
        for i in range(index, self.size - 1):
            self.buffer[i] = self.buffer[i + 1]

        self.size -= 1
        self.buffer[self.size] = None

        # Shrink buffer if size drops to 1/4 of capacity
        if self.size > 0 and self.size <= self.capacity // 4 and self.capacity // 2 >= 4:
            self._resize(self.capacity // 2)

        return removed_item

    def _resize(self, new_capacity: int) -> None:
        """Internal buffer reallocation routine."""
        old_cap = self.capacity
        self.capacity = new_capacity
        new_buffer = [None] * new_capacity

        for i in range(self.size):
            new_buffer[i] = self.buffer[i]

        self.buffer = new_buffer
        log_msg = f"[RESIZE] Capacity changed from {old_cap} -> {new_capacity} (active elements: {self.size})"
        self.resize_logs.append(log_msg)

    def to_list(self) -> List[Any]:
        """Returns list of active elements."""
        return [self.buffer[i] for i in range(self.size)]

    def filter(self, predicate: Callable[[Any], bool]) -> 'DynamicArray':
        """Filters elements into a new DynamicArray."""
        filtered = DynamicArray()
        for i in range(self.size):
            if predicate(self.buffer[i]):
                filtered.push(self.buffer[i])
        return filtered

    def clear(self) -> None:
        """Resets the array."""
        self.size = 0
        self.capacity = 8
        self.buffer = [None] * self.capacity
        self.resize_logs.append("[SYSTEM] DynamicArray cleared.")

    def __len__(self) -> int:
        return self.size


# =============================================================================
# 2. HASH MAP DATA STRUCTURE (SEPARATE CHAINING)
# =============================================================================
class CustomHashMap:
    """
    Custom Hash Table using DJB2 string hashing algorithm and Separate Chaining
    bucket arrays for collision handling.
    Average Time Complexity: O(1) for Insert, Lookup, and Delete.
    """
    def __init__(self, initial_capacity: int = 8):
        self.capacity: int = initial_capacity
        self.size: int = 0
        self.buckets: List[List[Tuple[str, Dict[str, Any]]]] = [[] for _ in range(self.capacity)]

    def hash_code(self, key: str) -> int:
        """DJB2 String Hashing Algorithm."""
        hash_val = 5381
        for char in str(key):
            hash_val = ((hash_val << 5) + hash_val) ^ ord(char)
        return abs(hash_val) % self.capacity

    def set(self, key: str, value: Any) -> None:
        """Inserts or updates key-value pair in O(1) average time."""
        idx = self.hash_code(key)
        bucket = self.buckets[idx]

        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return

        bucket.append((key, value))
        self.size += 1

        if self.size / self.capacity > 0.75:
            self._rehash(self.capacity * 2)

    def get(self, key: str) -> Optional[Any]:
        """Retrieves value for key in O(1) average time."""
        idx = self.hash_code(key)
        bucket = self.buckets[idx]

        for k, v in bucket:
            if k == key:
                return v
        return None

    def delete(self, key: str) -> bool:
        """Deletes key from hash map in O(1) average time."""
        idx = self.hash_code(key)
        bucket = self.buckets[idx]

        for i, (k, v) in enumerate(bucket):
            if k == key:
                del bucket[i]
                self.size -= 1
                return True
        return False

    def entries(self) -> List[Tuple[str, Any]]:
        """Returns list of (key, value) tuples."""
        res = []
        for bucket in self.buckets:
            for k, v in bucket:
                res.append((k, v))
        return res

    def keys(self) -> List[str]:
        return [k for k, _ in self.entries()]

    def values(self) -> List[Any]:
        return [v for _, v in self.entries()]

    def _rehash(self, new_capacity: int) -> None:
        """Rehashes entries into a new capacity bucket array."""
        old_entries = self.entries()
        self.capacity = new_capacity
        self.size = 0
        self.buckets = [[] for _ in range(self.capacity)]

        for k, v in old_entries:
            self.set(k, v)

    def get_load_factor(self) -> float:
        return round(self.size / self.capacity, 2)

    def clear(self) -> None:
        self.size = 0
        self.capacity = 8
        self.buckets = [[] for _ in range(self.capacity)]


# =============================================================================
# 3. BINARY MAX-HEAP PRIORITY QUEUE
# =============================================================================
class MaxHeap:
    """
    Binary Max-Heap Priority Queue for Top Expenses.
    Parent.amount >= Child.amount
    Index arithmetic:
        Parent = (i - 1) // 2
        Left   = 2 * i + 1
        Right  = 2 * i + 2
    """
    def __init__(self):
        self.heap: List[Dict[str, Any]] = []

    @staticmethod
    def get_parent_idx(i: int) -> int: return (i - 1) // 2
    @staticmethod
    def get_left_idx(i: int) -> int: return 2 * i + 1
    @staticmethod
    def get_right_idx(i: int) -> int: return 2 * i + 2

    def peek_max(self) -> Optional[Dict[str, Any]]:
        """Returns top expense in O(1) time."""
        return self.heap[0] if self.heap else None

    def insert(self, expense: Dict[str, Any]) -> None:
        """Inserts expense and sifts up in O(log N) time."""
        node = dict(expense)
        node['amount'] = float(node['amount'])
        self.heap.append(node)
        self._sift_up(len(self.heap) - 1)

    def _sift_up(self, index: int) -> None:
        current = index
        while current > 0:
            parent_idx = self.get_parent_idx(current)
            if self.heap[current]['amount'] > self.heap[parent_idx]['amount']:
                self.heap[current], self.heap[parent_idx] = self.heap[parent_idx], self.heap[current]
                current = parent_idx
            else:
                break

    def extract_max(self) -> Optional[Dict[str, Any]]:
        """Extracts maximum expense in O(log N) time."""
        if not self.heap:
            return None
        if len(self.heap) == 1:
            return self.heap.pop()

        max_node = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._sift_down(0)
        return max_node

    def _sift_down(self, index: int) -> None:
        current = index
        length = len(self.heap)

        while True:
            left_idx = self.get_left_idx(current)
            right_idx = self.get_right_idx(current)
            largest = current

            if left_idx < length and self.heap[left_idx]['amount'] > self.heap[largest]['amount']:
                largest = left_idx
            if right_idx < length and self.heap[right_idx]['amount'] > self.heap[largest]['amount']:
                largest = right_idx

            if largest != current:
                self.heap[current], self.heap[largest] = self.heap[largest], self.heap[current]
                current = largest
            else:
                break

    def heapify(self, expenses_list: List[Dict[str, Any]]) -> None:
        """Builds Max-Heap from an arbitrary list in O(N) linear time."""
        self.heap = [dict(x, amount=float(x['amount'])) for x in expenses_list]
        last_non_leaf = (len(self.heap) - 2) // 2
        for i in range(last_non_leaf, -1, -1):
            self._sift_down(i)

    def get_top_k(self, k: int) -> List[Dict[str, Any]]:
        """Extracts top K largest expenses without mutating the original heap."""
        temp_heap = MaxHeap()
        temp_heap.heap = [dict(node) for node in self.heap]

        top_k = []
        limit = min(k, len(temp_heap.heap))
        for _ in range(limit):
            val = temp_heap.extract_max()
            if val:
                top_k.append(val)
        return top_k

    def size(self) -> int:
        return len(self.heap)

    def clear(self) -> None:
        self.heap = []
