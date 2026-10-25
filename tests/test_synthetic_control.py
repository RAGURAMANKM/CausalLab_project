import pandas as pd

from backend.synthetic_control import analyze_synthetic_control


# Create simulated sales data for three stores
data = pd.DataFrame({
    "store": [
        "Store_A", "Store_A", "Store_A", "Store_A",
        "Store_B", "Store_B", "Store_B", "Store_B",
        "Store_C", "Store_C", "Store_C", "Store_C"
    ],
    "time": [
        1, 2, 3, 4,
        1, 2, 3, 4,
        1, 2, 3, 4
    ],
    "sales": [
        100, 110, 150, 160,
        90, 100, 100, 110,
        110, 120, 120, 130
    ]
})

# Run synthetic control analysis
result = analyze_synthetic_control(
    data=data,
    unit_column="store",
    time_column="time",
    outcome_column="sales",
    treated_unit="Store_A",
    intervention_time=3
)

# Display results
print("\nSYNTHETIC CONTROL RESULTS")
print("=" * 45)

for key, value in result.items():
    print(f"{key}: {value}")