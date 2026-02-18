"""
Pytest configuration and fixtures.
Set test database before app is imported so settings use in-memory SQLite.
"""
import os

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("AUTO_CREATE_DB", "true")
