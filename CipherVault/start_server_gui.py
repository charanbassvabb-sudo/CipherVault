import tkinter as tk
import subprocess

def run_server():
    subprocess.Popen(["uvicorn", "main:app", "--reload"])

root = tk.Tk()
root.title("CipherVault Server Launcher")
root.geometry("300x150")

start_button = tk.Button(root, text="Start Server", command=run_server, font=("Arial", 14), bg="green", fg="white")
start_button.pack(pady=40)

root.mainloop()
