from cryptography.fernet import Fernet

key = Fernet.generate_key()
print("Generated Encryption Key:", key.decode())  # Copy this key
