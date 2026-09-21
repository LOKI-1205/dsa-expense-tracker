/**
 * CustomHashMap - Hash Table Implementation using Separate Chaining
 * -----------------------------------------------------------------
 * Time Complexity:
 * - Insert / Update: Average O(1), Worst O(N)
 * - Lookup / Get: Average O(1), Worst O(N)
 * - Delete: Average O(1), Worst O(N)
 */
class CustomHashMap {
  constructor(initialCapacity = 8) {
    this.capacity = initialCapacity;
    this.size = 0;
    this.buckets = new Array(this.capacity).fill(null).map(() => []);
  }

  /**
   * DJB2 String Hashing Algorithm
   * Converts any string key into a 32-bit positive integer hash.
   */
  hash(key) {
    let hash = 5381;
    const str = String(key);
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    }
    return Math.abs(hash % this.capacity);
  }

  /**
   * Inserts or updates a key-value pair in O(1) average time.
   */
  set(key, value) {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket[i][1] = value; // Update existing key
        return;
      }
    }

    // Key doesn't exist, insert new entry
    bucket.push([key, value]);
    this.size++;

    // Rehash if load factor exceeds threshold (0.75)
    if (this.size / this.capacity > 0.75) {
      this._rehash(this.capacity * 2);
    }
  }

  /**
   * Retrieves value for given key in O(1) average time.
   */
  get(key) {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        return bucket[i][1];
      }
    }
    return undefined;
  }

  /**
   * Checks if key exists.
   */
  has(key) {
    return this.get(key) !== undefined;
  }

  /**
   * Deletes key from hash map.
   */
  delete(key) {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket.splice(i, 1);
        this.size--;
        return true;
      }
    }
    return false;
  }

  /**
   * Returns array of all [key, value] pairs.
   */
  entries() {
    const result = [];
    for (let i = 0; i < this.capacity; i++) {
      for (const pair of this.buckets[i]) {
        result.push(pair);
      }
    }
    return result;
  }

  /**
   * Returns all keys.
   */
  keys() {
    return this.entries().map(pair => pair[0]);
  }

  /**
   * Returns all values.
   */
  values() {
    return this.entries().map(pair => pair[1]);
  }

  /**
   * Clears the hash map.
   */
  clear() {
    this.size = 0;
    this.capacity = 8;
    this.buckets = new Array(this.capacity).fill(null).map(() => []);
  }

  /**
   * Internal Rehash function to double capacity and redistribute keys when load factor is high.
   */
  _rehash(newCapacity) {
    const oldEntries = this.entries();
    this.capacity = newCapacity;
    this.size = 0;
    this.buckets = new Array(this.capacity).fill(null).map(() => []);

    for (const [key, value] of oldEntries) {
      this.set(key, value);
    }
  }

  /**
   * Calculates Load Factor (N / Capacity)
   */
  getLoadFactor() {
    return (this.size / this.capacity).toFixed(2);
  }
}
