import json
import requests
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

MAX_RETRIES = 5
MAX_WORKERS = 15
API_URL_TEMPLATE = "https://jwt-maker-nine.vercel.app/token?uid={uid}&password={password}"

def fetch_token(account):
    uid = account.get("uid")
    password = account.get("password")

    if not uid or not password:
        print(f"Invalid account entry: {account}")
        return None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            url = API_URL_TEMPLATE.format(uid=uid, password=password)
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                token = data.get("token")
                if token:
                    print(f"[{uid}] Token generated.")
                    return {"token": token}
                else:
                    print(f"[{uid}] No token found in response.")
            else:
                print(f"[{uid}] Status code: {response.status_code}")
        except Exception as e:
            print(f"[{uid}] Error (attempt {attempt}): {e}")

        time.sleep(0.5)  # slight delay between retries

    print(f"[{uid}] Failed to get token after {MAX_RETRIES} attempts.")
    return None

def main():
    start_process = input("Can I start the process? (y/n): ").strip().lower()
    if start_process != 'y':
        print("Process aborted!")
        return

    try:
        with open("ind_ind.json", "r") as file:
            accounts = json.load(file)
    except Exception as e:
        print(f"Error reading ind_ind.json: {e}")
        return

    tokens = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [executor.submit(fetch_token, acc) for acc in accounts]

        for future in as_completed(futures):
            result = future.result()
            if result:
                tokens.append(result)

    try:
        with open("token_ind.json", "w") as file:
            json.dump(tokens, file, indent=4)
        print("All tokens saved to token_ind.json.")
    except Exception as e:
        print(f"Error saving tokens: {e}")

if __name__ == "__main__":
    main()
    
    
    
    
    
    
    
    
#,                         ︵
#                        /'_/) 
#                      /¯ ../ 
#                    /'..../ 
#                  /¯ ../ 
#                /... ./
#   ¸•´¯/´¯ /' ...'/´¯`•¸  
# /'.../... /.... /.... /¯\
#('  (...´.(,.. ..(...../',    \
# \'.............. .......\'.    )      
#   \'....................._.•´/
#     \ ....................  /
#       \ .................. |
#         \  ............... |
#           \............... |
#             \ .............|
#               \............|
#                 \ .........|
#                   \ .......|
#                     \ .....|
#                       \ ...|
#                         \ .|
#                           \\
#                             \('-') 
#   ,,                           |_|\
#                               | |
#FUCKED BY JOBAYAR AHMED @JOBAYAR_AHMED 
#FUCKED BY JOBAYAR AHMED @JOBAYAR_AHMED 
#FUCKED BY JOBAYAR AHMED @JOBAYAR_AHMED 
#FUCKED BY JOBAYAR AHMED @JOBAYAR_AHMED 
#FUCKED BY JOBAYAR AHMED @JOBAYAR_AHMED 
#FUCKED BY JOBAYAR AHMED @JOBAYAR_AHMED 
#FUCKED BY JOBAYAR AHMED @JOBAYAR_AHMED