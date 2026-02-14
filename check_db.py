from sqlalchemy import create_engine, inspect

engine = create_engine("sqlite:///./cogniflow.db")

inspector = inspect(engine)
tables = inspector.get_table_names()

print("Tables in database:")
for table in tables:
    print("-", table)
