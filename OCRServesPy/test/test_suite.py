#!/usr/bin/env python3
import os
import time
import json
import requests
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys
import select
import tty
import termios
import threading
import re
import plotext as plt  # ודא שהתקנת את plotext (pip install plotext)

# הגדרות
TARGET_URL = "http://localhost:5001/api/ocr"   # כתובת שירות ה-OCR
CONTAINER_NAME = "epic_brattain"               # שם הקונטיינר (יש לעדכן לפי הצורך)
START_CONCURRENCY = 1                         # נתחיל מ-1 בקשה בו זמנית
MAX_CONCURRENCY = 10                          # נסיים ב-10 בקשות בו זמנית
STEP = 1                                      # נעלה את הקונקרנציה בהדרגה ב-1
TEST_DURATION = 10                            # כל רמת קונקרנציה תרוץ 10 שניות
STATS_INTERVAL = 5                            # נאסוף נתוני docker stats כל 5 שניות
MAX_SAFE_RESPONSE_TIME = 5                    # אם בקשה אחת לוקחת יותר מ-5 שניות, נציג אזהרה (נמשיך לבדיקה)
MAX_FAILURE_PERCENT = 50                      # אם אחוז הבקשות שנכשלו עולה על 50%, נסיים את הבדיקה

# רשימה גלובלית לעדכון נתוני הגרף (זמן, CPU %)
graph_data = []

def send_request(session, b64_file):
    headers = {"Content-Type": "text/plain"}
    with open(b64_file, "r", encoding="utf-8") as f:
        data = f.read()
    start = time.time()
    try:
        response = session.post(TARGET_URL, data=data, headers=headers, timeout=20)
        elapsed = time.time() - start
        return {"status": response.status_code, "time": elapsed}
    except Exception as e:
        elapsed = time.time() - start
        return {"status": None, "time": elapsed, "error": str(e)}

def get_docker_stats(container_name):
    try:
        output = subprocess.check_output(
            ["docker", "stats", "--no-stream", container_name],
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            timeout=10
        )
        return output.strip()
    except Exception as e:
        return f"Error getting stats: {str(e)}"

def parse_cpu_usage(stats_text):
    lines = stats_text.splitlines()
    if len(lines) < 2:
        return None
    parts = lines[1].split()
    if len(parts) >= 3:
        cpu_str = parts[2]
        try:
            return float(cpu_str.strip('%'))
        except:
            return None
    return None

def check_for_exit(timeout=0.1):
    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)
    try:
        tty.setcbreak(fd)
        rlist, _, _ = select.select([sys.stdin], [], [], timeout)
        if rlist:
            ch = sys.stdin.read(1)
            if ch == "\x18":  # Ctrl+X
                return True
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
    return False

def stress_test(input_b64_file):
    session = requests.Session()
    overall_results = []
    current_concurrency = START_CONCURRENCY

    while current_concurrency <= MAX_CONCURRENCY:
        print(f"\nTesting with concurrency: {current_concurrency}")
        end_time = time.time() + TEST_DURATION
        concurrency_results = []
        stats_logs = []
        exit_flag = False
        last_stats_time = 0

        with ThreadPoolExecutor(max_workers=current_concurrency) as executor:
            future_requests = []
            while time.time() < end_time:
                if check_for_exit(timeout=0.0):
                    print("Ctrl+X pressed. Exiting stress test.")
                    exit_flag = True
                    break

                future = executor.submit(send_request, session, input_b64_file)
                future_requests.append(future)

                current_time = time.time()
                if current_time - last_stats_time >= STATS_INTERVAL:
                    stats = get_docker_stats(CONTAINER_NAME)
                    stats_logs.append({"time": current_time, "stats": stats})
                    cpu = parse_cpu_usage(stats)
                    if cpu is not None:
                        graph_data.append((current_time, cpu))
                    print(f"[{current_time:.2f}] Docker stats:\n{stats}\n", flush=True)
                    last_stats_time = current_time
                    time.sleep(1)
                time.sleep(0.1)

            if exit_flag:
                print("Terminating test early due to manual exit.")
                break

            for future in as_completed(future_requests):
                result = future.result()
                concurrency_results.append(result)
                if result.get("time", 0) > MAX_SAFE_RESPONSE_TIME:
                    print(f"Warning: A request took {result.get('time', 0):.2f}s which exceeds the safe threshold.")

        if exit_flag:
            print("Terminating test early due to failure threshold or manual exit.")
            break

        successful = [r for r in concurrency_results if r.get("status") == 200]
        failed = [r for r in concurrency_results if r.get("status") != 200]
        total_requests = len(concurrency_results)
        failure_rate = (len(failed) / total_requests) * 100 if total_requests > 0 else 0
        avg_time = sum(r["time"] for r in successful) / len(successful) if successful else None

        round_result = {
            "concurrency": current_concurrency,
            "total_requests": total_requests,
            "successful_requests": len(successful),
            "failed_requests": len(failed),
            "failure_rate_percent": failure_rate,
            "average_response_time": avg_time,
            "stats_logs": stats_logs
        }
        overall_results.append(round_result)
        print(f"Concurrency {current_concurrency} results: {round_result}", flush=True)

        if failure_rate >= MAX_FAILURE_PERCENT:
            print(f"Failure rate {failure_rate:.2f}% exceeded threshold of {MAX_FAILURE_PERCENT}%. Terminating test.")
            break

        current_concurrency += STEP

    with open("stress_test_report.json", "w", encoding="utf-8") as f:
        json.dump(overall_results, f, indent=4)

    print("\nStress test complete. Report saved to stress_test_report.json", flush=True)
    return overall_results

def real_time_terminal_plot():
    """
    מציג גרף בזמן אמת בטרמינל באמצעות plotext.
    """
    plt.clear_figure()
    plt.title("Real-time CPU Usage")
    plt.xlabel("Time (s)")
    plt.ylabel("CPU Usage (%)")
    while True:
        if graph_data:
            times, cpus = zip(*graph_data)
            plt.clf()
            plt.plot(times, cpus, marker="dot", color="blue")
            plt.show()
        time.sleep(0.5)

if __name__ == "__main__":
    input_file = "input/BOLdemo_generated_1.pdf.b64"
    if not os.path.isfile(input_file):
        print(f"Input file {input_file} not found.")
        exit(1)

    # הרצת בדיקת העומס בתור נושא נפרד
    stress_thread = threading.Thread(target=stress_test, args=(input_file,))
    stress_thread.start()

    # הרצת הגרף בזמן אמת בטרמינל עם plotext
    real_time_terminal_plot()

    stress_thread.join()
