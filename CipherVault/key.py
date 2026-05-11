from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())  # Save this key securely
