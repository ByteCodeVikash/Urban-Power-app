import subprocess
import time
import os
import sys
import json
import urllib.request
import urllib.error
import redis

def wait_for_port(port, timeout=10.0):
    start_time = time.time()
    while True:
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/health", timeout=1.0) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            pass
        if time.time() - start_time > timeout:
            raise TimeoutError(f"Server on port {port} did not start in {timeout} seconds")
        time.sleep(0.5)

def make_request(url, data=None):
    req = urllib.request.Request(url)
    req.add_header('Content-Type', 'application/json')
    payload = json.dumps(data).encode('utf-8') if data else None
    
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, data=payload, timeout=15.0) as resp:
            content = resp.read().decode('utf-8')
            duration = (time.time() - start_time) * 1000
            return resp.status, json.loads(content), duration
    except urllib.error.HTTPError as e:
        content = e.read().decode('utf-8')
        duration = (time.time() - start_time) * 1000
        try:
            body = json.loads(content)
        except Exception:
            body = content
        return e.code, body, duration
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        return 0, str(e), duration

def main():
    print("Starting Uvicorn Server on port 8081...")
    env = os.environ.copy()
    env["SMS_MOCK"] = "false"
    
    # Run uvicorn server
    server_process = subprocess.Popen(
        ["./venv/bin/uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8081"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        env=env
    )
    
    try:
        wait_for_port(8081)
        print("Uvicorn Server started successfully.")
        
        # Connect to local Redis
        r_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
        
        # Test 1: Send OTP 1 (Cold start for SMS simulation)
        print("\n--- TEST 1: send-otp 1 (Cold Connection) ---")
        code, body, client_dur1 = make_request("http://127.0.0.1:8081/api/v1/auth/send-otp", {"phone": "+919999999901"})
        print(f"Status: {code}, Client duration: {client_dur1:.2f}ms")
        
        # Retrieve OTP 1 from Redis
        otp1_data = r_client.get("otp:+919999999901")
        otp1 = None
        if otp1_data:
            otp1 = json.loads(otp1_data).get("otp")
            print(f"Retrieved OTP 1 from Redis: {otp1}")
        
        # Test 2: Send OTP 2 (Warm connection - reuse SMS simulation)
        print("\n--- TEST 2: send-otp 2 (Warm Connection - Reused) ---")
        code, body, client_dur2 = make_request("http://127.0.0.1:8081/api/v1/auth/send-otp", {"phone": "+919999999902"})
        print(f"Status: {code}, Client duration: {client_dur2:.2f}ms")
        
        # Retrieve OTP 2 from Redis
        otp2_data = r_client.get("otp:+919999999902")
        otp2 = None
        if otp2_data:
            otp2 = json.loads(otp2_data).get("otp")
            print(f"Retrieved OTP 2 from Redis: {otp2}")
            
        # Test 3: Verify OTP 1 (Standard Redis OTP Verification)
        if otp1:
            print("\n--- TEST 3: verify-otp 1 (Redis Verification) ---")
            code, body, verify_redis_dur1 = make_request("http://127.0.0.1:8081/api/v1/auth/verify-otp", {"phone": "+919999999901", "otp": otp1})
            print(f"Status: {code}, Client duration: {verify_redis_dur1:.2f}ms")
            
        # Test 4: Verify OTP 2 (Standard Redis OTP Verification - Warm)
        if otp2:
            print("\n--- TEST 4: verify-otp 2 (Redis Verification - Warm) ---")
            code, body, verify_redis_dur2 = make_request("http://127.0.0.1:8081/api/v1/auth/verify-otp", {"phone": "+919999999902", "otp": otp2})
            print(f"Status: {code}, Client duration: {verify_redis_dur2:.2f}ms")

        # Test 5: Verify Firebase Token 1 (Cold Connection to Google)
        print("\n--- TEST 5: verify-otp Firebase Token 1 (Cold Connection to Google) ---")
        code, body, fb_dur1 = make_request("http://127.0.0.1:8081/api/v1/auth/verify-otp", {"phone": "+919999999901", "otp": "eyJ-google-call-1"})
        print(f"Status: {code}, Client duration: {fb_dur1:.2f}ms")
        
        # Test 6: Verify Firebase Token 2 (Warm Connection to Google - Reused)
        print("\n--- TEST 6: verify-otp Firebase Token 2 (Warm Connection to Google - Reused) ---")
        code, body, fb_dur2 = make_request("http://127.0.0.1:8081/api/v1/auth/verify-otp", {"phone": "+919999999902", "otp": "eyJ-google-call-2"})
        print(f"Status: {code}, Client duration: {fb_dur2:.2f}ms")
        
    finally:
        print("\nShutting down Uvicorn Server...")
        server_process.terminate()
        try:
            server_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server_process.kill()
            
        # Print server logs
        print("\n=== SERVER LOGS ===")
        logs = server_process.stdout.read()
        print(logs)
        
        # Save logs to a file for parsing/report
        with open("optimized_profiler_output.log", "w") as f:
            f.write(logs)
        print("Logs saved to optimized_profiler_output.log")

if __name__ == "__main__":
    main()
