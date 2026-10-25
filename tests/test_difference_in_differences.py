import pandas as pd

from backend.difference_in_differences import (
    analyze_difference_in_differences
)


# Create simulated data
data = pd.DataFrame({
    "treatment": [0, 0, 1, 1, 0, 0, 1, 1],
    "post":      [0, 0, 0, 0, 1, 1, 1, 1],
    "sales":     [900, 950, 1000, 1050, 1100, 1150, 1500, 1550]
})

# Run Difference-in-Differences analysis
result = analyze_difference_in_differences(
    data=data,
    treatment_column="treatment",
    time_column="post",
    outcome_column="sales"
)

# Display results
print("\nDIFFERENCE-IN-DIFFERENCES RESULTS")
print("=" * 45)

for key, value in result.items():
    print(f"{key}: {value}")