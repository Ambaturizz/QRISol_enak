import os

def rep(filepath, old_str, new_str):
    with open(filepath, "r", encoding="utf-8") as f:
        c = f.read()
    c = c.replace(old_str, new_str)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(c)

rep("src/pages/HomePage.tsx", "Generate SHA-256 signature dari merchantId", "Generate SHA-256 signature from merchantId")
rep("src/pages/MerchantDashboard.tsx", "untuk juri", "for judges")
