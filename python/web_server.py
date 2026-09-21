"""
=============================================================================
TRACKPULSE — PYTHON HTTP WEB SERVER BACKEND
=============================================================================
Runs the web app locally using Python's built-in http.server module.
Command to launch: python python/web_server.py
"""

import os
import sys
import json
from http.server import SimpleHTTPRequestHandler, HTTPServer

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, PROJECT_ROOT)

from dsa import DynamicArray, CustomHashMap, MaxHeap

PORT = 8000
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# DSA Engine Instances in Python
transactions_array = DynamicArray(initial_capacity=8)
category_hashmap = CustomHashMap(initial_capacity=8)
max_heap = MaxHeap()
monthly_budget = 50000.0


class TrackPulseHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Custom HTTP handler serving web static files and Python DSA endpoints."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PROJECT_ROOT, **kwargs)

    def do_GET(self):
        if self.path.startswith('/api/dsa/summary'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

            summary = {
                'total_spending': sum(exp['amount'] for exp in transactions_array.to_list()),
                'monthly_budget': monthly_budget,
                'dynamic_array_size': transactions_array.size,
                'dynamic_array_capacity': transactions_array.capacity,
                'hashmap_size': category_hashmap.size,
                'hashmap_capacity': category_hashmap.capacity,
                'hashmap_load_factor': category_hashmap.get_load_factor(),
                'heap_max_expense': max_heap.peek_max(),
                'top_expenses': max_heap.get_top_k(5),
                'category_breakdown': category_hashmap.entries()
            }
            self.wfile.write(json.dumps(summary).encode('utf-8'))
            return
        
        # Fallback to serving static HTML/CSS/JS files
        return super().do_GET()


def run_python_web_server():
    os.chdir(PROJECT_ROOT)
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, TrackPulseHTTPRequestHandler)
    print("=========================================================================")
    print(f"TrackPulse Python Web Application Server Running at http://localhost:{PORT}")
    print("=========================================================================")
    print(f"Serving static files & Python DSA Engine from: {PROJECT_ROOT}")
    print("Press Ctrl+C to stop server.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Python web server. Goodbye!")
        httpd.server_close()


if __name__ == '__main__':
    run_python_web_server()
