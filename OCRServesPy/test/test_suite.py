#!/usr/bin/env python3
import os
import difflib
import json
import requests

def load_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()

def send_file_to_api(b64_filepath, api_url="http://localhost:5001/api/ocr"):
    with open(b64_filepath, "r", encoding="utf-8") as f:
        b64_data = f.read()
    headers = {"Content-Type": "text/plain"}
    response = requests.post(api_url, data=b64_data, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error for {b64_filepath}: {response.status_code} - {response.text}")
        return None

def compute_similarity(text1, text2):
    # מחשב אחוז דמיון על בסיס מילים
    seq = difflib.SequenceMatcher(None, text1.split(), text2.split())
    return seq.ratio()

def main():
    # הגדר נתיבי תיקיות
    input_dir = "input"           # מכילה קבצי Base64 (סיומת .pdf.b64)
    gt_dir = "ground_truth"       # מכילה קבצי Ground Truth (סיומת .gt.txt)
    
    # ודא שהתיקיות קיימות
    if not os.path.isdir(input_dir) or not os.path.isdir(gt_dir):
        print("אנא ודא שהתיקיות 'input' ו-'ground_truth' קיימות.")
        return
    
    # מצא את כל קבצי הקלט
    input_files = sorted([f for f in os.listdir(input_dir) if f.endswith(".pdf.b64")])
    
    if not input_files:
        print("לא נמצאו קבצי קלט בתיקיית 'input'.")
        return

    results = {}
    total_similarity = 0
    count = 0

    for filename in input_files:
        base_name = filename.replace(".pdf.b64", "")
        gt_filepath = os.path.join(gt_dir, base_name + ".gt.txt")
        input_filepath = os.path.join(input_dir, filename)
        
        if not os.path.exists(gt_filepath):
            print(f"לא נמצא ground truth עבור {filename}")
            continue
        
        ground_truth = load_file(gt_filepath)
        response = send_file_to_api(input_filepath)
        if response:
            ocr_text = response.get("extractedText", "")
            similarity = compute_similarity(ground_truth, ocr_text)
            results[filename] = similarity
            total_similarity += similarity
            count += 1
            print(f"{filename}: Similarity = {similarity:.2f}")
        else:
            results[filename] = None

    if count > 0:
        avg_similarity = total_similarity / count
        print(f"\nממוצע דיוק: {avg_similarity:.2f}")
    else:
        print("לא בוצעו בדיקות מוצלחות.")

    # שמירת תוצאות למערכת קבצים (accuracy_results.json בתיקיית 'input' לדוגמה)
    with open(os.path.join(input_dir, "accuracy_results.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4)

if __name__ == "__main__":
    main()
